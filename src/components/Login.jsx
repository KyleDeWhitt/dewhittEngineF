import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard'); 
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                
                {/* Header */}
                <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '10px' }}>
                    Welcome <span style={{ color: '#FFD700' }}>Back</span>
                </h2>
                <p style={{ color: '#888', marginBottom: '40px' }}>
                    Access your DeWhitt Designs dashboard.
                </p>

                {/* Error Message */}
                {error && (
                    <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff6b6b', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label className="auth-label">EMAIL ADDRESS</label>
                        <input 
                            type="email" 
                            className="auth-input" 
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">PASSWORD</label>
                        <input 
                            type="password" 
                            className="auth-input" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ width: '100%', padding: '15px', borderRadius: '50px', background: '#FFD700', color: 'black', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '10px' }}
                    >
                        {loading ? 'Accessing...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer Link */}
                <div style={{ marginTop: '30px', color: '#ccc' }}>
                    Don't have an account? <Link to="/register" className="auth-link">Start a Project</Link>
                </div>

            </div>
        </div>
    );
}

export default Login;