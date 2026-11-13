import React from 'react';

// Fonts are bundled with the app (no Google Fonts request), so the handwriting
// look is there on first paint instead of flashing a fallback font.
import '@fontsource/patrick-hand/400.css';
import '@fontsource/permanent-marker/400.css';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';

// ── "Gym Rat's Journal" design tokens ──────────────────────────────────────
// A handwritten, paper-notebook feel: ruled paper, marker headings,
// highlighter accents, pencil notes, and a red margin line.

export const T = {
    paper: '#f7f0e1',
    paper2: '#efe6d2',
    paperTint: '#fcf7ec',
    ruled: '#e0d5bd',
    ruledSoft: 'rgba(120,100,70,0.15)',
    margin: '#d9544a',
    ink: '#2c2722',
    inkSoft: '#4b443b',
    pencil: '#8c8171',
    highYellow: '#ffe98a',
    highPink: '#ffcad1',
    highGreen: '#c9f0a6',
    sticky: '#fff2a8',
    tape: 'rgba(238,227,204,0.72)',
    blue: '#3f6fb5',
    sleep: '#6a5acd',
    calorie: '#d9773f',
};

export const FONT = "'Patrick Hand', 'Caveat', 'Segoe Print', 'Comic Sans MS', cursive";
export const MARKER = "'Permanent Marker', 'Caveat', 'Comic Sans MS', cursive";

// A ruled paper surface (optionally with a red left margin)
export function Paper({ children, style, lined = true, margin = false }) {
    const layers = [];
    if (margin) layers.push(`linear-gradient(90deg, transparent 0 46px, ${T.margin} 46px 48px, transparent 48px)`);
    if (lined) layers.push(`repeating-linear-gradient(0deg, transparent 0, transparent 29px, ${T.ruledSoft} 29px, ${T.ruledSoft} 30px)`);
    layers.push(`linear-gradient(180deg, ${T.paperTint}, ${T.paper})`);
    return (
        <div style={{
            position: 'relative',
            background: layers.join(', '),
            border: `1px solid ${T.ruled}`,
            borderRadius: '8px',
            boxShadow: '0 8px 20px rgba(90,65,30,0.14), inset 0 0 40px rgba(120,95,55,0.06)',
            ...style,
        }}>{children}</div>
    );
}

export function MarkerTitle({ children, style, color = T.ink }) {
    return <h2 style={{ fontFamily: MARKER, color, fontWeight: 400, letterSpacing: '0.5px', margin: 0, ...style }}>{children}</h2>;
}

// A torn piece of translucent tape (used to "stick" notes on the page)
export function Tape({ children, rotate = -3, style }) {
    return (
        <span style={{
            display: 'inline-block', background: T.tape, borderLeft: '2px dashed rgba(0,0,0,0.12)', borderRight: '2px dashed rgba(0,0,0,0.12)',
            padding: '1px 16px', transform: `rotate(${rotate}deg)`, boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            fontFamily: MARKER, fontSize: '0.78rem', color: T.inkSoft, ...style,
        }}>{children}</span>
    );
}
// ── Highlighter motion ─────────────────────────────────────────────────────
// Injected once so every page that imports the theme gets the keyframes.
const HL_CSS = `
.hl-swipe {
    background-repeat: no-repeat;
    background-position: 0 55%;
    background-size: 100% 88%;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    animation: hl-swipe 650ms cubic-bezier(.65,.05,.36,1) both;
}
@keyframes hl-swipe {
    from { background-size: 0% 88%; }
    to   { background-size: 100% 88%; }
}
@media (prefers-reduced-motion: reduce) {
    .hl-swipe { animation: none; }
}
input[type=number] { -moz-appearance: textfield; appearance: textfield; }
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
`;
if (typeof document !== 'undefined' && !document.getElementById('fit-theme-css')) {
    const el = document.createElement('style');
    el.id = 'fit-theme-css';
    el.textContent = HL_CSS;
    document.head.appendChild(el);
}

// A highlighter stroke that sweeps across the text, like a marker being dragged.
export function Highlight({ children, color = T.highYellow, delay = 250, style }) {
    return (
        <span className="hl-swipe" style={{
            backgroundImage: `linear-gradient(${color}, ${color})`,
            animationDelay: `${delay}ms`,
            ...style,
        }}>{children}</span>
    );
}
