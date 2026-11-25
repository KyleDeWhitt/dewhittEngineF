import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape, Highlight } from '../theme';
import { analyzeClip, computeSeries } from '../movement/analysis';
import { SkeletonPlayer, AngleChart } from '../movement/MovementViews';
import { JOINT_COLOR } from '../movement/draw';
import { makeDemoPose } from '../movement/demoPose';

// Links are prefixed with /fit on the web; the Android copy of this file uses no prefix.
const BASE = '/fit';
const CONTACT = 'support@dewhittdesigns.com';
const PAGE_TITLE = 'DeWhitt Fit — The Lift Journal with real coach form checks';

const deskInk = '#f3ead6';
const deskMuted = '#bab09c';

const FEATURES = [
    { title: 'Workouts', color: '#d9544a', desc: '120+ exercises, including 95 strength moves sorted by muscle group. Log sets × reps × weight, or minutes for cardio — calories auto-calculated from MET + load.' },
    { title: 'Form Check', color: '#6a5acd', desc: 'Film a set and send it to a real coach. You get a stick-figure replay, joint angles and rep-by-rep notes back.' },
    { title: 'Food & Macros', color: T.calorie, desc: 'Search foods or type them in and track protein, carbs, and fat — with your daily totals.' },
    { title: 'Calorie Balance', color: '#2f9e44', desc: 'See eaten vs. burned vs. your allowance, so you know exactly if you’re in a deficit or surplus.' },
    { title: 'Sleep & Hydration', color: T.blue, desc: 'Tick off water glasses and log sleep hours, right on each day’s page.' },
    { title: 'Streaks & PRs', color: '#d9773f', desc: 'Every day you log keeps the streak alive, and your best lifts are tracked automatically with a “NEW” badge when you PR.' },
];

const STEPS = [
    { n: '1', title: 'Log your day', desc: 'Workouts, food, water, sleep, notes — one page per day.' },
    { n: '2', title: 'Film a set', desc: 'Prop your phone up, record, and send it to your coach in a couple of taps.' },
    { n: '3', title: 'Get coach notes', desc: 'Your coach reviews the replay and angles and tells you what to work on.' },
];

