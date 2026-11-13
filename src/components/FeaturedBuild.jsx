import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape, Highlight } from '../fit/theme';

// ── "Featured Build" — DeWhitt Fit shown as agency work ───────────────────
// The phone shows a miniature journal page built from the Fit app's own theme
// components with sample data (no real user data, no screenshots to keep in sync).

const GOLD = '#FFD700';

const TECH = ['React', 'Vite', 'Node.js', 'Express', 'MySQL', 'Capacitor · Android', 'Render'];

const HIGHLIGHTS = [
  'Workouts, food & macros, and personal records — logged in seconds',
  'One account across the website and the Android app',
  'Email links open straight into the app (Android App Links)',
];

// Sample data for the phone preview
const LIFTS = [
  { name: 'Bench Press', detail: '4×8 @ 185 lb', kcal: 214 },
  { name: 'Back Squat', detail: '5×5 @ 225 lb', kcal: 262 },
  { name: 'Pull-ups', detail: '3×10', kcal: 96 },
  { name: 'Incline Walk', detail: '20 min', kcal: 158 },
];
const MACROS = [
  { label: 'Protein', short: 'P', value: 168, goal: 180, color: '#d9544a' },
  { label: 'Carbs', short: 'C', value: 212, goal: 250, color: T.blue },
  { label: 'Fat', short: 'F', value: 64, goal: 75, color: T.calorie },
];
const MEALS = [
  { name: 'Greek yogurt + berries', kcal: 310 },
  { name: 'Chicken rice bowl', kcal: 640 },
  { name: 'Protein shake', kcal: 220 },
  { name: 'Salmon, potatoes, greens', kcal: 720 },
];
const PRS = [
  { lift: 'Deadlift', value: '315 lb', isNew: true, rotate: -2 },
  { lift: 'Bench Press', value: '205 lb', rotate: 1.5 },
  { lift: 'Back Squat', value: '275 lb', rotate: -1 },
];

const row = { display: 'flex', alignItems: 'baseline', gap: 6, padding: '5px 0', borderBottom: `1px dashed ${T.ruled}`, fontFamily: FONT, fontSize: '0.86rem', color: T.inkSoft };

