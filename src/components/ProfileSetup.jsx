// src/components/ProfileSetup.jsx (UPDATED)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 🔑 FIXED: Use correct relative path
import axiosInstance from '../api/axiosInstance'; 

function ProfileSetup() {  // 🔑 Changed from SetupProfile to ProfileSetup
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    height: '',
    currentWeight: '',
    goalWeight: '',
    unit: 'lbs'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.height || !formData.currentWeight || !formData.goalWeight) {
        setError("Please fill out all metric fields.");
        setLoading(false);
        return;
    }

    try {
      // ✨ FIX: Removed the redundant '/user' from the path
      const response = await axiosInstance.put(`/setup-profile/${user.id}`, formData); 
      
      console.log('Profile setup complete:', response.data);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Profile Setup Error:', error);
      const message = error.response?.data?.message || 'Failed to save profile.';
      
      if (error.response?.status === 401 || error.response?.status === 403) {
          setError("Session expired. Please log in again.");
      } else {
          setError(message);
      }
    }
    setLoading(false);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="profile-setup-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>👋 Welcome, {firstName}!</h2>
      <p>Let's set your initial metrics to personalize your journey.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Height (inches)</label>
            <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="e.g., 70" required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Unit</label>
            <select name="unit" value={formData.unit} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                <option value="lbs">Pounds (lbs)</option>
                <option value="kg">Kilograms (kg)</option>
            </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginMargin: '5px' }}>Current Weight ({formData.unit})</label>
            <input type="number" name="currentWeight" value={formData.currentWeight} onChange={handleChange} placeholder="e.g., 180" required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Goal Weight ({formData.unit})</label>
            <input type="number" name="goalWeight" value={formData.goalWeight} onChange={handleChange} placeholder="e.g., 165" required style={{ width: '100%', padding: '8px' }} />
        </div>

        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Saving...' : 'Complete Profile Setup'}
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup;