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
  // 👇 FIXED LOGIN FUNCTION (Updated Path)
  // --------------------------------------------------------
  const login = async (email, password) => {
    try {
      // 👇 CHANGED: Points to /api/auth/login
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      // Extract data from Backend Response
      const { token, user: userData } = response.data;

      // Save valid credentials
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsLoggedIn(true);

      return response.data;

    } catch (error) {
      console.error("Login Request Failed:", error);
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
  
  // --------------------------------------------------------
  // 👇 FIXED REGISTER FUNCTION (Updated Path)
  // --------------------------------------------------------
  const registerUser = async (registrationData) => {
    try {
      // 👇 CHANGED: Points to /api/auth/register
      const response = await axios.post(`${API_URL}/api/auth/register`, registrationData); 
      
      // NOTE: We do NOT automatically log them in anymore because they need to verify email first.
      // We just return success so the form can show the "Check your email" message.
      
      return { success: true, message: response.data.message };
      
    } catch (error) {
      console.error("Registration Error:", error);
      if (error.response) {
        console.error("Backend Response:", error.response.data);
      }
      
      // Better Error Handling: Check for Validation Arrays or Standard Messages
      let errorMsg = 'Registration failed. Please try again.';
      if (error.response?.data?.errors) {
          // Join multiple validation errors (e.g. "Invalid email, Password too short")
          errorMsg = error.response.data.errors.map(err => err.msg).join(', ');
      } else if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
      }

      return { 
        success: false, 
        message: errorMsg,
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