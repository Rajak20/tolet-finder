from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from supabase import create_client
from config import Config
from utils.email import send_approval_email, send_rejection_email  # reuse your existing Gmail SMTP setup

admin_bp = Blueprint('admin', __name__)
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def require_admin():
    return get_jwt().get('role') == 'admin'

@admin_bp.route('/properties/pending', methods=['GET'])
@jwt_required()
def pending_properties():
    if not require_admin():
        return jsonify({'error': 'Admin access only'}), 403
    result = supabase.table('properties').select('*, users(name, email)').eq('status', 'pending').execute()
    return jsonify(result.data)

@admin_bp.route('/properties/<property_id>/approve', methods=['PATCH'])
@jwt_required()
def approve_property(property_id):
    if not require_admin():
        return jsonify({'error': 'Admin access only'}), 403
    result = supabase.table('properties').select('*, users(email, name)').eq('id', property_id).single().execute()
    supabase.table('properties').update({'status': 'approved'}).eq('id', property_id).execute()
    send_approval_email(result.data['users']['email'], result.data['title'])
    return jsonify({'message': 'Approved'})

@admin_bp.route('/properties/<property_id>/reject', methods=['PATCH'])
@jwt_required()
def reject_property(property_id):
    if not require_admin():
        return jsonify({'error': 'Admin access only'}), 403
    reason = request.get_json().get('reason', 'Did not meet listing guidelines')
    result = supabase.table('properties').select('*, users(email, name)').eq('id', property_id).single().execute()
    supabase.table('properties').update({'status': 'rejected'}).eq('id', property_id).execute()
    send_rejection_email(result.data['users']['email'], result.data['title'], reason)
    return jsonify({'message': 'Rejected'})

@admin_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_reports():
    if not require_admin():
        return jsonify({'error': 'Admin access only'}), 403
    result = supabase.table('reports').select('*, properties(title)').eq('status', 'pending').execute()
    return jsonify(result.data)

@admin_bp.route('/users/<user_id>/suspend', methods=['PATCH'])
@jwt_required()
def suspend_user(user_id):
    if not require_admin():
        return jsonify({'error': 'Admin access only'}), 403
    supabase.table('users').update({'is_suspended': True}).eq('id', user_id).execute()
    return jsonify({'message': 'User suspended'})

@admin_bp.route('/analytics', methods=['GET'])
@jwt_required()
def analytics():
    if get_jwt().get('role') != 'admin':
        return jsonify({'error': 'Admin access only'}), 403
    total_users = supabase.table('users').select('id', count='exact').execute()
    total_listers = supabase.table('properties').select('owner_id', count='exact').execute()
    active = supabase.table('properties').select('id', count='exact').eq('status', 'approved').execute()
    rented = supabase.table('properties').select('id', count='exact').eq('status', 'rented').execute()
    return jsonify({
        'total_users': total_users.count,
        'Users_with_Listings': len(set(r['owner_id'] for r in total_listers.data)),
        'active_listings': active.count,
        'rented_properties': rented.count
    })

# backend/routes/admin.py
@admin_bp.route('/properties/<property_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_property(property_id):
    if get_jwt().get('role') != 'admin':
        return jsonify({'error': 'Admin access only'}), 403

    images = supabase.table('property_images').select('image_url').eq('property_id', property_id).execute()
    for img in images.data:
        try:
            path = img['image_url'].split('/property-images/')[-1]
            supabase.storage.from_('property-images').remove([path])
        except Exception:
            pass

    supabase.table('properties').delete().eq('id', property_id).execute()
    return jsonify({'message': 'Listing removed'}), 200