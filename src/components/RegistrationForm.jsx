import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function RegistrationForm() {
    const navigate = useNavigate();
    const { login } = useAuth(); // Auto-login after register
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }

        setLoading(true);
        // Use environment variable for API URL
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        try {
            const res = await axios.post(`${API_URL}/register`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password
            });

            if (res.data.success) {
                // Attempt to auto-login with the new credentials
                try {
                    await login(formData.email, formData.password);
                    navigate('/dashboard'); 
                } catch (loginErr) {
                    // If auto-login fails, just send to login page
                    navigate('/login');
                }
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.response?.data?.message || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                
                <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '10px' }}>
                    Start <span style={{ color: '#FFD700' }}>Building</span>
                </h2>
                <p style={{ color: '#888', marginBottom: '30px' }}>
                    Create your account to launch your platform.
                </p>

                {error && (
                    <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    
                    {/* Name Fields Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="auth-input-group">
                            <label className="auth-label">FIRST NAME</label>
                            <input name="first_name" type="text" className="auth-input" required onChange={handleChange} />
                        </div>
                        <div className="auth-input-group">
                            <label className="auth-label">LAST NAME</label>
                            <input name="last_name" type="text" className="auth-input" required onChange={handleChange} />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">EMAIL ADDRESS</label>
                        <input name="email" type="email" className="auth-input" required onChange={handleChange} />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">PASSWORD</label>
                        <input name="password" type="password" className="auth-input" required onChange={handleChange} />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">CONFIRM PASSWORD</label>
                        <input name="confirmPassword" type="password" className="auth-input" required onChange={handleChange} />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '15px', borderRadius: '50px', background: '#FFD700', color: 'black', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', color: '#ccc' }}>
                    Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
                </div>

            </div>
        </div>
    );
}

export default RegistrationForm;