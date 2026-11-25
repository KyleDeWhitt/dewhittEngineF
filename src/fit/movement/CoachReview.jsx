// Coach form-check views: the inbox of clients' clips and the full review of one clip.
// Used inside the coach dashboard (../coach/CoachDashboard.jsx), which checks the coach role.
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape } from '../theme';
import { analyzeClip, computeSeries, JOINTS, JOINT_LABEL } from './analysis';
import { SkeletonPlayer, StillWithSkeleton, AngleChart } from './MovementViews';
import { JOINT_COLOR } from './draw';
import { Observations } from './FormCheck';

const fmtDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const name = (c) => (c?.client ? `${c.client.firstName} ${c.client.lastName}` : 'Client');

export function ClipDetail({ clipId, onChanged, onOpenClient }) {
    const [clip, setClip] = useState(null);
    const [error, setError] = useState('');
    const [time, setTime] = useState(0);
    const [shown, setShown] = useState(null); // joints shown on the chart
    const [sideMode, setSideMode] = useState('main'); // main | LR
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState('');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const r = await axiosInstance.get(`/api/movement/coach/clips/${clipId}`, { timeout: 60000 });
                if (cancelled) return;
                const c = r.data.clip;
                setClip(c); setNote(c.coachNote || ''); setTime(0); setShown(null); setSaved(''); setError('');
                const h = await axiosInstance.get('/api/movement/coach/clips', { params: { userId: c.userId } });
                if (!cancelled) setHistory((h.data.clips || []).filter(x => x.exercise === c.exercise));
            } catch (e) {
                console.error(e);
                if (!cancelled) setError('Could not load this clip.');
            }
        })();
        return () => { cancelled = true; };
    }, [clipId]);

    // Recompute from the raw tracking data so every clip uses the current analysis
    const series = useMemo(() => (clip?.poseData ? computeSeries(clip.poseData, clip.view) : null), [clip]);
    const metrics = useMemo(() => (clip?.poseData ? analyzeClip(clip.poseData, clip.exercise, clip.view) : null), [clip]);
    const joints = useMemo(() => shown || (metrics ? [metrics.primary, ...(metrics.primary === 'knee' ? ['hip'] : metrics.primary === 'hip' ? ['knee'] : [])] : []), [shown, metrics]);
    const showTrunk = shown ? shown.includes('trunk') : (metrics && (metrics.primary === 'knee' || metrics.primary === 'hip'));

    const lines = useMemo(() => {
        if (!series) return [];
        const out = [];
        for (const j of joints) {
            if (j === 'trunk' || !series.joints[j]) continue;
            if (sideMode === 'LR') {
                out.push({ key: j + 'L', label: `${JOINT_LABEL[j]} (left)`, values: series.joints[j].L, color: JOINT_COLOR[j] });
                out.push({ key: j + 'R', label: `${JOINT_LABEL[j]} (right)`, values: series.joints[j].R, color: JOINT_COLOR[j], dashed: true });
            } else {
                out.push({ key: j, label: JOINT_LABEL[j], values: series.joints[j].main, color: JOINT_COLOR[j] });
            }
        }
        if (showTrunk) out.push({ key: 'trunk', label: 'Torso lean from vertical', values: series.trunk, color: JOINT_COLOR.trunk, dashed: true });
        return out;
    }, [series, joints, sideMode, showTrunk]);

    const toggle = (j) => {
        const cur = shown || [...joints, ...(showTrunk ? ['trunk'] : [])];
        setShown(cur.includes(j) ? cur.filter(x => x !== j) : [...cur, j]);
    };

    const save = async (status) => {
        setSaving(true); setSaved('');
        try {
            const r = await axiosInstance.put(`/api/movement/coach/clips/${clipId}`, { coachNote: note, ...(status ? { status } : {}) });
            setClip(c => ({ ...c, ...r.data.clip }));
            setSaved(status === 'reviewed' ? 'Marked reviewed. Your client can see your note.' : status === 'new' ? 'Moved back to new.' : 'Note saved.');
            onChanged();
        } catch (e) { console.error(e); setSaved('Save failed.'); }
        finally { setSaving(false); }
    };

    if (error) return <div style={{ fontFamily: FONT, color: T.margin }}>{error}</div>;
    if (!clip || !metrics) return <div style={{ fontFamily: FONT, color: T.pencil }}>Loading clip…</div>;

    const word = metrics.direction === 'up' ? 'Top' : 'Bottom';
    const front = clip.view === 'front';
    const pill = (on, color) => ({ fontFamily: FONT, fontSize: '0.8rem', padding: '3px 10px', borderRadius: 50, cursor: 'pointer', border: `1px solid ${on ? color || T.ink : T.ruled}`, background: on ? '#fffdf6' : 'transparent', color: on ? (color || T.ink) : T.pencil, fontWeight: on ? 700 : 400 });
    const th = { textAlign: 'left', padding: '4px 8px', fontFamily: MARKER, fontSize: '0.72rem', color: T.pencil, fontWeight: 400, borderBottom: `1px solid ${T.ruled}`, whiteSpace: 'nowrap' };
    const td = { padding: '4px 8px', fontFamily: FONT, fontSize: '0.92rem', color: T.inkSoft, borderBottom: `1px dashed ${T.ruled}`, whiteSpace: 'nowrap' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <MarkerTitle style={{ fontSize: '1.3rem' }}>{name(clip)} · {clip.exercise}</MarkerTitle>
                {onOpenClient && <button type="button" onClick={() => onOpenClient(clip.userId)} style={{ fontFamily: FONT, fontSize: '0.85rem', background: 'none', border: 'none', color: T.blue, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>view client &rarr;</button>}
                <span style={{ fontFamily: FONT, color: T.pencil, fontSize: '0.9rem' }}>{fmtDate(clip.date)} · {clip.view} view · {Number(clip.durationSec || 0).toFixed(1)}s</span>
            </div>
            {clip.clientNote && (
                <div style={{ marginTop: 8, padding: '6px 10px', background: T.highPink, borderRadius: 4, fontFamily: FONT, color: T.ink }}>
                    <span style={{ fontFamily: MARKER, fontSize: '0.72rem', color: T.inkSoft }}>client: </span>{clip.clientNote}
                </div>
            )}

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 260px', maxWidth: 380 }}>
                    <SkeletonPlayer poseData={clip.poseData} series={series} primary={metrics.primary} view={clip.view} time={time} onTime={setTime} height={380} />
                </div>
                <div style={{ flex: '2 1 320px', minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontFamily: FONT }}>
                        {[
                            ['REPS', metrics.repCount],
                            [`${JOINT_LABEL[metrics.primary].toUpperCase()} RANGE`, metrics.rom[metrics.primary] ? `${metrics.rom[metrics.primary].min}–${metrics.rom[metrics.primary].max}°` : '—'],
                            ['TRACKED', `${metrics.trackedPct}%`],
                            ...(metrics.side ? [['NEAR SIDE', metrics.side === 'L' ? 'left' : 'right']] : []),
                        ].map(([k, v]) => (
                            <div key={k}>
                                <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: T.pencil, fontWeight: 700 }}>{k}</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: T.ink }}>{v}</div>
                            </div>
                        ))}
                    </div>
                    <Observations items={metrics.observations} />
                    {clip.stills?.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                            {clip.stills.map((s, i) => <StillWithSkeleton key={i} still={s} poseData={clip.poseData} onClick={() => setTime(s.t)} />)}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: MARKER, fontSize: '0.8rem', color: T.inkSoft, marginRight: 4 }}>Angles</span>
                    {JOINTS.map(j => <button key={j} type="button" onClick={() => toggle(j)} style={pill(joints.includes(j), JOINT_COLOR[j])}>{JOINT_LABEL[j]}</button>)}
                    <button type="button" onClick={() => toggle('trunk')} style={pill(showTrunk, JOINT_COLOR.trunk)}>Torso</button>
                    <span style={{ width: 10 }} />
                    <button type="button" onClick={() => setSideMode(m => (m === 'LR' ? 'main' : 'LR'))} style={pill(sideMode === 'LR')}>left vs right</button>
                </div>
                <AngleChart t={series.t} lines={lines} reps={metrics.reps} time={time} onTime={setTime} />
                <div style={{ fontFamily: FONT, fontSize: '0.75rem', color: T.pencil, marginTop: 6 }}>
                    Click the chart to jump the replay. Angles are single-camera estimates (typically 5–10° off; worst for rotation and ankles). {front ? 'Front view: use for left/right comparison more than depth.' : 'Side view: the side nearer the camera is the reliable one.'}
                </div>
            </div>

            {metrics.reps.length > 0 && (
                <div style={{ marginTop: 16, overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={th}>Rep</th>
                                <th style={th}>{word} {JOINT_LABEL[metrics.primary].toLowerCase()}</th>
                                {front && <th style={th}>Left / right</th>}
                                {metrics.reps[0].hip != null && <th style={th}>Hip at {word.toLowerCase()}</th>}
                                {metrics.reps[0].knee != null && <th style={th}>Knee at {word.toLowerCase()}</th>}
                                <th style={th}>Torso lean</th>
                                <th style={th}>Lowering</th>
                                <th style={th}>Lifting</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.reps.map(r => (
                                <tr key={r.n} onClick={() => setTime(r.bottom)} style={{ cursor: 'pointer' }}>
                                    <td style={td}>{r.n}</td>
                                    <td style={{ ...td, fontWeight: 700, color: T.ink }}>{r.value ?? '—'}°</td>
                                    {front && <td style={td}>{r.left ?? '—'}° / {r.right ?? '—'}°</td>}
                                    {metrics.reps[0].hip != null && <td style={td}>{r.hip ?? '—'}°</td>}
                                    {metrics.reps[0].knee != null && <td style={td}>{r.knee ?? '—'}°</td>}
                                    <td style={td}>{r.trunk ?? '—'}°</td>
                                    <td style={td}>{r.down}s</td>
                                    <td style={td}>{r.up}s</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {history.length > 1 && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontFamily: MARKER, fontSize: '0.8rem', color: T.inkSoft }}>{name(clip).split(' ')[0]}'s {clip.exercise} history</div>
                    {history.map(h => {
                        const vals = (h.metrics?.reps || []).map(r => r.value).filter(v => v != null);
                        const avgV = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
                        return (
                            <div key={h.id} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: FONT, fontSize: '0.9rem', color: h.id === clip.id ? T.ink : T.inkSoft, fontWeight: h.id === clip.id ? 700 : 400, padding: '3px 0', borderBottom: `1px dashed ${T.ruled}` }}>
                                <span style={{ minWidth: 100 }}>{fmtDate(h.date)}</span>
                                <span>{h.view}</span>
                                <span>{h.metrics?.repCount ?? '—'} reps</span>
                                <span>avg {(h.metrics?.direction === 'up' ? 'top' : 'bottom')} {h.metrics ? JOINT_LABEL[h.metrics.primary]?.toLowerCase() : ''} {avgV ?? '—'}°</span>
                                {h.id === clip.id && <span style={{ color: T.pencil, fontWeight: 400 }}>(this clip)</span>}
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ marginTop: 18 }}>
                <MarkerTitle style={{ fontSize: '1rem' }}>Coach notes</MarkerTitle>
                <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What you saw and what to work on. Your client sees this once you mark it reviewed."
                    style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,0.45)', border: `1px dashed ${T.ruled}`, borderRadius: 6, fontFamily: FONT, fontSize: '1.02rem', color: T.ink, resize: 'vertical', outline: 'none', padding: 10, boxSizing: 'border-box', lineHeight: 1.5 }} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                    <button type="button" disabled={saving} onClick={() => save()} style={{ fontFamily: MARKER, fontSize: '0.8rem', background: T.sticky, border: `1px solid ${T.ruled}`, borderRadius: 6, padding: '9px 14px', cursor: 'pointer', color: T.ink }}>save note</button>
                    {clip.status !== 'reviewed' ? (
                        <button type="button" disabled={saving} onClick={() => save('reviewed')} style={{ fontFamily: MARKER, fontSize: '0.8rem', background: T.highGreen, border: '1px solid #9ccd7a', borderRadius: 6, padding: '9px 14px', cursor: 'pointer', color: T.ink }}>✓ mark reviewed</button>
                    ) : (
                        <button type="button" disabled={saving} onClick={() => save('new')} style={{ fontFamily: FONT, fontSize: '0.85rem', background: 'none', border: 'none', color: T.pencil, textDecoration: 'underline', cursor: 'pointer' }}>move back to new</button>
                    )}
                    {saved && <span style={{ fontFamily: FONT, fontSize: '0.85rem', color: T.inkSoft }}>{saved}</span>}
                </div>
            </div>
        </div>
    );
}

export default function FormCheckInbox({ onOpenClient, onChanged }) {
    const [filter, setFilter] = useState('new');
    const [clips, setClips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');

    const fetchClips = useCallback(async () => {
        try {
            const r = await axiosInstance.get('/api/movement/coach/clips', { params: filter === 'all' ? {} : { status: filter } });
            return { clips: r.data.clips || [], error: '' };
        } catch (e) {
            console.error(e);
            return { clips: [], error: 'Could not load clips.' };
        }
    }, [filter]);
    const apply = (res) => { setClips(res.clips); setError(res.error); setLoading(false); };
    const load = useCallback(async () => { apply(await fetchClips()); onChanged && onChanged(); }, [fetchClips, onChanged]);
    useEffect(() => {
        let cancelled = false;
        fetchClips().then(res => { if (!cancelled) apply(res); });
        return () => { cancelled = true; };
    }, [fetchClips]);

    const tab = (v, label) => (
        <button key={v} type="button" onClick={() => { setFilter(v); setLoading(true); }}
            style={{ fontFamily: FONT, fontSize: '0.9rem', padding: '5px 14px', borderRadius: 50, cursor: 'pointer', border: `1px solid ${T.ruled}`, background: filter === v ? T.highYellow : '#fffdf6', color: T.ink }}>{label}</button>
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {tab('new', 'new')}{tab('reviewed', 'reviewed')}{tab('all', 'all')}
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: FONT, fontSize: '0.8rem', color: '#bab09c' }}>Movement data and face-blurred stills. For coaching review, not medical diagnosis.</span>
            </div>
            {error && <div style={{ color: '#f0a49c', marginBottom: 12 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Paper lined={false} style={{ padding: 12, flex: '1 1 240px', maxWidth: 320, maxHeight: '80vh', overflowY: 'auto' }}>
                    {loading ? <div style={{ color: T.pencil, padding: 8 }}>Loading…</div>
                        : clips.length === 0 ? <div style={{ color: T.pencil, padding: 8 }}>{filter === 'new' ? 'No new clips. Nice — inbox zero.' : 'No clips yet.'}</div>
                        : clips.map(c => (
                            <button key={c.id} type="button" onClick={() => setSelected(c.id)}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 10px', marginBottom: 6, borderRadius: 6, cursor: 'pointer', border: selected === c.id ? `2px solid ${T.margin}` : `1px solid ${T.ruled}`, background: selected === c.id ? T.highPink : '#fffdf8', fontFamily: FONT, color: T.inkSoft }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                                    <strong style={{ color: T.ink }}>{name(c)}</strong>
                                    {c.status === 'new' && <span style={{ fontFamily: MARKER, fontSize: '0.65rem', background: T.highYellow, borderRadius: 4, padding: '1px 6px', color: T.ink }}>NEW</span>}
                                </div>
                                <div style={{ fontSize: '0.88rem' }}>{c.exercise} · {c.metrics ? `${c.metrics.repCount} reps` : ''}</div>
                                <div style={{ fontSize: '0.78rem', color: T.pencil }}>
                                    {fmtDate(c.date)} · {c.view}
                                    {c.metrics?.observations?.some(o => o.level === 'flag') ? ' · ! flagged' : ''}
                                </div>
                            </button>
                        ))}
                </Paper>
                <Paper margin style={{ padding: '22px 24px 26px 58px', flex: '3 1 480px', minWidth: 0 }}>
                    {selected ? <ClipDetail clipId={selected} onChanged={load} onOpenClient={onOpenClient} />
                        : <div style={{ color: T.pencil }}><Tape rotate={-2}>PICK A CLIP</Tape><div style={{ marginTop: 12 }}>Choose a clip on the left to replay it and see the angles.</div></div>}
                </Paper>
            </div>
        </div>
    );
}