const btn = (variant) => ({
    fontFamily: MARKER, fontSize: '1rem', borderRadius: 8, padding: '12px 26px', cursor: 'pointer', color: T.ink, textDecoration: 'none', display: 'inline-block',
    ...(variant === 'solid'
        ? { background: T.highGreen, border: '1px solid #9ccd7a', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }
        : { background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.ruled}`, color: deskInk }),
});

// The highlighted headline word starts in light ink (readable on the dark page) and turns
// dark as the highlighter sweeps in, so it's never dark-on-dark.
const HERO_CSS = `
.fit-hero-word .hl-swipe { animation-name: hl-swipe, fit-hero-ink; animation-duration: 650ms; animation-timing-function: cubic-bezier(.65,.05,.36,1); animation-fill-mode: both; }
@keyframes fit-hero-ink { from { color: ${deskInk}; } to { color: ${T.ink}; } }
@media (prefers-reduced-motion: reduce) { .fit-hero-word .hl-swipe { animation: none; } }
`;

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function FormCheckExample() {
    const poseData = useMemo(() => makeDemoPose(), []);
    const series = useMemo(() => computeSeries(poseData, 'side'), [poseData]);
    const metrics = useMemo(() => analyzeClip(poseData, 'Barbell Squat', 'side'), [poseData]);
    const [time, setTime] = useState(0);
    const [autoPlay] = useState(() => !prefersReducedMotion());
    const lines = useMemo(() => [
        { key: 'knee', label: 'Knee', values: series.joints.knee.main, color: JOINT_COLOR.knee },
        { key: 'hip', label: 'Hip', values: series.joints.hip.main, color: JOINT_COLOR.hip },
    ], [series]);
    const notes = metrics.observations.filter(o => o.level === 'flag' || /tempo/i.test(o.text));

    return (
        <Paper margin style={{ padding: '22px 22px 24px 60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <MarkerTitle style={{ fontSize: '1.25rem' }}>Form check · back squat</MarkerTitle>
                <span style={{ fontFamily: FONT, fontSize: '0.8rem', color: T.pencil }}>example clip · {metrics.repCount} reps</span>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 220px', maxWidth: 300 }}>
                    <SkeletonPlayer poseData={poseData} series={series} primary="knee" view="side" time={time} onTime={setTime} height={300} autoPlay={autoPlay} />
                </div>
                <div style={{ flex: '2 1 280px', minWidth: 0 }}>
                    <AngleChart t={series.t} lines={lines} reps={metrics.reps} time={time} onTime={setTime} height={190} />
                    <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', fontFamily: FONT, fontSize: '0.95rem', color: T.inkSoft }}>
                        {notes.map((o, i) => (
                            <li key={i} style={{ display: 'flex', gap: 8, padding: '2px 0' }}>
                                <span style={{ color: o.level === 'flag' ? T.margin : T.inkSoft, fontWeight: 700 }}>{o.level === 'flag' ? '!' : '•'}</span>{o.text}
                            </li>
                        ))}
                    </ul>
                    <div style={{ marginTop: 10, padding: '8px 12px', background: T.sticky, borderRadius: 4, fontFamily: FONT, fontSize: '0.95rem', color: T.ink }}>
                        <span style={{ fontFamily: MARKER, fontSize: '0.72rem', color: T.inkSoft }}>coach: </span>
                        Depth held for 3 reps, then dropped off. Drop the weight 10% and pause 1 second at the bottom.
                    </div>
                </div>
            </div>
        </Paper>
    );
}

function LandingPage() {
    useEffect(() => {
        const prev = document.title;
        document.title = PAGE_TITLE;
        return () => { document.title = prev; };
    }, []);

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: deskInk, fontFamily: FONT, overflowX: 'hidden' }}>
            <style>{HERO_CSS}</style>

            {/* NAV */}
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <MarkerTitle style={{ fontSize: '1.6rem', color: deskInk }}>DeWhitt Fit</MarkerTitle>
                    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 2, height: 10, background: T.highYellow, opacity: 0.55, zIndex: -1 }} />
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Link to={`${BASE}/login`} style={btn('ghost')}>log in</Link>
                    <Link to={`${BASE}/register`} style={btn('solid')}>start your journal</Link>
                </div>
            </nav>

            {/* HERO */}
            <header style={{ textAlign: 'center', padding: '9vh 20px 6vh' }}>
                <Tape rotate={-2}>train. eat. recover. repeat.</Tape>
                <h1 style={{ fontFamily: MARKER, fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 1.05, color: deskInk, fontWeight: 400, margin: '24px 0 8px' }}>
                    The Lift <span className="fit-hero-word"><Highlight color={T.highYellow} style={{ color: T.ink, padding: '0 8px', borderRadius: 4 }}>Journal</Highlight></span>
                </h1>
                <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: deskMuted, maxWidth: 600, margin: '12px auto 28px' }}>
                    log your workouts, food, and progress — one page a day. film a set and a real coach checks your form.
                </p>
                <Link to={`${BASE}/register`} style={btn('solid')}>start tracking free</Link>
                <div style={{ marginTop: 14, fontFamily: FONT, color: deskMuted, fontSize: '0.9rem' }}>
                    already have one? <Link to={`${BASE}/login`} style={{ color: T.blue }}>sign in</Link>
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

            {/* FORM CHECK */}
            <section style={{ maxWidth: 1000, margin: '44px auto 10px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <MarkerTitle style={{ fontSize: '2rem', color: deskInk }}>A real coach checks your form</MarkerTitle>
                    <p style={{ color: deskMuted, marginTop: 8, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                        Film a set on your phone. The app tracks your movement right on the phone and sends your coach a stick-figure replay, joint angles and rep-by-rep numbers.
                        Your video never leaves your phone, and faces are blurred in the two stills your coach sees.
                    </p>
                </div>
                <FormCheckExample />
                <p style={{ color: deskMuted, fontSize: '0.8rem', textAlign: 'center', marginTop: 10 }}>
                    Example generated for illustration. Angles from one camera are estimates. Coaching feedback, not medical advice.
                </p>
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
                <Link to={`${BASE}/register`} style={btn('solid')}>start your journal &rarr;</Link>
            </section>

            {/* FOOTER */}
            <footer style={{ textAlign: 'center', padding: '22px', color: deskMuted, fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div>DeWhitt Fit &middot; your day, logged.</div>
                <nav style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                    <Link to={`${BASE}/privacy`} style={{ color: deskMuted }}>Privacy</Link>
                    <Link to={`${BASE}/terms`} style={{ color: deskMuted }}>Terms</Link>
                    <a href={`mailto:${CONTACT}`} style={{ color: deskMuted }}>Contact</a>
                    <a href="https://dewhittdesigns.com/" style={{ color: deskMuted }}>Built by DeWhitt Designs</a>
                </nav>
            </footer>
        </div>
    );
}

export default LandingPage;
