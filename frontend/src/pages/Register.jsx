import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { sendOtp, verifyOtp, register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: details, 2: otp
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
        name: '', email: '', password: '', mobile: '', otp: ''
});

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await sendOtp(form.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await verifyOtp(form.email, form.otp);
      await register(form.name, form.email, form.password, form.mobile);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 border rounded-xl bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {step === 1 ? 'Create Account' : 'Verify Your Email'}
      </h1>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <input name="name" placeholder="Full Name" required onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
          <input name="email" type="email" placeholder="Email" required onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
          <input name="password" type="password" placeholder="••••••••" minLength={8} required onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
          <input name="mobile" placeholder="Mobile Number" required onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
          <button disabled={loading} className="w-full bg-emerald-600 text-white py-2 rounded-lg">
            {loading ? 'Sending OTP...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyAndRegister} className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-300">
            We sent a 6-digit code to {form.email}
          </p>
          <input name="otp" placeholder="Enter OTP" required maxLength={6} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 tracking-widest text-center dark:bg-gray-700 dark:text-white" />
          <button disabled={loading} className="w-full bg-emerald-600 text-white py-2 rounded-lg">
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </form>
      )}
    </div>
  );
}