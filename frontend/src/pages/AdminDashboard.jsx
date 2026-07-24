import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/properties/pending').then(res => setPending(res.data));
    api.get('/admin/reports').then(res => setReports(res.data));
    api.get('/admin/analytics').then(res => setStats(res.data));
  }, []);

  const approve = async (id) => {
    await api.patch(`/admin/properties/${id}/approve`);
    setPending(prev => prev.filter(p => p.id !== id));
  };

  const reject = async (id) => {
    const reason = prompt('Reason for rejection:', 'Did not meet listing guidelines');
    if (reason === null) return;
    await api.patch(`/admin/properties/${id}/reject`, { reason });
    setPending(prev => prev.filter(p => p.id !== id));
  };

  const deleteReportedProperty = async (propertyId, reportId) => {
  if (!confirm('Remove this listing permanently?')) return;
  await api.delete(`/admin/properties/${propertyId}`);
  setReports(prev => prev.filter(r => r.id !== reportId));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ["Total Users", stats.total_users],
            ['Users with Listings', stats.Users_with_Listings],
            ["Active Listings", stats.active_listings],
            ["Rented Properties", stats.rented_properties],
          ].map(([label, value]) => (
            <div key={label} className="border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">
        Pending Approvals ({pending.length})
      </h2>
      <div className="grid gap-3 mb-8">
        {pending.map((p) => (
          <div
            key={p.id}
            className="border rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-500">
                Owner: {p.users?.name} · ₹{p.rent}/mo
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => approve(p.id)}
                className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => reject(p.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <p className="text-gray-400">No pending listings.</p>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-3">
        Open Reports ({reports.length})
      </h2>
      <div className="grid gap-3">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-gray-800 border border-gray-700 rounded-2xl p-5 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-white">{r.properties?.title}</p>
              <p className="text-sm text-gray-400">Reason: {r.reason}</p>
            </div>
            <button
              onClick={() => deleteReportedProperty(r.property_id, r.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition"
            >
              Remove Listing
            </button>
          </div>
        ))}
        {reports.length === 0 && (
          <p className="text-gray-400">No open reports.</p>
        )}
      </div>
    </div>
  );
}