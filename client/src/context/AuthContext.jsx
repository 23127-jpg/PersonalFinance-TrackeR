import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const BASE_URL = 'https://personalfinance-tracker.onrender.com';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync token to Axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user info on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/auth/me`, { timeout: 10000 });
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          // Clear invalid token without triggering another loadUser cycle
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user profile:', err.response?.data?.error || err.message);
        // Clear invalid token without triggering another loadUser cycle
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register User
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, { username, email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { usernameOrEmail, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Login failed';
      setError(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/logout`, {}, { timeout: 5000 });
    } catch (err) {
      console.warn('Silent API logout warning:', err.message);
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};