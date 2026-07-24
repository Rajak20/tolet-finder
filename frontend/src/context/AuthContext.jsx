import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, mobile) => {
  const res = await api.post('/auth/register', { name, email, password, mobile });
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  setUser(res.data.user);
  return res.data.user;
  };

  const forgotPasswordSendOtp = async (email) => {
  const res = await api.post('/auth/forgot-password/send-otp', { email });
  return res.data;
  };

  const resetPassword = async (email, otp, new_password) => {
  const res = await api.post('/auth/reset-password', { email, otp, new_password });
  return res.data;
  };


  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // add inside AuthProvider, alongside login/register
  const sendOtp = async (email) => {
    const res = await api.post('/auth/send-otp', { email });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    return res.data;
  };

// add to the context value:
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, sendOtp, verifyOtp, forgotPasswordSendOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);