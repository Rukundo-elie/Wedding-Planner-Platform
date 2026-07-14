import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set smart base URL for API calls (Vercel -> Render or Local)
  const getBaseURL = () => {
    let url = import.meta.env.VITE_API_URL;
    if (url) {
      url = url.trim().replace(/\/$/, '');
      if (!url.endsWith('/api')) {
        url = `${url}/api`;
      }
      return url;
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000/api';
    }
    return '/api';
  };

  axios.defaults.baseURL = getBaseURL();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        logout();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoading(false);
  }, [token, logout]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: userToken, user: userData } = response.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (error) {
      if (!error.response) {
        throw 'Cannot reach the server. Make sure the backend is running on port 5000.';
      }
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (name, email, phone, password, role) => {
    try {
      const response = await axios.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role,
      });
      const { token: userToken, user: userData } = response.data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await axios.post('/auth/google', { credential });
      const { token: userToken, user: userData } = response.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || 'Google sign-in failed';
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Unable to request a password reset';
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Unable to reset password';
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithGoogle,
    register,
    requestPasswordReset,
    resetPassword,
    logout,
    isAuthenticated: Boolean(token && user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
