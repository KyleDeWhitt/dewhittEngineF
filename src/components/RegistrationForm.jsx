import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function RegistrationForm() {
    const { registerUser } = useAuth();
    
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false); // New state to track success
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        // Call the updated registerUser function
        const result = await registerUser(formData);

        if (result.success) {
            setSuccess(true); // 👇 Show the success message instead of redirecting
        } else {
            setError(result.message);
        }
        
        setLoading(false);
    };

    // 👇 Render this "Success View" if registration worked
    if (success) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif",
                color: 'white',
                textAlign: 'center'
            }}>
                <div style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '40px', 
                    borderRadius: '16px', 
                    maxWidth: '400px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <h2 style={{ color: '#10b981', fontSize: '2rem', marginBottom: '10px' }}>✅ Success!</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                        Account created for <strong>{formData.email}</strong>.
                    </p>
                    <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #FFD700', marginBottom: '20px' }}>
                        <p style={{ margin: 0, color: '#FFD700' }}>
                            Please check your inbox and click the verification link to activate your account.
                        </p>
                    </div>
                    <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Standard Registration Form
    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ 
                width: '100%', 
                maxWidth: '400px', 
                padding: '40px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px', fontSize: '1.8rem' }}>
                    Create Account
                </h2>

                {error && <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px', display: 'block' }}>FIRST NAME</label>
                            <input 
                                name="first_name" 
                                type="text" 
                                placeholder="Jane"
                                value={formData.first_name} 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px', display: 'block' }}>LAST NAME</label>
                            <input 
                                name="last_name" 
                                type="text" 
                                placeholder="Doe"
                                value={formData.last_name} 
                                onChange={handleChange} 
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px', display: 'block' }}>EMAIL ADDRESS</label>
                        <input 
                            name="email" 
                            type="email" 
                            placeholder="name@company.com"
                            value={formData.email} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <label style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '5px', display: 'block' }}>PASSWORD</label>
                        <input 
                            name="password" 
                            type="password" 
                            placeholder="••••••••"
                            value={formData.password} 
                            onChange={handleChange} 
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            marginTop: '10px', 
                            padding: '14px', 
                            background: '#FFD700', 
                            color: '#000', 
                            fontWeight: 'bold', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '20px', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: '#FFD700', textDecoration: 'none' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default RegistrationForm;