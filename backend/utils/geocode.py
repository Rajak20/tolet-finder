import requests

def geocode_address(address):
    """Convert an address string into (lat, lng) using OpenStreetMap Nominatim. Returns (None, None) on failure."""
    try:
        response = requests.get(
            'https://nominatim.openstreetmap.org/search',
            params={'q': address, 'format': 'json', 'limit': 1},
            headers={'User-Agent': 'ToLetFinder/1.0'},
            timeout=5
        )
        results = response.json()
        if results:
            return float(results[0]['lat']), float(results[0]['lon'])
    except Exception:
        pass
    return None, None