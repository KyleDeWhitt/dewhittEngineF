// Skeleton replay, still-frame overlay and joint-angle chart for form-check clips.
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { T, FONT, MARKER } from '../theme';
import { frameAt } from './analysis';
import { drawSkeleton } from './draw';

function fitBox(cw, ch, vw, vh) {
    const s = Math.min(cw / vw, ch / vh);
    const w = vw * s, h = vh * s;
    return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

const SPEEDS = [0.25, 0.5, 1];

/**
 * Animated stick-figure replay. Time is owned by the parent so the chart can follow it.
 * props: poseData, series (from computeSeries), primary, view, time, onTime(t), height, autoPlay
 */
export function SkeletonPlayer({ poseData, series, primary, view = 'side', time, onTime, height = 360, autoPlay = false }) {
    const canvasRef = useRef(null);
    const [playing, setPlaying] = useState(autoPlay);
    const [speed, setSpeed] = useState(0.5);
    const duration = poseData?.frames?.length ? poseData.frames[poseData.frames.length - 1][0] / 1000 : 0;
    const timeRef = useRef(time);
    useEffect(() => { timeRef.current = time; }, [time]);

    // Playback loop
    useEffect(() => {
        if (!playing) return undefined;
        let raf, last = null;
        const tick = (now) => {
            if (last != null) {
                let t = timeRef.current + ((now - last) / 1000) * speed;
                if (t > duration) t = 0;
                onTime(t);
            }
            last = now;
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, speed, duration, onTime]);

    // Draw current frame
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !poseData) return;
        const dpr = window.devicePixelRatio || 1;
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (canvas.width !== Math.round(cw * dpr)) { canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr); }
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cw, ch);
        const box = fitBox(cw, ch, poseData.width || 1, poseData.height || 1);
        ctx.fillStyle = '#fffdf6';
        ctx.fillRect(box.x, box.y, box.w, box.h);
        ctx.strokeStyle = T.ruledSoft; ctx.lineWidth = 1;
        for (let y = box.y + 30; y < box.y + box.h; y += 30) { ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke(); }
        const row = frameAt(poseData, time);
        const k = series ? Math.max(0, Math.min(series.t.length - 1, Math.round(time * (poseData.fps || 15)))) : 0;
        const angle = series && primary && series.joints[primary] ? series.joints[primary].main[k] : null;
        if (row && row.length > 1) {
            drawSkeleton(ctx, row, box, { side: series?.side && view !== 'front' ? series.side : null, highlight: primary, angle });
        } else {
            ctx.fillStyle = T.pencil; ctx.font = `15px ${FONT}`;
            ctx.fillText('body not tracked in this frame', box.x + 12, box.y + 24);
        }
    }, [poseData, series, primary, view, time]);

    const btn = { fontFamily: MARKER, fontSize: '0.78rem', background: T.sticky, border: `1px solid ${T.ruled}`, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', color: T.ink };
    return (
        <div>
            <canvas ref={canvasRef} style={{ width: '100%', height, display: 'block', borderRadius: 6, border: `1px solid ${T.ruled}`, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <button type="button" style={btn} onClick={() => setPlaying(p => !p)}>{playing ? '❚❚ pause' : '▶ play'}</button>
                <input type="range" min={0} max={duration || 0} step={0.01} value={Math.min(time, duration)} onChange={(e) => { setPlaying(false); onTime(Number(e.target.value)); }} style={{ flex: '1 1 140px', accentColor: T.margin }} aria-label="Scrub through the clip" />
                <span style={{ fontFamily: FONT, fontSize: '0.85rem', color: T.pencil, minWidth: 74, textAlign: 'right' }}>{time.toFixed(1)}s / {duration.toFixed(1)}s</span>
                <div style={{ display: 'flex', gap: 4 }}>
                    {SPEEDS.map(s => (
                        <button key={s} type="button" onClick={() => setSpeed(s)}
                            style={{ fontFamily: FONT, fontSize: '0.8rem', padding: '3px 8px', borderRadius: 50, cursor: 'pointer', border: `1px solid ${T.ruled}`, background: s === speed ? T.highYellow : '#fffdf6', color: T.ink }}>{s}×</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** A still frame (face already pixelated) with the skeleton drawn on top. */
export function StillWithSkeleton({ still, poseData, onClick }) {
    const canvasRef = useRef(null);
    const [showSkel, setShowSkel] = useState(true);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !still?.src) return undefined;
        let cancelled = false;
        const img = new Image();
        img.onload = () => {
            if (cancelled) return;
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            if (showSkel) drawSkeleton(ctx, frameAt(poseData, still.t), { x: 0, y: 0, w: img.width, h: img.height }, { dim: true });
        };
        img.src = still.src;
        return () => { cancelled = true; };
    }, [still, poseData, showSkel]);
    return (
        <figure style={{ margin: 0, flex: '1 1 150px', maxWidth: 240 }}>
            <canvas ref={canvasRef} onClick={onClick} style={{ width: '100%', borderRadius: 6, border: `1px solid ${T.ruled}`, display: 'block', cursor: onClick ? 'pointer' : 'default' }} />
            <figcaption style={{ fontFamily: FONT, fontSize: '0.78rem', color: T.pencil, marginTop: 4, display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <span>{still.label} · {Number(still.t).toFixed(1)}s</span>
                <button type="button" onClick={() => setShowSkel(s => !s)} style={{ fontFamily: FONT, fontSize: '0.75rem', background: 'none', border: 'none', color: T.blue, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                    {showSkel ? 'hide' : 'show'} skeleton
                </button>
            </figcaption>
        </figure>
    );
}

/**
 * Joint angles over time. `lines` = [{ key, label, values, color, dashed }].
 * Rep spans are shaded; clicking moves the replay to that time.
 */
export function AngleChart({ t, lines, reps = [], time, onTime, height = 210 }) {
    const W = 640, H = height, padL = 34, padR = 10, padT = 10, padB = 24;
    const tMax = t.length ? t[t.length - 1] || 1 : 1;
    const x = (s) => padL + (s / tMax) * (W - padL - padR);
    const y = (deg) => padT + (1 - deg / 180) * (H - padT - padB);
    const paths = useMemo(() => lines.map(l => {
        let d = '', pen = false;
        l.values.forEach((v, k) => {
            if (v == null) { pen = false; return; }
            d += `${pen ? 'L' : 'M'}${x(t[k]).toFixed(1)},${y(v).toFixed(1)}`;
            pen = true;
        });
        return { ...l, d };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [lines, t, tMax, H]);

    const svgRef = useRef(null);
    const onClick = (e) => {
        const r = svgRef.current.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * W;
        onTime && onTime(Math.max(0, Math.min(tMax, ((px - padL) / (W - padL - padR)) * tMax)));
    };

    return (
        <div>
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair', background: '#fffdf6', border: `1px solid ${T.ruled}`, borderRadius: 6 }} onClick={onClick} role="img" aria-label="Joint angles over time">
                {reps.map(r => (
                    <g key={r.n}>
                        <rect x={x(r.start)} y={padT} width={Math.max(1, x(r.end) - x(r.start))} height={H - padT - padB} fill="rgba(255,233,138,0.35)" />
                        <text x={x(r.bottom)} y={padT + 12} textAnchor="middle" fontSize="11" fill={T.pencil} fontFamily={FONT}>{r.n}</text>
                    </g>
                ))}
                {[0, 45, 90, 135, 180].map(d => (
                    <g key={d}>
                        <line x1={padL} x2={W - padR} y1={y(d)} y2={y(d)} stroke={T.ruledSoft} />
                        <text x={padL - 6} y={y(d) + 4} textAnchor="end" fontSize="11" fill={T.pencil} fontFamily={FONT}>{d}°</text>
                    </g>
                ))}
                {Array.from({ length: Math.floor(tMax / 5) + 1 }, (_, i) => i * 5).map(s => (
                    <text key={s} x={x(s)} y={H - 6} textAnchor="middle" fontSize="11" fill={T.pencil} fontFamily={FONT}>{s}s</text>
                ))}
                {paths.map(p => <path key={p.key} d={p.d} fill="none" stroke={p.color} strokeWidth="2.2" strokeDasharray={p.dashed ? '5 4' : undefined} strokeLinejoin="round" />)}
                <line x1={x(time)} x2={x(time)} y1={padT} y2={H - padB} stroke={T.ink} strokeWidth="1.5" />
            </svg>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontFamily: FONT, fontSize: '0.8rem', color: T.inkSoft }}>
                {lines.map(l => (
                    <span key={l.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <svg width="18" height="6"><line x1="0" x2="18" y1="3" y2="3" stroke={l.color} strokeWidth="2.5" strokeDasharray={l.dashed ? '4 3' : undefined} /></svg>
                        {l.label}
                    </span>
                ))}
                {reps.length > 0 && <span><span style={{ display: 'inline-block', width: 12, height: 9, background: 'rgba(255,233,138,0.7)', marginRight: 5 }} />rep</span>}
            </div>
        </div>
    );
}

