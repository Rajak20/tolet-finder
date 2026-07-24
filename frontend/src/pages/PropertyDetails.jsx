import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    api.get(`/properties/${id}`).then(res => setProperty(res.data));

    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updated = [id, ...viewed.filter(v => v !== id)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {property.property_images?.length > 0 ? (
            property.property_images.map(img => (
              <img key={img.id} src={img.image_url} className="rounded-2xl w-full h-64 object-cover border border-gray-700" />
            ))
          ) : (
            <div className="col-span-2 h-64 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-600">
              No photos available
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <span className="inline-block bg-emerald-600/15 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {property.bhk}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{property.title}</h1>
          <p className="text-gray-400 mb-4">{property.address}</p>
          <p className="text-3xl font-extrabold text-emerald-400 mb-6">
            ₹{property.rent}<span className="text-base text-gray-400 font-normal">/month</span>
          </p>

          <div className="flex gap-3 flex-wrap">
            <a href={`tel:${property.contact_mobile}`}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition">
              Call
            </a>
            <a href={`https://wa.me/${property.contact_whatsapp}`} target="_blank" rel="noreferrer"
              className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition">
              WhatsApp
            </a>
            {property.contact_email && (
              <a href={`mailto:${property.contact_email}`}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition">
                Email
              </a>
            )}
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.address)}`}
              target="_blank" rel="noreferrer"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition">
              Directions
            </a>
          </div>
        </div>

        {/* Contact Person Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Listed by</h2>
          <p className="text-white font-medium">{property.contact_name}</p>
        </div>

      </div>
    </div>
  );
}