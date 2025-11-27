// src/components/Login.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 

const API_URL = import.meta.env.VITE_API_URL;

function Login() { 
  const { login } = useAuth(); 
  
  // ✨ FIX: State changed to 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✨ FIX: Sending 'email' to match backend expectation
      const response = await axios.post(`${API_URL}/login`, {
        email, 
        password,
      });

      const { token, user } = response.data;
      login(token, user); 
      
      setEmail(''); 
      setPassword(''); 

    } catch (err) {
      const message = err.response?.data?.message || 'Server error. Please try again.';
      setError(message);
      setPassword(''); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Client Portal Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* ✨ FIX: Label and Input type updated to Email */}
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      
      <p>
        Don't have an account? 
        <Link to="/register">Register Here!</Link>
      </p>
      
    </div>
  );
}

export default Login;