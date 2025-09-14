// frontend/src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login } from '../utils/api'; //  Import  login function

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    if (token && userEmail) {
      setUser({ email: userEmail });
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const { token, user: userData } = await login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userData.email);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);