from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from supabase import create_client
from config import Config
import math
from utils.geocode import geocode_address

properties_bp = Blueprint('properties', __name__)
supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat, dlon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))

@properties_bp.route('', methods=['GET'])
def search_properties():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 12))
    location_query = request.args.get('location')

    query = supabase.table('properties').select('*, property_images(*)').eq('status', 'approved')

    if bhk := request.args.get('bhk'):
        query = query.eq('bhk', bhk)
    if min_rent := request.args.get('min_rent', type=float):
        query = query.gte('rent', min_rent)
    if max_rent := request.args.get('max_rent', type=float):
        query = query.lte('rent', max_rent)

    result = query.execute()
    properties = result.data

    if location_query:
        # First try simple text match on address — always works, no external API needed
        text_matches = [p for p in properties if location_query.lower() in p['address'].lower()]

        # Then try geocoded distance match as a supplement
        search_lat, search_lng = geocode_address(location_query)
        geo_matches = []
        if search_lat is not None:
            radius_km = 20
            for p in properties:
                if p.get('latitude') and p.get('longitude'):
                    dist = haversine(search_lat, search_lng, p['latitude'], p['longitude'])
                    if dist <= radius_km:
                        p['_distance'] = round(dist, 1)
                        geo_matches.append(p)

        # Merge both, avoiding duplicates, text matches first
        seen_ids = set()
        merged = []
        for p in text_matches + geo_matches:
            if p['id'] not in seen_ids:
                merged.append(p)
                seen_ids.add(p['id'])
        properties = merged

    total = len(properties)
    start = (page - 1) * limit
    paged = properties[start:start + limit]

    return jsonify({'properties': paged, 'total': total, 'page': page, 'total_pages': (total + limit - 1) // limit})

@properties_bp.route('/<property_id>', methods=['GET'])
def get_property(property_id):
    result = supabase.table('properties').select('*, property_images(*)').eq('id', property_id).single().execute()
    supabase.table('properties').update({'views': result.data['views'] + 1}).eq('id', property_id).execute()
    return jsonify(result.data)

@properties_bp.route('/<property_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(property_id):
    user_id = get_jwt_identity()
    existing = supabase.table('favorites').select('id').eq('user_id', user_id).eq('property_id', property_id).execute()
    if existing.data:
        supabase.table('favorites').delete().eq('id', existing.data[0]['id']).execute()
        return jsonify({'favorited': False})
    supabase.table('favorites').insert({'user_id': user_id, 'property_id': property_id}).execute()
    return jsonify({'favorited': True})

@properties_bp.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    result = supabase.table('favorites')\
        .select('property_id, properties(id, title, rent, bhk, address, property_images(image_url))')\
        .eq('user_id', user_id).execute()
    return jsonify([r['properties'] for r in result.data])

@properties_bp.route('/batch', methods=['GET'])
def get_properties_batch():
    ids = request.args.get('ids', '')
    id_list = [i for i in ids.split(',') if i]
    if not id_list:
        return jsonify([])
    result = supabase.table('properties').select('id, title, rent, bhk, address, property_images(image_url)').in_('id', id_list).execute()
    return jsonify(result.data)