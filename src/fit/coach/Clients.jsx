// Coach dashboard: the client list and one client's page (journal, nutrition, records, form checks).
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.
import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape } from '../theme';

const DAY_MS = 86400000;
const pad2 = (n) => String(n).padStart(2, '0');
// Local-calendar date math on "YYYY-MM-DD" strings (no UTC conversion, so no off-by-one days)
const addDays = (d, n) => { const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n); return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`; };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / DAY_MS);
const shortDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const longDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const fullName = (c) => `${c.firstName} ${c.lastName}`;
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString());
const GOAL = { lose: 'lose fat', build: 'build muscle', maintain: 'maintain', endurance: 'endurance' };
const INACTIVE_DAYS = 3; // flag clients who haven't logged anything for this many days

function activity(lastActive, today) {
    if (!lastActive) return { text: 'never logged', alert: true };
    const n = daysBetween(lastActive, today);
    if (n <= 0) return { text: 'active today', alert: false };
    if (n === 1) return { text: 'active yesterday', alert: false };
    return { text: `last active ${n} days ago`, alert: n >= INACTIVE_DAYS };
}

const pill = (bg, color = T.ink) => ({ fontFamily: MARKER, fontSize: '0.68rem', background: bg, color, borderRadius: 4, padding: '1px 7px', whiteSpace: 'nowrap' });
const tileLabel = { fontSize: '0.66rem', letterSpacing: '0.08em', color: T.pencil, fontWeight: 700, fontFamily: FONT };
const tileValue = { fontSize: '1.25rem', fontWeight: 700, color: T.ink, fontFamily: FONT };

function Tile({ label, value, sub }) {
    return (
        <div style={{ minWidth: 96 }}>
            <div style={tileLabel}>{label}</div>
            <div style={tileValue}>{value}</div>
            {sub && <div style={{ fontFamily: FONT, fontSize: '0.78rem', color: T.pencil }}>{sub}</div>}
        </div>
    );
}

// ── Client list ────────────────────────────────────────────────────────────

export function ClientList({ onOpen }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        let cancelled = false;
        axiosInstance.get('/api/coach/clients')
            .then(r => { if (!cancelled) setData(r.data); })
            .catch(e => { console.error(e); if (!cancelled) setError('Could not load clients.'); });
        return () => { cancelled = true; };
    }, []);

    const needsAttention = (c) => c.clipsNew > 0 || activity(c.lastActive, data.today).alert;
    const shown = useMemo(() => {
        if (!data) return [];
        const q = query.trim().toLowerCase();
        return data.clients.filter(c =>
            (!q || fullName(c).toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)) &&
            (filter === 'all' || needsAttention(c)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, query, filter]);

    if (error) return <div style={{ color: '#f0a49c', fontFamily: FONT }}>{error}</div>;
    if (!data) return <div style={{ color: '#bab09c', fontFamily: FONT }}>Loading clients&hellip;</div>;

    const attentionCount = data.clients.filter(needsAttention).length;
    const activeWeek = data.clients.filter(c => c.daysLogged7 > 0).length;
    const chip = (v, label) => (
        <button type="button" onClick={() => setFilter(v)}
            style={{ fontFamily: FONT, fontSize: '0.88rem', padding: '5px 14px', borderRadius: 50, cursor: 'pointer', border: `1px solid ${T.ruled}`, background: filter === v ? T.highYellow : '#fffdf6', color: T.ink }}>{label}</button>
    );

    return (
        <div>
            <Paper lined={false} style={{ padding: '14px 18px', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Tile label="CLIENTS" value={data.clients.length} />
                    <Tile label="ACTIVE THIS WEEK" value={activeWeek} />
                    <Tile label="NEED ATTENTION" value={attentionCount} sub={`new form checks or ${INACTIVE_DAYS}+ days quiet`} />
                    <span style={{ flex: 1 }} />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search name or email" aria-label="Search clients"
                        style={{ flex: '1 1 200px', maxWidth: 280, padding: '7px 4px', background: '#fffdf6', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1rem', color: T.ink, outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {chip('all', `all (${data.clients.length})`)}
                    {chip('attention', `needs attention (${attentionCount})`)}
                </div>
            </Paper>

            {shown.length === 0 ? (
                <div style={{ color: '#bab09c', fontFamily: FONT, padding: 8 }}>
                    {data.clients.length === 0 ? 'No clients yet. They show up here once they sign up for DeWhitt Fit.' : 'Nobody matches.'}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 12 }}>
                    {shown.map(c => {
                        const act = activity(c.lastActive, data.today);
                        const kcalOff = c.avgCalories7 != null && c.calorieTarget ? c.avgCalories7 - c.calorieTarget : null;
                        return (
                            <button key={c.id} type="button" onClick={() => onOpen(c.id)}
                                style={{ textAlign: 'left', cursor: 'pointer', border: `1px solid ${T.ruled}`, borderRadius: 8, padding: '14px 16px', background: 'linear-gradient(180deg, #fcf7ec, #f7f0e1)', boxShadow: '0 6px 16px rgba(90,65,30,0.14)', fontFamily: FONT, color: T.inkSoft }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                                    <strong style={{ fontFamily: MARKER, fontWeight: 400, fontSize: '1.1rem', color: T.ink }}>{fullName(c)}</strong>
                                    <span style={{ flex: 1 }} />
                                    {c.clipsNew > 0 && <span style={pill(T.highYellow)}>{c.clipsNew} new form check{c.clipsNew > 1 ? 's' : ''}</span>}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: T.pencil, marginTop: 2 }}>
                                    {GOAL[c.goalType] ? `goal: ${GOAL[c.goalType]}` : 'no goal set'}
                                </div>
                                <div style={{ marginTop: 8, fontSize: '0.88rem', color: act.alert ? T.margin : T.inkSoft, fontWeight: act.alert ? 700 : 400 }}>
                                    {act.alert ? '! ' : ''}{act.text}{c.streak > 0 ? ` · ★ ${c.streak}-day streak` : ''}
                                </div>
                                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${T.ruled}` }}>
                                    <Tile label="LOGGED (7D)" value={`${c.daysLogged7}/7`} />
                                    <Tile label="WORKOUTS (7D)" value={c.workouts7} />
                                    <Tile label="AVG KCAL (7D)" value={fmt(c.avgCalories7)}
                                        sub={kcalOff == null ? (c.calorieTarget ? `target ${fmt(c.calorieTarget)}` : 'no target') : `${kcalOff >= 0 ? '+' : '−'}${fmt(Math.abs(kcalOff))} vs target`} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── One client ─────────────────────────────────────────────────────────────

