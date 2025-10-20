import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('techCycleUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('techCycleUser', JSON.stringify(response.user));
      setUser(response.user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // Store token and user data
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('techCycleUser', JSON.stringify(response.user));
      setUser(response.user);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techCycleUser');
    localStorage.removeItem('authToken');
    // Clear verification data to prevent showing old verification status
    localStorage.removeItem('sellerVerifications');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isSeller = () => {
    return user && user.role === 'seller' && user.isVerified === true;
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    isAdmin,
    isSeller,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
