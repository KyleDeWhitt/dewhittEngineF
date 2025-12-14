import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    businessName: '',
    industry: 'Technology',
    websiteType: 'Landing Page',
    designStyle: 'Minimalist'
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

    if (!formData.businessName) {
        setError("Please enter your business name.");
        setLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      await axios.put(`${API_URL}/api/setup-profile/${user.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile setup complete');
      navigate('/dashboard'); 

    } catch (err) {
      console.error('Profile Setup Error:', err);
      
      const message = err.response?.data?.message || 'Failed to save profile.';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Please log in again.");
      } else {
          setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'Partner';

  return (
    <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'left' }}>
            
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '10px', textAlign: 'center' }}>
                Mission <span style={{ color: '#FFD700' }}>Briefing</span>
            </h2>
            <p style={{ color: '#888', marginBottom: '30px', textAlign: 'center' }}>
                Welcome aboard, {firstName}. Tell us about your brand so we can calibrate the engine.
            </p>

            {error && (
                <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="auth-input-group">
                    <label className="auth-label">BUSINESS / PROJECT NAME</label>
                    <input 
                        type="text" 
                        name="businessName" 
                        className="auth-input"
                        value={formData.businessName} 
                        onChange={handleChange} 
                        placeholder="e.g. DeWhitt Designs" 
                        required 
                    />
                </div>

                <div className="auth-input-group">
                    <label className="auth-label">INDUSTRY</label>
                    <select 
                        name="industry" 
                        className="auth-input"
                        value={formData.industry} 
                        onChange={handleChange}
                        style={{ appearance: 'none' }} 
                    >
                        <option value="Technology">Technology / SaaS</option>
                        <option value="E-Commerce">E-Commerce</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="auth-input-group">
                        <label className="auth-label">WEBSITE GOAL</label>
                        <select name="websiteType" className="auth-input" value={formData.websiteType} onChange={handleChange}>
                            <option value="Landing Page">Landing Page</option>
                            <option value="Portfolio">Portfolio</option>
                            <option value="Web App">Web Application</option>
                            <option value="Blog">Content / Blog</option>
                        </select>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">AESTHETIC</label>
                        <select name="designStyle" className="auth-input" value={formData.designStyle} onChange={handleChange}>
                            <option value="Minimalist">Minimalist</option>
                            <option value="Futuristic">Futuristic / 3D</option>
                            <option value="Corporate">Corporate</option>
                            <option value="Playful">Playful / Vibrant</option>
                        </select>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ width: '100%', padding: '15px', borderRadius: '50px', background: '#FFD700', color: 'black', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '20px', border: 'none', cursor: 'pointer' }}
                >
                    {loading ? 'Initializing...' : 'Launch Dashboard 🚀'}
                </button>
            </form>
        </div>
    </div>
  );
}

export default ProfileSetup;