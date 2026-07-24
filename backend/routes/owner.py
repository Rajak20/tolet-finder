import uuid
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from supabase import create_client
from config import Config
from utils.geocode import geocode_address

owner_bp = Blueprint('owner', __name__)
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def require_logged_in():
    claims = get_jwt()
    return claims.get('role') in ('user', 'admin')

@owner_bp.route('/properties', methods=['GET'])
@jwt_required()
def my_properties():
    owner_id = get_jwt_identity()
    result = supabase.table('properties').select('*, property_images(*)').eq('owner_id', owner_id).execute()
    return jsonify(result.data)

# @owner_bp.route('/properties', methods=['POST'])
# @jwt_required()
# def create_property():
#     owner_id = get_jwt_identity()
#     data = request.get_json()

#     required = ['contact_name', 'contact_mobile', 'rent', 'bhk', 'address']
#     missing = [f for f in required if not data.get(f)]
#     if missing:
#         return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

#     result = supabase.table('properties').insert({
#         'owner_id': owner_id,
#         'title': f"{data['bhk']} at {data['address'][:40]}",
#         'contact_name': data['contact_name'],
#         'contact_mobile': data['contact_mobile'],
#         'contact_whatsapp': data.get('contact_whatsapp') or data['contact_mobile'],
#         'contact_email': data.get('contact_email'),
#         'rent': data['rent'],
#         'bhk': data['bhk'],
#         'address': data['address'],
#         'status': 'pending'
#     }).execute()

#     return jsonify(result.data[0]), 201

@owner_bp.route('/properties', methods=['POST'])
@jwt_required()
def create_property():
    owner_id = get_jwt_identity()
    data = request.get_json()

    required = ['contact_name', 'contact_mobile', 'rent', 'bhk', 'address']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({'error': f'Missing fields: {", ".join(missing)}'}), 400

    lat, lng = geocode_address(data['address'])

    result = supabase.table('properties').insert({
        'owner_id': owner_id,
        'title': f"{data['bhk']} at {data['address'][:40]}",
        'contact_name': data['contact_name'],
        'contact_mobile': data['contact_mobile'],
        'contact_whatsapp': data.get('contact_whatsapp') or data['contact_mobile'],
        'contact_email': data.get('contact_email'),
        'rent': data['rent'],
        'bhk': data['bhk'],
        'address': data['address'],
        'latitude': lat,
        'longitude': lng,
        'status': 'approved'
    }).execute()

    return jsonify(result.data[0]), 201

@owner_bp.route('/properties/<property_id>', methods=['PUT'])
@jwt_required()
def update_property(property_id):
    owner_id = get_jwt_identity()
    existing = supabase.table('properties').select('owner_id').eq('id', property_id).single().execute()
    if existing.data['owner_id'] != owner_id:
        return jsonify({'error': 'Not your listing'}), 403

    data = request.get_json()
    result = supabase.table('properties').update(data).eq('id', property_id).execute()
    return jsonify(result.data[0])

@owner_bp.route('/properties/<property_id>', methods=['DELETE'])
@jwt_required()
def delete_property(property_id):
    owner_id = get_jwt_identity()
    existing = supabase.table('properties').select('owner_id').eq('id', property_id).single().execute()
    if existing.data['owner_id'] != owner_id:
        return jsonify({'error': 'Not your listing'}), 403

    images = supabase.table('property_images').select('image_url').eq('property_id', property_id).execute()
    for img in images.data:
        try:
            path = img['image_url'].split('/property-images/')[-1]
            supabase.storage.from_('property-images').remove([path])
        except Exception:
            pass

    supabase.table('properties').delete().eq('id', property_id).execute()
    return jsonify({'message': 'Deleted'}), 200

@owner_bp.route('/properties/<property_id>/mark-rented', methods=['PATCH'])
@jwt_required()
def mark_rented(property_id):
    owner_id = get_jwt_identity()
    existing = supabase.table('properties').select('owner_id').eq('id', property_id).single().execute()
    if existing.data['owner_id'] != owner_id:
        return jsonify({'error': 'Not your listing'}), 403

    supabase.table('properties').update({'status': 'rented'}).eq('id', property_id).execute()
    return jsonify({'message': 'Marked as rented'})


# routes/owner.py (add this)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@owner_bp.route('/properties/<property_id>/images', methods=['POST'])
@jwt_required()
def upload_images(property_id):
    owner_id = get_jwt_identity()
    existing = supabase.table('properties').select('owner_id').eq('id', property_id).single().execute()
    if existing.data['owner_id'] != owner_id:
        return jsonify({'error': 'Not your listing'}), 403

    files = request.files.getlist('images')
    uploaded_urls = []

    for file in files:
        if not file.filename or not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type: {file.filename}'}), 400

        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': f'{file.filename} exceeds 10MB limit'}), 400

        filename = f"{property_id}/{uuid.uuid4()}_{secure_filename(file.filename)}"
        file_bytes = file.read()

        supabase.storage.from_('property-images').upload(
            filename, file_bytes, {'content-type': file.content_type}
        )
        public_url = supabase.storage.from_('property-images').get_public_url(filename)

        supabase.table('property_images').insert({
            'property_id': property_id,
            'image_url': public_url,
            'is_primary': len(uploaded_urls) == 0
        }).execute()
        uploaded_urls.append(public_url)

    return jsonify({'images': uploaded_urls}), 201