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
    // Check for token on app start
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (e) {
        // If JSON fails, clear corrupted data
        console.error("Failed to parse user data", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);
  
  // --------------------------------------------------------
  // 👇 FIXED LOGIN FUNCTION
  // Now accepts (email, password), calls API, and saves REAL token
  // --------------------------------------------------------
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      // Extract data from Backend Response
      const { token, user: userData } = response.data;

      // Save valid credentials
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsLoggedIn(true);

      // Return the data so Login.jsx can handle the redirect logic
      return response.data;

    } catch (error) {
      console.error("Login Request Failed:", error);
      // Throw error so Login.jsx can display the red box
      throw new Error(error.response?.data?.message || 'Login failed. Please check your network.');
    }
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
      const response = await axios.post(`${API_URL}/register`, registrationData); 
      
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