import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape } from '../theme';

function RegistrationForm() {
    const { registerUser } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

        const result = await registerUser(formData);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const inp = { width: '100%', padding: '9px 4px', background: 'transparent', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1.05rem', color: T.ink, outline: 'none', boxSizing: 'border-box', borderRadius: 0 };
    const lbl = { fontFamily: MARKER, fontSize: '0.78rem', color: T.pencil, display: 'block', margin: '18px 0 4px' };

    if (success) {
        return (
            <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: T.ink, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
                <div style={{ width: '100%', maxWidth: 440 }}>
                    <Paper style={{ padding: '32px', textAlign: 'center' }}>
                        <Tape rotate={-2}>you're in</Tape>
                        <MarkerTitle style={{ fontSize: '2rem', marginTop: 14 }}>Check Your <span style={{ background: T.highYellow, padding: '0 4px' }}>Inbox</span></MarkerTitle>
                        <p style={{ fontSize: '1.05rem', color: T.inkSoft, marginTop: 10 }}>account created for <strong>{formData.email}</strong>.</p>
                        <div style={{ background: T.highYellow, border: `1px solid ${T.ruled}`, padding: 12, borderRadius: 6, marginTop: 18, fontFamily: FONT }}>
                            click the verification link in your email to activate your account.
                        </div>
                        <Link to="/fit/login" style={{ display: 'inline-block', marginTop: 20, fontFamily: FONT, color: T.blue, fontWeight: 700 }}>back to sign in</Link>
                    </Paper>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: T.ink, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <Paper style={{ padding: '30px 32px 32px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Tape rotate={2}>join up</Tape>
                        <MarkerTitle style={{ fontSize: '2.2rem', marginTop: 14 }}>Start Your <span style={{ background: T.highPink, padding: '0 4px' }}>Journal</span></MarkerTitle>
                        <p style={{ fontSize: '1rem', color: T.inkSoft, marginTop: 6 }}>a few details to get you in the books.</p>
                    </div>

                    {error && (
                        <div style={{ background: T.highPink, border: `1px solid ${T.margin}`, color: T.ink, fontWeight: 700, padding: 10, borderRadius: 6, marginTop: 18, fontFamily: FONT, fontSize: '0.9rem' }}>{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={lbl}>FIRST NAME</label>
                                <input name="first_name" type="text" value={formData.first_name} onChange={handleChange} placeholder="Kyle" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>LAST NAME</label>
                                <input name="last_name" type="text" value={formData.last_name} onChange={handleChange} placeholder="DeWhitt" style={inp} />
                            </div>
                        </div>

                        <label style={lbl}>EMAIL</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" style={inp} />

                        <label style={lbl}>PASSWORD</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022'} style={inp} />

                        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 26, fontFamily: MARKER, fontSize: '1.1rem', background: T.highGreen, border: '1px solid #9ccd7a', borderRadius: 8, padding: '13px', cursor: 'pointer', color: T.ink, boxShadow: '0 2px 6px rgba(0,0,0,0.1)', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'creating\u2026' : 'create account'}
                        </button>
                    </form>

                    <div style={{ marginTop: 22, textAlign: 'center', fontFamily: FONT, color: T.inkSoft }}>
                        already have one? <Link to="/fit/login" style={{ color: T.blue, fontWeight: 700 }}>sign in</Link>
                    </div>
                </Paper>
            </div>
        </div>
    );
}

export default RegistrationForm;