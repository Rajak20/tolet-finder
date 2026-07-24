import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPasswordSendOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', otp: '', new_password: '', confirm_password: '' });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await forgotPasswordSendOtp(form.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (form.new_password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(form.email, form.otp, form.new_password);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-gray-600";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">
            {step === 1 ? 'Forgot Password' : 'Reset Password'}
          </h1>
          <p className="text-gray-400 text-sm">
            {step === 1 ? "We'll send a code to your email." : `Enter the code sent to ${form.email}`}
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Email</label>
                <input name="email" type="email" placeholder="your@email.com" required onChange={handleChange} className={inputClass} />
              </div>
              <button disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition mt-2">
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} className="space-y-4 text-left">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Verification Code</label>
                <input name="otp" placeholder="6-digit code" required maxLength={6} onChange={handleChange}
                  className={`${inputClass} tracking-widest text-center`} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">New Password</label>
                <input name="new_password" type="password" placeholder="••••••••" required onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1.5">Confirm New Password</label>
                <input name="confirm_password" type="password" placeholder="••••••••" required onChange={handleChange} className={inputClass} />
              </div>
              <button disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition mt-2">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}