function LiftsScreen() {
  const total = LIFTS.reduce((s, l) => s + l.kcal, 0);
  return (
    <>
      <MarkerTitle style={{ fontSize: '1.35rem' }}>Today's <Highlight color={T.highYellow} style={{ padding: '0 4px' }}>Lifts</Highlight></MarkerTitle>
      <div style={{ marginTop: 10 }}>
        {LIFTS.map((l) => (
          <div key={l.name} style={row}>
            <span style={{ color: T.ink, fontWeight: 700 }}>{l.name}</span>
            <span style={{ flex: 1, color: T.pencil }}>{l.detail}</span>
            <span style={{ color: T.calorie }}>{l.kcal}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontFamily: MARKER, fontSize: '0.85rem', color: T.ink, textAlign: 'right' }}>
        burned ≈ <span style={{ color: T.calorie }}>{total} kcal</span>
      </div>
    </>
  );
}

function FoodScreen() {
  const kcal = MEALS.reduce((s, m) => s + m.kcal, 0);
  return (
    <>
      <MarkerTitle style={{ fontSize: '1.35rem', whiteSpace: 'nowrap' }}>Daily <Highlight color={T.highGreen} style={{ padding: '0 4px' }}>Fuel</Highlight></MarkerTitle>
      <div style={{ fontFamily: FONT, fontSize: '0.86rem', color: T.pencil, marginTop: 6 }}>
        <span style={{ color: T.calorie, fontWeight: 700 }}>{kcal.toLocaleString()} kcal</span> of 2,300 today
      </div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MACROS.map((m) => (
          <div key={m.label} style={{ fontFamily: FONT, fontSize: '0.78rem', color: T.inkSoft }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong style={{ color: m.color }}>{m.short}</strong> {m.label}</span>
              <span>{m.value} / {m.goal} g</span>
            </div>
            <div style={{ height: 6, background: 'rgba(0,0,0,0.07)', borderRadius: 4, overflow: 'hidden' }}>
              <div className="fb-bar" style={{ width: `${Math.round((m.value / m.goal) * 100)}%`, height: '100%', background: m.color, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        {MEALS.map((m) => (
          <div key={m.name} style={row}>
            <span style={{ flex: 1 }}>{m.name}</span>
            <span style={{ color: T.calorie }}>{m.kcal}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function RecordsScreen() {
  return (
    <>
      <MarkerTitle style={{ fontSize: '1.35rem' }}><Highlight color={T.highPink} style={{ padding: '0 4px' }}>★ Records</Highlight></MarkerTitle>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PRS.map((p) => (
          <div key={p.lift} style={{ background: T.sticky, padding: '8px 12px', transform: `rotate(${p.rotate}deg)`, boxShadow: '0 3px 8px rgba(90,65,30,0.18)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: '0.9rem', color: T.inkSoft, flex: 1 }}>{p.lift}</span>
            <span style={{ fontFamily: MARKER, fontSize: '1rem', color: T.ink }}>{p.value}</span>
            {p.isNew && <span style={{ fontFamily: MARKER, fontSize: '0.62rem', color: '#7a1f1f', background: T.highPink, borderRadius: 4, padding: '1px 5px' }}>NEW</span>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontFamily: FONT, fontSize: '0.85rem', color: T.pencil, textAlign: 'center' }}>
        12-day streak — keep it going ✓
      </div>
    </>
  );
}

const SCREENS = [
  { key: 'lifts', label: 'Workouts', Comp: LiftsScreen },
  { key: 'food', label: 'Food', Comp: FoodScreen },
  { key: 'records', label: 'Records', Comp: RecordsScreen },
];

function PhonePreview() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), 4500);
    return () => clearInterval(id);
  }, [paused]);

  const { Comp, key } = SCREENS[index];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Device frame */}
      <div style={{
        width: 280, height: 560, borderRadius: 42, padding: 12, boxSizing: 'border-box',
        background: 'linear-gradient(145deg, #2a2f3a, #0d1017)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08), 0 0 40px rgba(255,215,0,0.08)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 70, height: 18, borderRadius: 10, background: '#05070b', zIndex: 2 }} />
        <div style={{
          width: '100%', height: '100%', borderRadius: 32, overflow: 'hidden',
          background: 'radial-gradient(600px 400px at 50% -10%, #332a20, #211b15)',
          padding: '44px 12px 12px', boxSizing: 'border-box',
        }}>
          <div style={{ fontFamily: MARKER, color: '#f3ead7', fontSize: '0.95rem', marginBottom: 10, paddingLeft: 4 }}>DeWhitt Fit</div>
          <Paper margin style={{ padding: '14px 14px 16px 58px', minHeight: 400 }}>
            <Tape rotate={-2}>THU · NOV 13</Tape>
            <div key={key} className="fb-screen" style={{ marginTop: 10 }}>
              <Comp />
            </div>
          </Paper>
        </div>
      </div>

      {/* Screen picker */}
      <div style={{ display: 'flex', gap: 8 }}>
        {SCREENS.map((s, i) => (
          <button key={s.key} type="button" onClick={() => setIndex(i)} aria-label={`Show ${s.label}`}
            style={{
              background: i === index ? GOLD : 'transparent',
              color: i === index ? '#000' : '#aaa',
              border: `1px solid ${i === index ? GOLD : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 20, padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeaturedBuild() {
  return (
    <section id="work" style={{ padding: '100px 5vw', position: 'relative', zIndex: 10 }}>
      <style>{`
        .fb-screen { animation: fb-in 450ms ease both; }
        @keyframes fb-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .fb-bar { animation: fb-grow 900ms cubic-bezier(.65,.05,.36,1) both 200ms; transform-origin: left; }
        @keyframes fb-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @media (prefers-reduced-motion: reduce) { .fb-screen, .fb-bar { animation: none; } }
        .fb-chip { transition: border-color .25s ease, color .25s ease; }
        .fb-chip:hover { border-color: ${GOLD}; color: ${GOLD}; }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ fontSize: 'min(3rem, 6vw)', marginBottom: '20px' }}>Featured Build</h2>
        <div style={{ width: '60px', height: '4px', background: GOLD, margin: '0 auto', borderRadius: '2px' }} />
      </div>

      <div style={{
        maxWidth: 1100, margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24, backdropFilter: 'blur(10px)', padding: 'clamp(20px, 5vw, 56px)',
        display: 'flex', flexWrap: 'wrap', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center', justifyContent: 'center',
        boxSizing: 'border-box',
      }}>
        {/* Story */}
        <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: 520 }}>
          <div style={{ color: GOLD, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '3px', marginBottom: 12 }}>CASE STUDY · WEB + ANDROID</div>
          <h3 style={{ fontSize: 'min(2.6rem, 9vw)', margin: '0 0 16px', lineHeight: 1.1 }}>
            DeWhitt <span style={{ color: GOLD }}>Fit</span>
          </h3>
          <p style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: 1.6, margin: '0 0 22px' }}>
            A lifting journal we designed and built end to end — its own hand-drawn brand,
            a web app, a native Android app, and the backend that keeps them in sync.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {HIGHLIGHTS.map((h) => (
              <li key={h} style={{ display: 'flex', gap: 10, color: '#ddd', lineHeight: 1.5 }}>
                <span style={{ color: GOLD, flexShrink: 0 }}>◆</span>{h}
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 30 }}>
            {TECH.map((t) => (
              <span key={t} className="fb-chip" style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#aaa', borderRadius: 20, padding: '4px 12px', fontSize: '0.8rem' }}>{t}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <Link to="/fit">
              <button style={{ background: GOLD, color: '#000', border: 'none', padding: '14px 30px', borderRadius: 30, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 15px rgba(255,215,0,0.3)' }}>
                Try it live →
              </button>
            </Link>
            <Link to="/register">
              <button style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '14px 30px', borderRadius: 30, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
                Build something like this
              </button>
            </Link>
          </div>
        </div>

        {/* Product */}
        <PhonePreview />
      </div>
    </section>
  );
}
