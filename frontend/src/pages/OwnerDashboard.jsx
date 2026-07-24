import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function OwnerDashboard() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    api.get('/owner/properties').then(res => setProperties(res.data));
  }, []);

  const markRented = async (id) => {
    await api.patch(`/owner/properties/${id}/mark-rented`);
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'rented' } : p));
  };

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/owner/properties/${id}`);
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const statusStyles = {
    approved: 'bg-emerald-500/15 text-emerald-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    rented: 'bg-gray-600/30 text-gray-400',
    rejected: 'bg-red-500/15 text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">My Listings</h1>
          <Link to="/owner/add-listing"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition">
            + List New Property
          </Link>
        </div>

        <div className="grid gap-4">
          {properties.map(p => (
            <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white mb-1">{p.title}</h3>
                <p className="text-sm text-gray-400 mb-2">₹{p.rent}/mo · {p.views} views</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[p.status] || 'bg-gray-700 text-gray-300'}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex gap-2">
                {p.status === 'approved' && (
                  <button onClick={() => markRented(p.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition">
                    Mark Rented
                  </button>
                )}
                <button onClick={() => deleteListing(p.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <p className="text-gray-500 text-center py-16">You haven't listed any properties yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}