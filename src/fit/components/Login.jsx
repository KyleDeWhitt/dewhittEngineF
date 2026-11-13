import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape } from '../theme';

const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, emailVerificationRequired, resendVerificationEmail } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setEmailError('');
        setPasswordError('');

        let isValid = true;
        if (!email) {
            setEmailError('Email is required.');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address.');
            isValid = false;
        }

        if (!password) {
            setPasswordError('Password is required.');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            isValid = false;
        }

        if (!isValid) return;

        setLoading(true);
        try {
            const response = await login(email, password);
            navigate(response.profileComplete ? '/fit/dashboard' : '/fit/setup-profile');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!email || !validateEmail(email)) {
            setError('Please enter a valid email to resend verification.');
            return;
        }
        try {
            await resendVerificationEmail(email);
            setError('Verification email resent! Please check your inbox.');
        } catch (err) {
            setError(err.message || 'Failed to resend verification email.');
        }
    };

    const inp = { width: '100%', padding: '9px 4px', background: 'transparent', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1.05rem', color: T.ink, outline: 'none', boxSizing: 'border-box', borderRadius: 0 };
    const lbl = { fontFamily: MARKER, fontSize: '0.78rem', color: T.pencil, display: 'block', margin: '18px 0 4px' };

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: T.ink, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <Paper style={{ padding: '30px 32px 32px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Tape rotate={-2}>welcome back</Tape>
                        <MarkerTitle style={{ fontSize: '2.2rem', marginTop: 14 }}>Sign <span style={{ background: T.highYellow, padding: '0 4px' }}>In</span></MarkerTitle>
                        <p style={{ fontSize: '1rem', color: T.inkSoft, marginTop: 6 }}>back to the journal.</p>
                    </div>

                    {error && (
                        <div style={{ background: T.highPink, border: `1px solid ${T.margin}`, color: T.ink, fontWeight: 700, padding: 10, borderRadius: 6, marginTop: 18, fontFamily: FONT, fontSize: '0.9rem' }}>{error}</div>
                    )}

                    {emailVerificationRequired && (
                        <div style={{ background: T.highYellow, border: `1px solid ${T.ruled}`, padding: 12, borderRadius: 6, marginTop: 18, fontFamily: FONT }}>
                            <div style={{ fontWeight: 700 }}>check your inbox &amp; verify first.</div>
                            <button type="button" onClick={handleResendVerification} style={{ marginTop: 8, fontFamily: FONT, background: 'none', border: 'none', color: T.blue, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
                                resend verification email
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label style={lbl}>EMAIL</label>
                        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ ...inp, borderBottomColor: emailError ? T.margin : T.ruled }} />
                        {emailError && <div style={{ fontFamily: FONT, color: T.margin, fontSize: '0.8rem', marginTop: 4 }}>{emailError}</div>}

                        <label style={lbl}>PASSWORD</label>
                        <input type="password" placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022'} value={password} onChange={(e) => setPassword(e.target.value)} required style={{ ...inp, borderBottomColor: passwordError ? T.margin : T.ruled }} />
                        {passwordError && <div style={{ fontFamily: FONT, color: T.margin, fontSize: '0.8rem', marginTop: 4 }}>{passwordError}</div>}

                        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 26, fontFamily: MARKER, fontSize: '1.1rem', background: T.highGreen, border: '1px solid #9ccd7a', borderRadius: 8, padding: '13px', cursor: 'pointer', color: T.ink, boxShadow: '0 2px 6px rgba(0,0,0,0.1)', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'opening\u2026' : 'open the journal'}
                        </button>
                    </form>

                    <div style={{ marginTop: 22, textAlign: 'center', fontFamily: FONT, color: T.inkSoft }}>
                        no account yet? <Link to="/fit/register" style={{ color: T.blue, fontWeight: 700 }}>join up</Link>
                    </div>
                </Paper>
            </div>
        </div>
    );
}

export default Login;