// src/components/RegistrationForm.jsx (CLEANED UP - NO MORE MAPPING)

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 

function RegistrationForm() {
  const { registerUser } = useAuth(); 
    
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(''); 
  const [loading, setLoading] = useState(false); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    // Basic required field check
    for (const key in formData) {
      if (formData[key].trim() === '') {
        setError(`Please fill out the ${key.replace(/_/g, ' ')} field.`);
        return false;
      }
    }

    // Password Match Check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    // Simple email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address.');
        return false;
    }

    return true; 
  };

  // Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Prepare data by removing confirmPassword
    const { confirmPassword, ...formDataToSend } = formData; 

    // 🔑 FIXED: No more manual mapping! Frontend fields match backend requirements.
    const dataToSend = {
      ...formDataToSend,
      role: 'Member', 
    };

    const result = await registerUser(dataToSend);

    if (result.success) {
      console.log('Registration complete! Navigating to setup...');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  // --- JSX Rendering ---
  return (
    <form onSubmit={handleSubmit}>
      <h2>💪 Create Your Account</h2>

      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        placeholder="First Name"
        required
      />

      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />
      
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email Address"
        required
      />
      
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
      />

      <input
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm Password"
        required
      />

      {/* Display Error Message */}
      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {/* Submit Button */}
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Register'}
      </button>

      {/* Use Link for client-side navigation */}
      <p>Already have an account? <Link to="/login">Log In</Link></p>
    </form>
  );
}

export default RegistrationForm;