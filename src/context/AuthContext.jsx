// src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Use the ENV variable, fallback to localhost if missing
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 

  const navigate = useNavigate();
  
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);
  
  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    navigate('/dashboard'); 
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login'); 
  };
  
  const registerUser = async (registrationData) => {
    try {
      // ✨ FIX: Use the API_URL variable
      const response = await axios.post(`${API_URL}/register`, registrationData); 
      
      // ✨ FIX: Logic now works because Backend sends token
      const { token, user: userData } = response.data; 
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsLoggedIn(true);
      
      navigate('/setup-profile'); 
      return { success: true };
      
    } catch (error) {
      console.error("Registration Error:", error.response ? error.response.data : error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  if (isLoading) {
      return <div>Loading Application...</div>; 
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};