// Client side of form check: film a set, analyze it on the phone, send the movement data to the coach.
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { T, FONT, MARKER } from '../theme';
import { openVideo, closeVideo, trackVideo, captureStill, MAX_SECONDS } from './pose';
import { analyzeClip, computeSeries, frameAt, JOINT_LABEL } from './analysis';
import { SkeletonPlayer } from './MovementViews';

const CONSENT_KEY = 'fitFormCheckConsent';
const readConsent = () => { try { return localStorage.getItem(CONSENT_KEY) === 'yes'; } catch { return false; } };
const saveConsent = () => { try { localStorage.setItem(CONSENT_KEY, 'yes'); } catch { /* private mode */ } };

const pad = (n) => String(n).padStart(2, '0');
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

const fetchMyClips = async () => (await axiosInstance.get('/api/movement/clips')).data.clips || [];

const OBS_COLOR = { flag: T.margin, warn: T.calorie, info: T.inkSoft };

export function Observations({ items }) {
    if (!items?.length) return null;
    return (
        <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', fontFamily: FONT, fontSize: '0.95rem' }}>
            {items.map((o, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', color: T.inkSoft }}>
                    <span style={{ color: OBS_COLOR[o.level] || T.inkSoft, fontWeight: 700, flexShrink: 0 }}>{o.level === 'flag' ? '!' : o.level === 'warn' ? '⚠' : '•'}</span>
                    <span>{o.text}</span>
                </li>
            ))}
        </ul>
    );
}

function pickStills(poseData, metrics) {
    const frames = poseData.frames;
    const firstTracked = frames.find(r => r.length > 1);
    const out = [];
    if (firstTracked) out.push({ label: 'start', t: firstTracked[0] / 1000 });
    if (metrics.reps.length) {
        const better = metrics.direction === 'up' ? (a, b) => b.value - a.value : (a, b) => a.value - b.value;
        const deepest = [...metrics.reps].filter(r => r.value != null).sort(better)[0];
        if (deepest) out.push({ label: `${metrics.direction === 'up' ? 'top' : 'bottom'} of rep ${deepest.n}`, t: deepest.bottom });
    } else if (frames.length) {
        out.push({ label: 'middle', t: frames[Math.floor(frames.length / 2)][0] / 1000 });
    }
    return out;
}