/** Calories eaten per day as thin bars, with the daily target as a dashed line. Hover a bar for the numbers. */
function CalorieChart({ days, target, start, end }) {
    const [hover, setHover] = useState(null);
    const dates = [];
    for (let d = start; d <= end; d = addDays(d, 1)) dates.push(d);
    const byDate = Object.fromEntries(days.map(d => [d.date, d]));
    const max = Math.max(target || 0, ...days.map(d => d.calories), 1) * 1.1;
    const W = 640, H = 170, padL = 40, padR = 8, padT = 10, padB = 22;
    const slot = (W - padL - padR) / dates.length;
    const bw = Math.max(3, Math.min(18, slot * 0.6));
    const y = (v) => padT + (1 - v / max) * (H - padT - padB);
    const ticks = [0, max / 2, max].map(v => Math.round(v / 100) * 100);
    const h = hover && byDate[hover];

    return (
        <div>
            <div style={{ fontFamily: FONT, fontSize: '0.85rem', color: T.inkSoft, minHeight: 20 }}>
                {hover ? `${longDate(hover)}: ${h ? `${fmt(h.calories)} kcal eaten · ${fmt(h.burned)} burned` : 'nothing logged'}${target ? ` · target ${fmt(target)}` : ''}`
                    : 'Calories eaten per day' + (target ? ' (dashed line = daily target)' : '')}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Calories eaten per day" onMouseLeave={() => setHover(null)}>
                {ticks.map(v => (
                    <g key={v}>
                        <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke={T.ruledSoft} />
                        <text x={padL - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill={T.pencil} fontFamily={FONT}>{v.toLocaleString()}</text>
                    </g>
                ))}
                {dates.map((d, i) => {
                    const cx = padL + slot * (i + 0.5);
                    const v = byDate[d]?.calories || 0;
                    const top = y(v), base = y(0);
                    const r = Math.min(4, bw / 2, base - top);
                    return (
                        <g key={d} onMouseEnter={() => setHover(d)} onClick={() => setHover(d)}>
                            <rect x={cx - slot / 2} y={padT} width={slot} height={H - padT - padB} fill="transparent" />
                            {v > 0 && <path d={`M${cx - bw / 2},${base} V${top + r} Q${cx - bw / 2},${top} ${cx - bw / 2 + r},${top} H${cx + bw / 2 - r} Q${cx + bw / 2},${top} ${cx + bw / 2},${top + r} V${base} Z`}
                                fill={T.calorie} opacity={hover && hover !== d ? 0.45 : 1} />}
                            {(i === 0 || i === dates.length - 1 || dates.length <= 14) && (
                                <text x={cx} y={H - 6} textAnchor="middle" fontSize="10" fill={T.pencil} fontFamily={FONT}>{Number(d.slice(8))}</text>
                            )}
                        </g>
                    );
                })}
                {target ? <line x1={padL} x2={W - padR} y1={y(target)} y2={y(target)} stroke={T.ink} strokeWidth="1.5" strokeDasharray="5 4" /> : null}
            </svg>
        </div>
    );
}

function DayRow({ day }) {
    const [open, setOpen] = useState(false);
    const empty = !day.workouts.length && !day.foods.length && !day.calories && !day.water && !day.sleep && !day.notes;
    if (empty) {
        return <div style={{ padding: '6px 0', borderBottom: `1px dashed ${T.ruled}`, fontFamily: FONT, color: T.pencil, fontSize: '0.9rem' }}>{longDate(day.date)} &mdash; nothing logged</div>;
    }
    const hasDetail = day.foods.length > 0;
    return (
        <div style={{ padding: '8px 0', borderBottom: `1px dashed ${T.ruled}`, fontFamily: FONT, color: T.inkSoft, fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline' }}>
                <strong style={{ color: T.ink, minWidth: 100 }}>{longDate(day.date)}</strong>
                <span><span style={{ color: T.calorie, fontWeight: 700 }}>{fmt(day.calories)}</span> kcal in · {fmt(day.burned)} out</span>
                {day.calories > 0 && <span style={{ color: T.pencil }}>P{day.protein} / C{day.carbs} / F{day.fat}</span>}
                <span style={{ color: T.pencil }}>{'💧'} {day.water}/8 · {'😴'} {day.sleep ? `${day.sleep}h` : '—'}{day.weight ? ` · ⚖ ${day.weight}` : ''}</span>
                {hasDetail && <button type="button" onClick={() => setOpen(o => !o)} style={{ fontFamily: FONT, fontSize: '0.8rem', background: 'none', border: 'none', color: T.blue, textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>{open ? 'hide food' : `food (${day.foods.length})`}</button>}
            </div>
            {day.workouts.length > 0 && (
                <div style={{ marginTop: 3 }}>
                    {day.workouts.map((w, i) => (
                        <span key={i} style={{ display: 'inline-block', marginRight: 12 }}>
                            <span style={{ color: '#d9544a', fontWeight: 700 }}>&bull;</span> {w.type} {w.sets ? `${w.sets}×${w.reps}${w.load ? ` @ ${Math.round(w.load)}` : ''}` : `${w.durationMinutes} min`}
                        </span>
                    ))}
                </div>
            )}
            {day.notes && <div style={{ marginTop: 4, padding: '4px 8px', background: 'rgba(255,255,255,0.5)', borderLeft: `3px solid ${T.ruled}`, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>&ldquo;{day.notes}&rdquo;</div>}
            {open && (
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '0.88rem' }}>
                    {day.foods.map((f, i) => <li key={i}>{f.name}{f.serving ? ` (${f.serving})` : ''} &mdash; {fmt(f.calories)} kcal · P{f.protein}/C{f.carbs}/F{f.fat}</li>)}
                </ul>
            )}
        </div>
    );
}

export function ClientDetail({ clientId, onBack, onOpenClip }) {
    const [range, setRange] = useState(14);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        axiosInstance.get(`/api/coach/clients/${clientId}`, { params: { days: range } })
            .then(r => { if (!cancelled) { setData(r.data); setError(''); } })
            .catch(e => { console.error(e); if (!cancelled) setError(e?.response?.status === 404 ? 'Client not found.' : 'Could not load this client.'); });
        return () => { cancelled = true; };
    }, [clientId, range]);

    const back = <button type="button" onClick={onBack} style={{ fontFamily: FONT, background: 'none', border: 'none', color: '#f3ead6', cursor: 'pointer', fontSize: '0.95rem', padding: '0 0 10px' }}>&larr; all clients</button>;
    if (error) return <div>{back}<div style={{ color: '#f0a49c', fontFamily: FONT }}>{error}</div></div>;
    if (!data) return <div>{back}<div style={{ color: '#bab09c', fontFamily: FONT }}>Loading&hellip;</div></div>;

    const { client, streak, journal, prs, clips, weights, today } = data;
    const u = client.unit === 'metric' ? 'kg' : 'lb';
    const act = activity(journal.length ? journal[0].date : null, today);
    const fed = journal.filter(d => d.calories > 0);
    const avg = (arr, f) => (arr.length ? arr.reduce((s, d) => s + f(d), 0) / arr.length : null);
    const avgKcal = avg(fed, d => d.calories);
    const avgProtein = avg(fed, d => d.protein);
    const slept = journal.filter(d => d.sleep > 0);
    const watered = journal.filter(d => d.water > 0);
    const workoutCount = journal.reduce((s, d) => s + d.workouts.length, 0);
    const daysLogged = journal.filter(d => d.workouts.length || d.foods.length || d.calories || d.water || d.sleep || d.notes).length;
    const lastWeight = weights.length ? weights[weights.length - 1] : null;
    const firstWeight = weights.length ? weights[0] : null;
    const newClips = clips.filter(c => c.status === 'new').length;

    // Every day in the range, newest first, so gaps are visible
    const allDays = [];
    const byDate = Object.fromEntries(journal.map(d => [d.date, d]));
    for (let i = 0; i < data.range.days; i++) {
        const d = addDays(today, -i);
        allDays.push(byDate[d] || { date: d, workouts: [], foods: [], calories: 0, water: 0, sleep: 0, notes: '' });
    }

    const rangeBtn = (n) => (
        <button key={n} type="button" onClick={() => setRange(n)}
            style={{ fontFamily: FONT, fontSize: '0.85rem', padding: '3px 11px', borderRadius: 50, cursor: 'pointer', border: `1px solid ${T.ruled}`, background: range === n ? T.highYellow : '#fffdf6', color: T.ink }}>{n} days</button>
    );
    const section = { padding: '18px 22px', marginTop: 16 };

    return (
        <div>
            {back}
            <Paper lined={false} style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
                    <MarkerTitle style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)' }}>{fullName(client)}</MarkerTitle>
                    <a href={`mailto:${client.email}`} style={{ fontFamily: FONT, color: T.blue, fontSize: '0.9rem' }}>{client.email}</a>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontFamily: FONT, fontSize: '0.85rem', color: T.pencil }}>joined {client.joined ? new Date(client.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                </div>
                <div style={{ fontFamily: FONT, fontSize: '0.92rem', color: act.alert ? T.margin : T.inkSoft, marginTop: 4, fontWeight: act.alert ? 700 : 400 }}>
                    {act.alert ? '! ' : ''}{act.text} · {'★'} {streak.current}-day streak (best {streak.best})
                </div>
                <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginTop: 14 }}>
                    <Tile label="GOAL" value={GOAL[client.goalType] || '—'} />
                    <Tile label="WEIGHT" value={client.currentWeight ? `${client.currentWeight} ${u}` : '—'}
                        sub={client.goalWeight ? `goal ${client.goalWeight} ${u}${client.startWeight ? ` · started ${client.startWeight}` : ''}` : null} />
                    <Tile label="DAILY TARGET" value={client.calorieTarget ? `${fmt(client.calorieTarget)} kcal` : '—'} sub={client.calorieTarget ? null : 'profile incomplete'} />
                    <Tile label="PROFILE" value={client.age ? `${client.age} y` : '—'} sub={[client.gender, client.height ? `${client.height} ${client.unit === 'metric' ? 'cm' : 'in'}` : null, client.activityLevel].filter(Boolean).join(' · ') || null} />
                </div>
            </Paper>

            <Paper lined={false} style={section}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <MarkerTitle style={{ fontSize: '1.15rem' }}>Last {data.range.days} days</MarkerTitle>
                    <span style={{ flex: 1 }} />
                    {[7, 14, 30].map(rangeBtn)}
                </div>
                <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginTop: 12 }}>
                    <Tile label="DAYS LOGGED" value={`${daysLogged}/${data.range.days}`} />
                    <Tile label="WORKOUTS" value={workoutCount} />
                    <Tile label="AVG KCAL" value={fmt(avgKcal && Math.round(avgKcal))} sub={avgKcal && client.calorieTarget ? `${Math.round(avgKcal - client.calorieTarget) >= 0 ? '+' : '−'}${fmt(Math.abs(Math.round(avgKcal - client.calorieTarget)))} vs target · ${fed.length} days tracked` : `${fed.length} days tracked`} />
                    <Tile label="AVG PROTEIN" value={avgProtein != null ? `${Math.round(avgProtein)} g` : '—'} />
                    <Tile label="AVG SLEEP" value={slept.length ? `${(avg(slept, d => d.sleep)).toFixed(1)} h` : '—'} />
                    <Tile label="AVG WATER" value={watered.length ? `${(avg(watered, d => d.water)).toFixed(1)}/8` : '—'} />
                    {lastWeight && <Tile label="WEIGH-INS" value={`${lastWeight.weight} ${u}`} sub={weights.length > 1 ? `${(lastWeight.weight - firstWeight.weight) >= 0 ? '+' : ''}${(lastWeight.weight - firstWeight.weight).toFixed(1)} since ${shortDate(firstWeight.date)}` : shortDate(lastWeight.date)} />}
                </div>
                <div style={{ marginTop: 14 }}>
                    <CalorieChart days={journal} target={client.calorieTarget} start={data.range.start} end={data.range.end} />
                </div>
            </Paper>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
                <Paper lined={false} style={section}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <MarkerTitle style={{ fontSize: '1.15rem' }}>Form checks</MarkerTitle>
                        {newClips > 0 && <span style={pill(T.highYellow)}>{newClips} new</span>}
                    </div>
                    {clips.length === 0 ? <div style={{ fontFamily: FONT, color: T.pencil, marginTop: 8 }}>No form checks sent yet.</div> : clips.map(c => (
                        <button key={c.id} type="button" onClick={() => onOpenClip(c.id)}
                            style={{ display: 'block', width: '100%', textAlign: 'left', marginTop: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', border: `1px solid ${T.ruled}`, background: '#fffdf8', fontFamily: FONT, color: T.inkSoft }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                                <strong style={{ color: T.ink }}>{c.exercise}</strong>
                                <span style={{ flex: 1 }} />
                                <span style={pill(c.status === 'new' ? T.highYellow : T.highGreen)}>{c.status === 'new' ? 'NEW' : 'reviewed'}</span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: T.pencil }}>
                                {shortDate(c.date)} · {c.view}{c.metrics ? ` · ${c.metrics.repCount} reps` : ''}{c.metrics?.observations?.some(o => o.level === 'flag') ? ' · ! flagged' : ''}
                            </div>
                        </button>
                    ))}
                </Paper>
                <Paper lined={false} style={section}>
                    <MarkerTitle style={{ fontSize: '1.15rem' }}>Personal records</MarkerTitle>
                    {prs.length === 0 ? <div style={{ fontFamily: FONT, color: T.pencil, marginTop: 8 }}>No lifts with weight logged yet.</div> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6, fontFamily: FONT, fontSize: '0.92rem' }}>
                            <tbody>
                                {prs.slice(0, 10).map(p => (
                                    <tr key={p.exercise} style={{ borderBottom: `1px dashed ${T.ruled}` }}>
                                        <td style={{ padding: '5px 4px', color: T.ink, fontWeight: 700 }}>{p.exercise}</td>
                                        <td style={{ padding: '5px 4px', color: T.inkSoft, whiteSpace: 'nowrap' }}>{p.load} {u} &times; {p.reps}</td>
                                        <td style={{ padding: '5px 4px', color: T.inkSoft, whiteSpace: 'nowrap' }}>est. {Math.round(p.e1rm)} 1RM</td>
                                        <td style={{ padding: '5px 4px', color: T.pencil, whiteSpace: 'nowrap', textAlign: 'right' }}>{shortDate(p.date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Paper>
            </div>

            <Paper margin style={{ ...section, padding: '18px 22px 22px 58px' }}>
                <Tape rotate={-2}>JOURNAL</Tape>
                <div style={{ marginTop: 10 }}>
                    {allDays.map(d => <DayRow key={d.date} day={d} />)}
                </div>
            </Paper>
        </div>
    );
}
