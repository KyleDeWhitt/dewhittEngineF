import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape, Highlight } from '../theme';

const API_URL = import.meta.env.VITE_FIT_API_URL || 'http://localhost:3000';

const GOALS = [
    { value: 'lose', label: 'Lose Fat' },
    { value: 'build', label: 'Build Muscle' },
    { value: 'maintain', label: 'Maintain' },
    { value: 'endurance', label: 'Endurance' },
];

const LEVELS = [
    { value: 'sedentary', label: 'Sedentary \u00B7 little exercise' },
    { value: 'light', label: 'Light \u00B7 1\u20133 sessions/wk' },
    { value: 'moderate', label: 'Moderate \u00B7 3\u20135 sessions/wk' },
    { value: 'active', label: 'Active \u00B7 6\u20137 sessions/wk' },
    { value: 'very', label: 'Athlete \u00B7 2\u00D7/day' },
];

function ProfileSetup() {
    const { user, fetchProfile } = useAuth();
    const navigate = useNavigate();

    const [unit, setUnit] = useState('imperial');
    const [goalType, setGoalType] = useState('lose');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [currentWeight, setCurrentWeight] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [activityLevel, setActivityLevel] = useState('moderate');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const unitLabel = unit === 'metric' ? 'kg' : 'lb';
    const heightLabel = unit === 'metric' ? 'cm' : 'in';

    const inp = { width: '100%', padding: '8px 4px', background: 'transparent', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1.05rem', color: T.ink, boxSizing: 'border-box', outline: 'none', borderRadius: 0 };
    const lbl = { fontFamily: MARKER, fontSize: '0.8rem', color: T.pencil, margin: '16px 0 4px' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!gender || !age || !height || !currentWeight || !goalWeight) {
            setError('Fill in everything so we can set your plan.');
            return;
        }
        setLoading(true);
        const payload = { unit, goalType, gender, age: Number(age), height: Number(height), currentWeight: Number(currentWeight), goalWeight: Number(goalWeight), startWeight: Number(currentWeight), activityLevel };
        try {
            await axiosInstance.put(`${API_URL}/api/user/setup-profile/${user.id}`, payload);
            await fetchProfile();
            navigate('/fit/dashboard');
        } catch (err) {
            console.error('Profile Setup Error:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Session expired. Log in again.');
            } else {
                setError(err.response?.data?.message || 'Failed to save.');
            }
        } finally {
            setLoading(false);
        }
    };

    const firstName = user?.first_name || 'Athlete';

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: T.ink, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: 560 }}>
                <Paper style={{ padding: '28px 30px 30px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Tape rotate={-2}>first things first</Tape>
                        <MarkerTitle style={{ fontSize: '2rem', marginTop: 12 }}>Set Your <Highlight color={T.highPink} style={{ padding: '0 4px' }}>Goal</Highlight></MarkerTitle>
                        <p style={{ fontSize: '1rem', color: T.inkSoft, margin: '6px 0 0' }}>
                            Hey {firstName} &mdash; a quick calibration so we can build your plan.
                        </p>
                    </div>

                    {error && <div style={{ background: T.highPink, border: `1px solid ${T.margin}`, color: T.ink, fontWeight: 700, fontFamily: FONT, fontSize: '0.95rem', padding: 10, borderRadius: 6, marginTop: 16 }}>&#9888; {error}</div>}

                    <div style={lbl}>GOAL</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {GOALS.map(g => (
                            <button key={g.value} type="button" onClick={() => setGoalType(g.value)}
                                style={{
                                    padding: '13px', borderRadius: 6, cursor: 'pointer', fontFamily: FONT, fontSize: '1.05rem', fontWeight: 700, color: T.ink,
                                    background: goalType === g.value ? T.highYellow : '#fffdf6',
                                    border: goalType === g.value ? `2px solid ${T.margin}` : `2px solid ${T.ruled}`,
                                }}>
                                {g.label}
                            </button>
                        ))}
                    </div>

                    <div style={lbl}>UNITS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {['imperial', 'metric'].map(u => (
                            <button key={u} type="button" onClick={() => setUnit(u)}
                                style={{ padding: '11px', borderRadius: 6, cursor: 'pointer', fontFamily: FONT, fontSize: '1rem', fontWeight: 700, color: T.ink, textTransform: 'lowercase',
                                    background: unit === u ? T.highGreen : '#fffdf6', border: unit === u ? `2px solid #9ccd7a` : `2px solid ${T.ruled}` }}>
                                {u === 'imperial' ? 'lb / in' : 'kg / cm'}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <div style={lbl}>GENDER</div>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ ...inp, background: '#fffdf6', appearance: 'none' }}>
                                <option value="">select</option>
                                <option value="male">male</option>
                                <option value="female">female</option>
                            </select>
                        </div>
                        <div>
                            <div style={lbl}>AGE</div>
                            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" min="10" max="100" style={inp} />
                        </div>
                    </div>

                    <div style={lbl}>HEIGHT ({heightLabel.toUpperCase()})</div>
                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 180' : 'e.g. 70'} step="0.1" style={inp} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <div style={lbl}>CURRENT ({unitLabel})</div>
                            <input type="number" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 82' : 'e.g. 180'} step="0.1" style={inp} />
                        </div>
                        <div>
                            <div style={lbl}>GOAL ({unitLabel})</div>
                            <input type="number" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 74' : 'e.g. 163'} step="0.1" style={inp} />
                        </div>
                    </div>

                    <div style={lbl}>ACTIVITY</div>
                    <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} style={{ ...inp, background: '#fffdf6', appearance: 'none' }}>
                        {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>

                    <button type="button" onClick={handleSubmit} disabled={loading}
                        style={{ width: '100%', marginTop: 26, fontFamily: MARKER, fontSize: '1.1rem', background: T.highGreen, border: '1px solid #9ccd7a', borderRadius: 8, padding: '13px', cursor: 'pointer', color: T.ink, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                        {loading ? 'warming up\u2026' : '\u2713 start my journal'}
                    </button>
                </Paper>
            </div>
        </div>
    );
}

export default ProfileSetup;