export default function FormCheck({ exerciseGroups }) {
    const allNames = useMemo(() => exerciseGroups.flatMap(g => g.items.map(e => e.name)), [exerciseGroups]);
    const [exercise, setExercise] = useState(allNames.includes('Barbell Squat') ? 'Barbell Squat' : allNames[0]);
    const [view, setView] = useState('side');
    const [note, setNote] = useState('');
    const [consent, setConsent] = useState(readConsent);
    const [stage, setStage] = useState('');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null); // { poseData, metrics, stills, durationSec }
    const [time, setTime] = useState(0);
    const [sending, setSending] = useState(false);
    const [clips, setClips] = useState([]);
    const [open, setOpen] = useState(false);
    const abortRef = useRef(null);
    const fileRef = useRef(null);
    const recordRef = useRef(null);

    const loadClips = useCallback(async () => {
        try { setClips(await fetchMyClips()); } catch (e) { console.error(e); }
    }, []);
    useEffect(() => {
        let cancelled = false;
        fetchMyClips().then(c => { if (!cancelled) setClips(c); }).catch(e => console.error(e));
        return () => { cancelled = true; };
    }, []);

    const series = useMemo(() => (result ? computeSeries(result.poseData, view) : null), [result, view]);

    const busy = !!stage;

    const handleFile = async (file) => {
        if (!file) return;
        setError(''); setResult(null); setProgress(0); setTime(0);
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        let video = null;
        try {
            setStage('Opening the video…');
            video = await openVideo(file);
            const poseData = await trackVideo(video, { onProgress: setProgress, onStage: setStage, signal: ctrl.signal });
            if (!poseData.frames.some(r => r.length > 1)) throw new Error('No body was found in this video. Make sure your whole body is in frame and well lit.');
            setStage('Measuring angles and reps…');
            const metrics = analyzeClip(poseData, exercise, view);
            const stills = [];
            for (const s of pickStills(poseData, metrics)) {
                stills.push({ ...s, src: await captureStill(video, s.t, frameAt(poseData, s.t)) });
            }
            const durationSec = Math.round(Math.min(video.duration, MAX_SECONDS) * 10) / 10;
            setResult({ poseData, metrics, stills, durationSec });
        } catch (e) {
            if (e?.name !== 'AbortError') { console.error(e); setError(e?.message || 'Could not analyze this video.'); }
        } finally {
            closeVideo(video);
            setStage('');
            abortRef.current = null;
            if (fileRef.current) fileRef.current.value = '';
            if (recordRef.current) recordRef.current.value = '';
        }
    };

    // Re-run the numbers if the client changes exercise or view after analyzing
    const metrics = useMemo(() => (result ? analyzeClip(result.poseData, exercise, view) : null), [result, exercise, view]);

    const send = async () => {
        if (!result || !consent) return;
        setSending(true); setError('');
        try {
            saveConsent();
            await axiosInstance.post('/api/movement/clips', {
                exercise, view, date: localDate(), durationSec: result.durationSec,
                poseData: result.poseData, metrics, stills: result.stills, clientNote: note || null,
            }, { timeout: 60000 });
            setResult(null); setNote('');
            await loadClips();
        } catch (e) {
            console.error(e);
            setError(e?.response?.data?.message || 'Upload failed. Check your connection and try again.');
        } finally { setSending(false); }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this clip? Your coach will no longer see it.')) return;
        try { await axiosInstance.delete(`/api/movement/clips/${id}`); await loadClips(); }
        catch (e) { console.error(e); }
    };

    const inp = { width: '100%', padding: '6px 4px', background: '#fffdf6', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1rem', color: T.ink, boxSizing: 'border-box', outline: 'none' };
    const lbl = { fontFamily: FONT, fontSize: '0.78rem', color: T.pencil, marginBottom: 2 };
    const btn = { fontFamily: MARKER, fontSize: '0.8rem', background: T.sticky, border: `1px solid ${T.ruled}`, borderRadius: 6, padding: '10px 14px', cursor: 'pointer', color: T.ink, whiteSpace: 'nowrap' };
    const pill = (on) => ({ fontFamily: FONT, fontSize: '0.85rem', padding: '5px 12px', borderRadius: 50, cursor: 'pointer', border: `1px solid ${T.ruled}`, background: on ? T.highYellow : '#fffdf6', color: T.ink });

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: FONT, fontSize: '0.9rem', color: T.inkSoft }}>
                Film a set and send it to your coach. Your phone tracks your movement and only the stick-figure data and two small stills (face blurred) are sent. The video itself stays on your phone.
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 10 }}>
                <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                    <div style={lbl}>Exercise</div>
                    <select value={exercise} onChange={(e) => setExercise(e.target.value)} style={inp} disabled={busy}>
                        {exerciseGroups.map(g => (
                            <optgroup key={g.label} label={g.label}>
                                {g.items.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                <div>
                    <div style={lbl}>Filmed from</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" style={pill(view === 'side')} onClick={() => setView('side')} disabled={busy}>side</button>
                        <button type="button" style={pill(view === 'front')} onClick={() => setView('front')} disabled={busy}>front</button>
                    </div>
                </div>
                <label style={{ ...btn, opacity: busy ? 0.5 : 1, pointerEvents: busy ? 'none' : 'auto' }}>
                    🎥 record
                    <input ref={recordRef} type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
                </label>
                <label style={{ ...btn, background: '#fffdf6', opacity: busy ? 0.5 : 1, pointerEvents: busy ? 'none' : 'auto' }}>
                    pick a video
                    <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files?.[0])} />
                </label>
            </div>

            <button type="button" onClick={() => setOpen(o => !o)} style={{ fontFamily: FONT, fontSize: '0.8rem', background: 'none', border: 'none', color: T.blue, textDecoration: 'underline', cursor: 'pointer', padding: '6px 0 0' }}>
                {open ? 'hide filming tips' : 'filming tips'}
            </button>
            {open && (
                <ul style={{ fontFamily: FONT, fontSize: '0.85rem', color: T.inkSoft, margin: '4px 0 0', paddingLeft: 18 }}>
                    <li>Prop the phone at about hip height, 6–10 feet away. Your whole body, head to feet, should stay in frame.</li>
                    <li>Side view is best for squats, deadlifts, presses and rows. Front view is best for left/right balance.</li>
                    <li>Good light, fitted clothes, a plain background. Up to {MAX_SECONDS} seconds.</li>
                </ul>
            )}

            {busy && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontFamily: FONT, fontSize: '0.9rem', color: T.inkSoft }}>{stage}</div>
                    <div style={{ height: 10, background: '#fffdf6', border: `1px solid ${T.ruled}`, borderRadius: 6, marginTop: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round(progress * 100)}%`, height: '100%', background: T.highGreen, transition: 'width .2s' }} />
                    </div>
                    <button type="button" onClick={() => abortRef.current?.abort()} style={{ fontFamily: FONT, fontSize: '0.8rem', background: 'none', border: 'none', color: T.pencil, textDecoration: 'underline', cursor: 'pointer', padding: '6px 0' }}>cancel</button>
                </div>
            )}

            {error && <div style={{ fontFamily: FONT, color: T.margin, marginTop: 10 }}>{error}</div>}

            {result && metrics && (
                <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.35)', border: `1px dashed ${T.ruled}`, borderRadius: 8 }}>
                    <div style={{ fontFamily: MARKER, fontSize: '0.95rem', color: T.ink }}>
                        {metrics.repCount} rep{metrics.repCount === 1 ? '' : 's'} · tracking {JOINT_LABEL[metrics.primary].toLowerCase()} angle
                    </div>
                    <div style={{ maxWidth: 360, marginTop: 10 }}>
                        <SkeletonPlayer poseData={result.poseData} series={series} primary={metrics.primary} view={view} time={time} onTime={setTime} height={320} />
                    </div>
                    <Observations items={metrics.observations} />
                    <div style={{ marginTop: 12 }}>
                        <div style={lbl}>Note for your coach (optional)</div>
                        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder="e.g. left knee felt off on the last two reps" style={inp} />
                    </div>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, fontFamily: FONT, fontSize: '0.85rem', color: T.inkSoft, cursor: 'pointer' }}>
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
                        <span>I agree to share this movement data and the two face-blurred stills with my coach. I can delete a clip at any time. This is coaching feedback, not medical advice.</span>
                    </label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                        <button type="button" style={{ ...btn, background: T.highGreen, opacity: consent ? 1 : 0.5 }} disabled={!consent || sending} onClick={send}>
                            {sending ? 'sending…' : '✓ send to coach'}
                        </button>
                        <button type="button" onClick={() => setResult(null)} style={{ fontFamily: FONT, fontSize: '0.9rem', background: 'none', border: 'none', color: T.pencil, textDecoration: 'underline', cursor: 'pointer' }}>discard</button>
                    </div>
                </div>
            )}

            {clips.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontFamily: MARKER, fontSize: '0.85rem', color: T.inkSoft }}>Sent clips</div>
                    {clips.map(c => (
                        <div key={c.id} style={{ padding: '7px 0', borderBottom: `1px dashed ${T.ruled}`, fontFamily: FONT, fontSize: '0.95rem', color: T.inkSoft }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ flex: 1, minWidth: 160 }}>
                                    <strong style={{ color: T.ink }}>{c.exercise}</strong> · {c.view} · {new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    {c.metrics ? ` · ${c.metrics.repCount} reps` : ''}
                                </span>
                                <span style={{ fontFamily: MARKER, fontSize: '0.7rem', borderRadius: 4, padding: '1px 7px', background: c.status === 'reviewed' ? T.highGreen : T.highYellow, color: T.ink }}>
                                    {c.status === 'reviewed' ? 'reviewed' : 'waiting for coach'}
                                </span>
                                <button type="button" onClick={() => remove(c.id)} aria-label="Delete clip" style={{ fontFamily: FONT, fontSize: '0.9rem', background: 'none', border: 'none', color: T.margin, cursor: 'pointer', padding: 2 }}>&#10005;</button>
                            </div>
                            {c.coachNote && (
                                <div style={{ marginTop: 5, padding: '6px 10px', background: T.sticky, borderRadius: 4, fontSize: '0.92rem', color: T.ink, whiteSpace: 'pre-wrap' }}>
                                    <span style={{ fontFamily: MARKER, fontSize: '0.72rem', color: T.inkSoft }}>coach: </span>{c.coachNote}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
