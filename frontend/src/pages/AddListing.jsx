import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { handleImageUpload } from '../utils/imageUpload';

export default function AddListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    contact_name: '', contact_mobile: '', contact_whatsapp: '',
    contact_email: '', rent: '', bhk: '1BHK', address: ''
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/owner/properties', {
        ...form,
        rent: parseFloat(form.rent)
      });

      if (images.length > 0) {
        await handleImageUpload(res.data.id, images);
      }

      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-900 px-6 py-12">
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-2">List Your Property</h1>
        <p className="text-gray-400 text-sm">Fill in the details below — it'll be live in seconds.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-5 text-left">

        {/* Photo Upload */}
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-2 text-left">Property Photos</label>
          <label
            htmlFor="photo-upload"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-600 hover:border-emerald-500 rounded-xl py-8 px-4 cursor-pointer transition bg-gray-900/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-sm text-gray-400">
              {images.length > 0 ? `${images.length} photo${images.length > 1 ? 's' : ''} selected` : 'Click to upload photos'}
            </span>
            <span className="text-xs text-gray-600">PNG, JPG up to 10MB each</span>
          </label>
          <input id="photo-upload" type="file" multiple accept="image/*" onChange={e => setImages(Array.from(e.target.files))}
            className="hidden" />
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((file, i) => (
                <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700">
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-gray-700" />

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Your Name</label>
          <input name="contact_name" placeholder="e.g. Rajak M" required onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Mobile Number</label>
            <input name="contact_mobile" placeholder="10-digit number" required onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">WhatsApp Number</label>
            <input name="contact_whatsapp" placeholder="If different" onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
          <input name="contact_email" type="email" placeholder="your@email.com" onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Rent per month</label>
            <input name="rent" type="number" placeholder="₹ 15000" required onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">BHK</label>
            <select name="bhk" onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>1BHK</option>
              <option>2BHK</option>
              <option>3BHK</option>
              <option>4BHK+</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Full Address</label>
          <input name="address" placeholder="House no, street, area, city" required onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600" />
        </div>

        <button disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition mt-2">
          {loading ? 'Submitting...' : 'Submit Listing'}
        </button>
      </form>
    </div>
  </div>
);
}