import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Use the ENV variable, fallback to localhost if missing
const API_URL = import.meta.env.VITE_FIT_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [profileComplete, setProfileComplete] = useState(null);

  const navigate = useNavigate();

  // Fetch whether the user has completed their fitness profile setup
  const fetchProfile = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`${API_URL}/api/user/profile`);
      const complete = !!res.data.profileComplete;
      setProfileComplete(complete);
      return complete;
    } catch (e) {
      console.error('Failed to load profile:', e);
      setProfileComplete(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // Check for token on app start
    const storedToken = localStorage.getItem('fitAuthToken');
    const storedUser = localStorage.getItem('fitUser');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
        fetchProfile();
      } catch (e) {
        // If JSON fails, clear corrupted data
        console.error("Failed to parse user data", e);
        localStorage.removeItem('fitAuthToken');
        localStorage.removeItem('fitUser');
      }
    }
    setIsLoading(false);
  }, [fetchProfile]);

  // --------------------------------------------------------
  // 👇 LOGIN FUNCTION (Updated Path)
  // --------------------------------------------------------
  const login = async (email, password) => {
    try {
      // Points to /api/auth/login
      const response = await axiosInstance.post(`${API_URL}/api/auth/login`, { email, password });

      // Extract data from Backend Response
      const { token, user: userData } = response.data;

      // Save valid credentials
      localStorage.setItem('fitAuthToken', token);
      localStorage.setItem('fitUser', JSON.stringify(userData));

      setUser(userData);
      setIsLoggedIn(true);
      setEmailVerificationRequired(false);

      // Determine onboarding status so the app can route to setup first
      const complete = await fetchProfile();

      return { ...response.data, profileComplete: !!complete };

    } catch (error) {
      console.error("Login Request Failed:", error);

      // Differentiate: unverified email vs wrong credentials vs network
      if (error.response?.data?.message?.includes('verify your email')) {
        setEmailVerificationRequired(true);
        throw new Error(
          'Please verify your email before logging in. Check your inbox or request a new verification link.'
        );
      }

      throw new Error(error.response?.data?.message || 'Login failed. Please check your network.');
    }
  };

  // Resend verification email (requires backend endpoint: POST /api/auth/resend-verification)
  const resendVerificationEmail = async (email) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/auth/resend-verification`, { email, app: 'fit' });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  const logout = () => {
    localStorage.removeItem('fitAuthToken');
    localStorage.removeItem('fitUser');
    setUser(null);
    setIsLoggedIn(false);
    setEmailVerificationRequired(false);
    setProfileComplete(null);
    navigate('/fit/login');
  };

  // --------------------------------------------------------
  // 👇 REGISTER FUNCTION (Updated Path)
  // --------------------------------------------------------
  const registerUser = async (registrationData) => {
    try {
      // Points to /api/auth/register
      const response = await axiosInstance.post(`${API_URL}/api/auth/register`, { ...registrationData, app: 'fit' });

      // NOTE: We do NOT automatically log them in anymore because they need to verify email first.
      // We just return success so the form can show the "Check your email" message.

      return { success: true, message: response.data.message };

    } catch (error) {
      console.error("Registration Error:", error);
      if (error.response) {
        console.error("Backend Response:", error.response.data);
      }
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
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        logout,
        registerUser,
        resendVerificationEmail,
        emailVerificationRequired,
        profileComplete,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};