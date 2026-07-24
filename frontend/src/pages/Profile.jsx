import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setProfile(res.data);
      setForm({ name: res.data.name, mobile: res.data.mobile || '' });
    });

    api.get('/properties/favorites').then(res => setFavorites(res.data));

    const viewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    if (viewedIds.length) {
      api.get(`/properties/batch?ids=${viewedIds.join(',')}`).then(res => {
        const ordered = viewedIds.map(id => res.data.find(p => p.id === id)).filter(Boolean);
        setRecentlyViewed(ordered);
      });
    }
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const res = await api.put('/auth/me', form);
    setProfile(res.data);
    setEditing(false);
    setMessage('Profile updated');
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/auth/me/password', passwordForm);
      setPasswordForm({ current_password: '', new_password: '' });
      setMessage('Password changed successfully');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const inputClass = "w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600";

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        {/* Profile Info */}
        <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-white">My Profile</h2>
            <button onClick={() => setEditing(e => !e)} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!editing ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Name</p>
                <p className="text-white">{profile.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-white">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Mobile</p>
                <p className="text-white">{profile.mobile || '—'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputClass} placeholder="Name" />
              <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                className={inputClass} placeholder="Mobile" />
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition">
                Save Changes
              </button>
            </form>
          )}
        </section>

        {/* Change Password */}
        <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-5">Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <input type="password" placeholder="Current Password" required
              value={passwordForm.current_password}
              onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
              className={inputClass} />
            <input type="password" placeholder="New Password" required
              value={passwordForm.new_password}
              onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
              className={inputClass} />
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl font-medium transition">
              Update Password
            </button>
          </form>
        </section>

        {/* Favorites */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Saved Properties ({favorites.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {favorites.map(p => (
              <Link to={`/property/${p.id}`} key={p.id}
                className="card-hover bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <img src={p.property_images?.[0]?.image_url || '/placeholder.jpg'} className="w-full h-28 object-cover" />
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-white truncate">{p.title}</h3>
                  <p className="text-emerald-400 font-bold text-sm">₹{p.rent}/mo</p>
                </div>
              </Link>
            ))}
            {favorites.length === 0 && <p className="text-gray-500 col-span-3">No saved properties yet.</p>}
          </div>
        </section>

        {/* Recently Viewed */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyViewed.map(p => (
              <Link to={`/property/${p.id}`} key={p.id}
                className="card-hover bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <img src={p.property_images?.[0]?.image_url || '/placeholder.jpg'} className="w-full h-28 object-cover" />
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-white truncate">{p.title}</h3>
                  <p className="text-emerald-400 font-bold text-sm">₹{p.rent}/mo</p>
                </div>
              </Link>
            ))}
            {recentlyViewed.length === 0 && <p className="text-gray-500 col-span-3">Nothing viewed yet.</p>}
          </div>
        </section>

      </div>
    </div>
  );
}