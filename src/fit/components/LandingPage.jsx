import React from 'react';
import { Link } from 'react-router-dom';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape } from '../theme';

const deskInk = '#f3ead6';
const deskMuted = '#bab09c';

const FEATURES = [
    { title: 'Workouts', color: '#d9544a', desc: 'Log sets \u00D7 reps with the weight, or minutes for cardio \u2014 calories auto-calculated with MET + load.' },
    { title: 'Food & Macros', color: T.calorie, desc: 'Search foods or type them in and track protein, carbs, and fat \u2014 with your daily totals.' },
    { title: 'Calorie Balance', color: '#2f9e44', desc: 'See eaten vs. burned vs. your allowance, so you know exactly if you\u2019re in a deficit or surplus.' },
    { title: 'Sleep & Hydration', color: T.blue, desc: 'Tick off water glasses and log sleep hours, right on each day\u2019s page.' },
    { title: 'Streak', color: '#d9773f', desc: 'Every day you log keeps the streak alive \u2014 consistency beats intensity.' },
    { title: 'Personal Records', color: '#a78bfa', desc: 'Your best lifts computed automatically, with a \u201CNEW\u201D badge when you PR.' },
];

const STEPS = [
    { n: '1', title: 'Log your day', desc: 'Workouts, food, water, sleep, notes \u2014 one page per day.' },
    { n: '2', title: 'See the balance', desc: 'The calorie ledger shows exactly where you stand.' },
    { n: '3', title: 'Chase the streak', desc: 'Build consistency and stack personal records.' },
];

const btn = (variant) => ({
    fontFamily: MARKER, fontSize: '1rem', borderRadius: 8, padding: '12px 26px', cursor: 'pointer', color: T.ink, textDecoration: 'none', display: 'inline-block',
    ...(variant === 'solid'
        ? { background: T.highGreen, border: '1px solid #9ccd7a', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }
        : { background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.ruled}`, color: deskInk }),
});

function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: deskInk, fontFamily: FONT, overflowX: 'hidden' }}>

            {/* NAV */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <MarkerTitle style={{ fontSize: '1.6rem', color: deskInk }}>DeWhitt Fit</MarkerTitle>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 2, height: 10, background: T.highYellow, opacity: 0.55, zIndex: -1 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Link to="/fit/login" style={btn('ghost')}>log in</Link>
                    <Link to="/fit/register" style={btn('solid')}>start your journal</Link>
                </div>
            </nav>

            {/* HERO */}
            <header style={{ textAlign: 'center', padding: '9vh 20px 6vh' }}>
                <Tape rotate={-2}>train. eat. recover. repeat.</Tape>
                <h1 style={{ fontFamily: MARKER, fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.05, color: deskInk, fontWeight: 400, margin: '24px 0 8px' }}>
                    The Lift <span style={{ background: T.highYellow, color: T.ink, padding: '0 8px', borderRadius: 4 }}>Journal</span>
                </h1>
                <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: deskMuted, maxWidth: 560, margin: '12px auto 28px' }}>
                    log your workouts, food, and progress \u2014 one page a day. simple. effective.
                </p>
                <Link to="/fit/register" style={btn('solid')}>start tracking free</Link>
                <div style={{ marginTop: 14, fontFamily: FONT, color: deskMuted, fontSize: '0.9rem' }}>
                    already have one? <Link to="/fit/login" style={{ color: T.blue }}>sign in</Link>
                </div>
            </header>

            {/* FEATURES */}
            <section style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 20px 10px' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <MarkerTitle style={{ fontSize: '2rem', color: deskInk }}>What you'll track</MarkerTitle>
                    <p style={{ color: deskMuted, marginTop: 6 }}>everything in one place, one day at a time.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {FEATURES.map(f => (
                        <Paper key={f.title} lined={false} style={{ padding: '20px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <i style={{ width: 10, height: 10, borderRadius: 2, background: f.color, display: 'block', flexShrink: 0 }} />
                                <MarkerTitle style={{ fontSize: '1.25rem' }}>{f.title}</MarkerTitle>
                            </div>
                            <p style={{ color: T.inkSoft, fontSize: '0.95rem', margin: '10px 0 0', lineHeight: 1.45 }}>{f.desc}</p>
                        </Paper>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section style={{ maxWidth: 1000, margin: '34px auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <MarkerTitle style={{ fontSize: '2rem', color: deskInk }}>How it works</MarkerTitle>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {STEPS.map(s => (
                        <div key={s.n} style={{ textAlign: 'center', padding: '18px' }}>
                            <div style={{ fontFamily: MARKER, fontSize: '2.4rem', color: T.calorie, lineHeight: 1 }}>{s.n}</div>
                            <div style={{ fontFamily: MARKER, fontSize: '1.2rem', color: deskInk, marginTop: 10 }}>{s.title}</div>
                            <div style={{ color: deskMuted, fontSize: '0.9rem', marginTop: 6 }}>{s.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ textAlign: 'center', padding: '44px 20px 64px' }}>
                <MarkerTitle style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: deskInk }}>Ready to get consistent?</MarkerTitle>
                <p style={{ color: deskMuted, fontSize: '1.1rem', margin: '12px 0 26px' }}>your journal is one sign-up away.</p>
                <Link to="/fit/register" style={btn('solid')}>start your journal &rarr;</Link>
            </section>

            {/* FOOTER */}
            <footer style={{ textAlign: 'center', padding: '22px', color: deskMuted, fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                DeWhitt Fit &middot; your day, logged.
            </footer>
        </div>
    );
}

export default LandingPage;