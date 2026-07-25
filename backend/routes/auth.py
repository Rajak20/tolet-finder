from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from supabase import create_client
from config import Config
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import limiter

auth_bp = Blueprint('auth', __name__)
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

# @auth_bp.route('/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     role = data.get('role', 'tenant')  # tenant or owner
#     if role not in ('tenant', 'owner'):
#         return jsonify({'error': 'Invalid role'}), 400

#     existing = supabase.table('users').select('id').eq('email', data['email']).execute()
#     if existing.data:
#         return jsonify({'error': 'Email already registered'}), 409

#     hashed = generate_password_hash(data['password'])
#     result = supabase.table('users').insert({
#         'name': data['name'],
#         'email': data['email'],
#         'password_hash': hashed,
#         'mobile': data.get('mobile'),
#         'role': role
#     }).execute()

#     user = result.data[0]
#     token = create_access_token(identity=user['id'], additional_claims={'role': role})
#     return jsonify({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'role': role}}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    result = supabase.table('users').select('*').eq('email', data['email']).execute()
    if not result.data:
        return jsonify({'error': 'Invalid credentials'}), 401

    user = result.data[0]
    if user['is_suspended']:
        return jsonify({'error': 'Account suspended'}), 403
    if not check_password_hash(user['password_hash'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(identity=user['id'], additional_claims={'role': user['role']})
    return jsonify({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'role': user['role']}}), 200

from datetime import datetime, timedelta
from utils.email import generate_otp, send_otp_email

# @auth_bp.route('/send-otp', methods=['POST'])
# def send_otp():
#     email = request.get_json().get('email')

#     existing_user = supabase.table('users').select('id').eq('email', email).execute()
#     if existing_user.data:
#         return jsonify({'error': 'Email already registered'}), 409

#     otp_code = generate_otp()
#     expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

#     supabase.table('otp_verifications').insert({
#         'email': email,
#         'otp_code': otp_code,
#         'expires_at': expires_at
#     }).execute()

#     send_otp_email(email, otp_code)
#     return jsonify({'message': 'OTP sent'}), 200


@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    try:
        email = request.get_json().get('email')
        print("Email:", email)

        existing_user = supabase.table('users').select('id').eq('email', email).execute()

        if existing_user.data:
            return jsonify({'error': 'Email already registered'}), 409

        otp_code = generate_otp()
        print("OTP:", otp_code)

        expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

        print("Saving OTP...")
        supabase.table('otp_verifications').insert({
            'email': email,
            'otp_code': otp_code,
            'expires_at': expires_at
        }).execute()

        print("Sending email...")
        send_otp_email(email, otp_code)

        print("Done")
        return jsonify({'message': 'OTP sent'}), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email, otp_code = data.get('email'), data.get('otp')

    result = supabase.table('otp_verifications')\
        .select('*').eq('email', email).eq('otp_code', otp_code)\
        .order('created_at', desc=True).limit(1).execute()

    if not result.data:
        return jsonify({'error': 'Invalid OTP'}), 400

    record = result.data[0]
    if datetime.fromisoformat(record['expires_at']) < datetime.utcnow():
        return jsonify({'error': 'OTP expired'}), 400

    supabase.table('otp_verifications').update({'verified': True}).eq('id', record['id']).execute()
    return jsonify({'message': 'OTP verified'}), 200


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    otp_check = supabase.table('otp_verifications')\
        .select('verified').eq('email', data['email'])\
        .order('created_at', desc=True).limit(1).execute()

    if not otp_check.data or not otp_check.data[0]['verified']:
        return jsonify({'error': 'Email not verified'}), 403

    existing = supabase.table('users').select('id').eq('email', data['email']).execute()
    if existing.data:
        return jsonify({'error': 'Email already registered'}), 409

    hashed = generate_password_hash(data['password'])
    result = supabase.table('users').insert({
        'name': data['name'],
        'email': data['email'],
        'password_hash': hashed,
        'mobile': data.get('mobile'),
        'role': 'user'
    }).execute()

    user = result.data[0]
    token = create_access_token(identity=user['id'], additional_claims={'role': 'user'})
    return jsonify({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'role': 'user'}}), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    result = supabase.table('users').select('id, name, email, mobile, role, created_at').eq('id', user_id).single().execute()
    return jsonify(result.data)

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()

    updates = {}
    if 'name' in data:
        updates['name'] = data['name']
    if 'mobile' in data:
        updates['mobile'] = data['mobile']

    if not updates:
        return jsonify({'error': 'Nothing to update'}), 400

    result = supabase.table('users').update(updates).eq('id', user_id).execute()
    return jsonify(result.data[0])

@auth_bp.route('/me/password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()

    user = supabase.table('users').select('password_hash').eq('id', user_id).single().execute()
    if not check_password_hash(user.data['password_hash'], data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401

    new_hash = generate_password_hash(data['new_password'])
    supabase.table('users').update({'password_hash': new_hash}).eq('id', user_id).execute()
    return jsonify({'message': 'Password updated'})


@auth_bp.route('/forgot-password/send-otp', methods=['POST'])
def forgot_password_send_otp():
    email = request.get_json().get('email')

    user = supabase.table('users').select('id').eq('email', email).execute()
    if not user.data:
        return jsonify({'error': 'No account found with this email'}), 404

    otp_code = generate_otp()
    expires_at = (datetime.utcnow() + timedelta(minutes=10)).isoformat()

    supabase.table('otp_verifications').insert({
        'email': email,
        'otp_code': otp_code,
        'expires_at': expires_at
    }).execute()

    send_otp_email(email, otp_code)
    return jsonify({'message': 'OTP sent'}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email, otp_code, new_password = data.get('email'), data.get('otp'), data.get('new_password')

    result = supabase.table('otp_verifications')\
        .select('*').eq('email', email).eq('otp_code', otp_code)\
        .order('created_at', desc=True).limit(1).execute()
    
    if len(new_password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if not result.data:
        return jsonify({'error': 'Invalid OTP'}), 400

    record = result.data[0]
    if datetime.fromisoformat(record['expires_at']) < datetime.utcnow():
        return jsonify({'error': 'OTP expired'}), 400

    user = supabase.table('users').select('id').eq('email', email).execute()
    if not user.data:
        return jsonify({'error': 'No account found with this email'}), 404

    new_hash = generate_password_hash(new_password)
    supabase.table('users').update({'password_hash': new_hash}).eq('id', user.data[0]['id']).execute()
    supabase.table('otp_verifications').update({'verified': True}).eq('id', record['id']).execute()

    return jsonify({'message': 'Password reset successful'}), 200