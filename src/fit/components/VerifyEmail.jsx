import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape } from '../theme';

const API_URL = import.meta.env.VITE_FIT_API_URL || 'http://localhost:3000';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setStatus('error');
                return;
            }
            try {
                await axiosInstance.post(`${API_URL}/api/auth/verify-email`, { token });
                setStatus('success');
                setTimeout(() => navigate('/fit/login'), 3000);
            } catch (error) {
                console.error('Verification failed:', error);
                setStatus('error');
            }
        };
        verifyToken();
    }, [searchParams, navigate]);

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: T.ink, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
                <Paper style={{ padding: '34px 32px' }}>
                    <Tape rotate={-2}>email check</Tape>

                    {status === 'verifying' && (
                        <>
                            <MarkerTitle style={{ fontSize: '2rem', marginTop: 14 }}>Checking<span style={{ color: T.pencil }}>…</span></MarkerTitle>
                            <p style={{ fontSize: '1.05rem', color: T.inkSoft, marginTop: 10 }}>confirming your email, one sec.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <MarkerTitle style={{ fontSize: '2rem', marginTop: 14 }}>All <span style={{ background: T.highGreen, padding: '0 4px' }}>Set</span>!</MarkerTitle>
                            <p style={{ fontSize: '1.05rem', color: T.inkSoft, marginTop: 10 }}>your email is verified.</p>
                            <p style={{ fontSize: '0.9rem', color: T.pencil, marginTop: 8 }}>sending you to sign in…</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <MarkerTitle style={{ fontSize: '1.9rem', marginTop: 14 }}>Hmm, that <span style={{ background: T.highPink, padding: '0 4px' }}>link…</span></MarkerTitle>
                            <p style={{ fontSize: '1.05rem', color: T.inkSoft, marginTop: 10 }}>looks expired or invalid.</p>
                            <button onClick={() => navigate('/fit/login')}
                                style={{ marginTop: 22, fontFamily: MARKER, fontSize: '1rem', background: T.highGreen, border: '1px solid #9ccd7a', borderRadius: 8, padding: '11px 22px', cursor: 'pointer', color: T.ink }}>
                                back to sign in
                            </button>
                        </>
                    )}
                </Paper>
            </div>
        </div>
    );
}

export default VerifyEmail;