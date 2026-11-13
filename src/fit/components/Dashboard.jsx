import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { T, FONT, MARKER, Paper, MarkerTitle, Tape, Highlight } from '../theme';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_FIT_API_URL || 'http://localhost:3000';

// MET values from the 2011 Compendium of Physical Activities.
// Calories burned per minute = MET * 3.5 * bodyWeightKg / 200
const EXERCISES = [
    { name: 'Barbell Squat', met: 5.0, cat: 'Strength' },
    { name: 'Deadlift', met: 6.0, cat: 'Strength' },
    { name: 'Bench Press', met: 5.0, cat: 'Strength' },
    { name: 'Overhead Press', met: 5.0, cat: 'Strength' },
    { name: 'Barbell Row', met: 5.0, cat: 'Strength' },
    { name: 'Pull-ups', met: 8.0, cat: 'Strength' },
    { name: 'Lunges', met: 5.0, cat: 'Strength' },
    { name: 'Dumbbell Curls', met: 3.5, cat: 'Strength' },
    { name: 'Plank', met: 3.0, cat: 'Core' },
    { name: 'Sit-ups', met: 3.8, cat: 'Core' },
    { name: 'Running (6 mph)', met: 9.8, cat: 'Cardio' },
    { name: 'Running (8 mph)', met: 11.8, cat: 'Cardio' },
    { name: 'Walking (brisk)', met: 4.3, cat: 'Cardio' },
    { name: 'Cycling (12\u201314 mph)', met: 8.0, cat: 'Cardio' },
    { name: 'Rowing (moderate)', met: 7.0, cat: 'Cardio' },
    { name: 'Jump Rope', met: 11.8, cat: 'Cardio' },
    { name: 'Stair Climber', met: 8.8, cat: 'Cardio' },
    { name: 'Elliptical', met: 5.0, cat: 'Cardio' },
    { name: 'Swimming (freestyle)', met: 5.8, cat: 'Cardio' },
    { name: 'Burpees', met: 8.0, cat: 'HIIT' },
    { name: 'Kettlebell Swings', met: 9.8, cat: 'HIIT' },
    { name: 'Boxing (bag)', met: 5.5, cat: 'HIIT' },
    { name: 'HIIT Circuit', met: 10.0, cat: 'HIIT' },
    { name: 'Yoga', met: 2.5, cat: 'Mobility' },
    { name: 'Pilates', met: 3.0, cat: 'Mobility' },
    { name: 'Stretching', met: 2.3, cat: 'Mobility' },
];

const CATEGORIES = ['Strength', 'Core', 'Cardio', 'HIIT', 'Mobility'];
const CATEGORY_COLOR = { Strength: '#d9544a', Core: '#b08d2f', Cardio: '#3f6fb5', HIIT: '#d9773f', Mobility: '#5f8f52' };

const weightToKg = (weight, unit) => (unit === 'metric' ? Number(weight) : Number(weight) * 0.453592);
const kcalPerMin = (met, weight, unit) => met * 3.5 * weightToKg(weight, unit) / 200;

const colorFor = (name) => {
    const ex = EXERCISES.find(e => e.name === name);
    return ex ? (CATEGORY_COLOR[ex.cat] || '#8c8171') : '#8c8171';
};

// Exercises recorded as sets x reps (everything else is duration-based)
const REPS_EXERCISES = new Set([
    'Barbell Squat', 'Deadlift', 'Bench Press', 'Overhead Press', 'Barbell Row',
    'Pull-ups', 'Lunges', 'Dumbbell Curls', 'Sit-ups', 'Burpees', 'Kettlebell Swings',
]);
const SECONDS_PER_SET = 45; // rough active time per working set for the MET baseline
const LIFT_DISTANCE = 0.6;      // average meters the bar travels per rep
const MUSCLE_EFFICIENCY = 0.22; // ~22% of energy burned becomes mechanical work
const KCAL_PER_JOULE = 1 / 4184;

const pad = (n) => String(n).padStart(2, '0');
const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const dmark = (color) => ({ width: 8, height: 8, borderRadius: 2, background: color, display: 'inline-block' });
const round10 = (n) => Math.round((Number(n) || 0) * 10) / 10;

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function monthLabel(year, month) {
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
}

// Build a 7-column grid of date strings (null = blank leading/trailing)
function buildGrid(year, month) {
    const startDow = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month)}-${pad(d)}`);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

function Cup({ filled, onClick }) {
    return (
        <button type="button" onClick={onClick} aria-label="water glass"
            style={{ width: 30, height: 40, border: `2px solid ${filled ? T.blue : T.ruled}`, borderRadius: '4px 4px 9px 9px', background: '#fffdf6', position: 'relative', overflow: 'hidden', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: filled ? '100%' : '0%', background: 'rgba(63,111,181,0.35)', transition: 'height .15s ease' }} />
        </button>
    );
}

function WorkoutForm({ onSave, busy, weight, unit, initial, onCancel }) {
    const editing = !!initial;
    const defaultEx = initial?.type && EXERCISES.some(e => e.name === initial.type) ? initial.type : EXERCISES[0].name;
    const [exName, setExName] = useState(defaultEx);
    const [mins, setMins] = useState(initial && !initial.sets ? (initial.durationMinutes || 30) : 30);
    const [sets, setSets] = useState(initial?.sets || 3);
    const [reps, setReps] = useState(initial?.reps || 10);
    const [load, setLoad] = useState(initial?.load != null ? String(initial.load) : '');
    const ex = EXERCISES.find(e => e.name === exName) || EXERCISES[0];
    const isReps = REPS_EXERCISES.has(ex.name);
    const fallbackW = unit === 'metric' ? 70 : 154;
    const perMin = kcalPerMin(ex.met, weight || fallbackW, unit);
    const kg = weightToKg(weight || fallbackW, unit);
    const labelWeight = `${Math.round(weight || fallbackW)} ${unit === 'metric' ? 'kg' : 'lb'}`;

    const loadUnit = unit === 'metric' ? 'kg' : 'lb';
    let kcal, detail;
    if (isReps) {
        const minutes = (Number(sets) || 0) * (SECONDS_PER_SET / 60);
        let baseKcal = ex.met * 3.5 * kg / 200 * minutes;
        const loadKg = load ? (unit === 'metric' ? Number(load) : Number(load) * 0.453592) : 0;
        if (loadKg > 0) {
            const totalReps = (Number(sets) || 0) * (Number(reps) || 0);
            const mechanicalKcal = loadKg * totalReps * LIFT_DISTANCE * 9.81 * KCAL_PER_JOULE;
            baseKcal += mechanicalKcal / MUSCLE_EFFICIENCY;
        }
        kcal = Math.round(baseKcal);
        detail = `${Number(sets) || 0}\u00D7${Number(reps) || 0}${load ? ` @ ${load} ${loadUnit}` : ''}`;
    } else {
        kcal = Math.round(perMin * (Number(mins) || 0));
        detail = `${Number(mins) || 0} min`;
    }

    const inp = { width: '100%', padding: '6px 4px', background: '#fffdf6', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1rem', color: T.ink, boxSizing: 'border-box', outline: 'none' };
    const lbl = { fontFamily: FONT, fontSize: '0.78rem', color: T.pencil, marginBottom: 2 };

    const submit = () => {
        const payload = isReps
            ? { type: exName, sets: Number(sets), reps: Number(reps), load: load ? Number(load) : null, caloriesBurned: kcal }
            : { type: exName, durationMinutes: Number(mins), caloriesBurned: kcal };
        onSave(editing ? { ...payload, id: initial.id } : payload);
    };

    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                    <div style={lbl}>Exercise</div>
                    <select value={exName} onChange={(e) => setExName(e.target.value)} style={inp}>
                        {CATEGORIES.map(c => (
                            <optgroup key={c} label={c}>
                                {EXERCISES.filter(e => e.cat === c).map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
                            </optgroup>
                        ))}
                    </select>
                </div>
                {isReps ? (
                    <>
                        <div style={{ width: 64 }}>
                            <div style={lbl}>Sets</div>
                            <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} style={inp} min="1" />
                        </div>
                        <div style={{ width: 64 }}>
                            <div style={lbl}>Reps</div>
                            <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} style={inp} min="1" />
                        </div>
                        <div style={{ width: 80 }}>
                            <div style={lbl}>Load ({loadUnit})</div>
                            <input type="number" value={load} onChange={(e) => setLoad(e.target.value)} style={inp} min="0" placeholder="0" />
                        </div>
                    </>
                ) : (
                    <div style={{ width: 76 }}>
                        <div style={lbl}>Minutes</div>
                        <input type="number" value={mins} onChange={(e) => setMins(e.target.value)} style={inp} min="1" />
                    </div>
                )}
                <div style={{ minWidth: 96 }}>
                    <div style={lbl}>Burn</div>
                    <div style={{ ...inp, color: T.calorie, fontWeight: 700, whiteSpace: 'nowrap' }}>&asymp; {kcal} kcal</div>
                </div>
                <button type="button" disabled={busy} onClick={submit}
                    style={{ fontFamily: MARKER, fontSize: '0.8rem', background: T.sticky, border: `1px solid ${T.ruled}`, borderRadius: 6, padding: '10px 14px', cursor: 'pointer', color: T.ink, whiteSpace: 'nowrap' }}>
                    {busy ? '…' : (editing ? '\u2713 save' : '+ scribble it')}
                </button>
                {editing && onCancel && (
                    <button type="button" onClick={onCancel}
                        style={{ fontFamily: FONT, fontSize: '0.85rem', background: 'none', border: 'none', color: T.pencil, textDecoration: 'underline', cursor: 'pointer', padding: '10px 4px', whiteSpace: 'nowrap' }}>
                        cancel
                    </button>
                )}
            </div>
            <div style={{ fontFamily: FONT, fontSize: '0.75rem', color: T.pencil, marginTop: 6 }}>
                {ex.name} · MET {ex.met} · {detail}{isReps ? ` at ~${SECONDS_PER_SET}s/set` : ''} · {labelWeight}
            </div>
        </div>
    );
}

const COMMON_FOODS = [
    { name: 'Egg (1 large)', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8 },
    { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: 'Beef 90% (100g)', calories: 176, protein: 20, carbs: 0, fat: 10 },
    { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
    { name: 'Oats (1/2 cup)', calories: 150, protein: 5, carbs: 27, fat: 2.5 },
    { name: 'Rice (1 cup)', calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
    { name: 'Sweet Potato (1)', calories: 103, protein: 2.3, carbs: 24, fat: 0.2 },
    { name: 'Broccoli (1 cup)', calories: 31, protein: 2.5, carbs: 6, fat: 0.3 },
    { name: 'Banana (1)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    { name: 'Greek Yogurt (170g)', calories: 100, protein: 17, carbs: 6, fat: 0.7 },
    { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14 },
    { name: 'Peanut Butter (2 tbsp)', calories: 188, protein: 8, carbs: 6, fat: 16 },
    { name: 'Whey (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 1.5 },
    { name: 'Apple (1)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
];

function FoodSection({ date, onChanged }) {
    const [foods, setFoods] = useState([]);
    const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [note, setNote] = useState('');
    const [form, setForm] = useState({ name: '', serving: '', calories: '', protein: '', carbs: '', fat: '' });
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const r = await axiosInstance.get(`${API_URL}/api/fitness/foods`, { params: { date } });
            setFoods(r.data.foods || []);
            setTotals(r.data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
        } catch (e) { console.error(e); }
    }, [date]);

    useEffect(() => { load(); }, [load]);

    const addFood = async (payload) => {
        if (!payload.name) return;
        setBusy(true);
        try {
            await axiosInstance.post(`${API_URL}/api/fitness/foods`, { ...payload, date });
            setForm({ name: '', serving: '', calories: '', protein: '', carbs: '', fat: '' });
            await load();
            onChanged && onChanged();
        } catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    const deleteFood = async (id) => {
        setBusy(true);
        try { await axiosInstance.delete(`${API_URL}/api/fitness/foods/${id}`); await load(); onChanged && onChanged(); }
        catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    const search = async () => {
        if (!query.trim()) return;
        setSearching(true); setNote('');
        try {
            const r = await axiosInstance.get(`${API_URL}/api/fitness/food-search`, { params: { q: query } });
            setResults(r.data.results || []);
            if (r.data.error) setNote(r.data.error);
        } catch (e) { setNote('Search failed \u2014 type macros manually.'); }
        finally { setSearching(false); }
    };

    const prefill = (r) => setForm({ name: r.name, serving: r.serving || '100 g', calories: String(r.calories ?? ''), protein: String(r.protein ?? ''), carbs: String(r.carbs ?? ''), fat: String(r.fat ?? '') });

    const inp = { width: '100%', padding: '6px 4px', background: '#fffdf6', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '0.95rem', color: T.ink, boxSizing: 'border-box', outline: 'none' };
    const lbl = { fontFamily: FONT, fontSize: '0.75rem', color: T.pencil, marginBottom: 2 };

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 10, fontFamily: FONT, fontSize: '0.95rem' }}>
                <span style={{ color: T.pencil }}>Totals:</span>
                <span style={{ color: T.calorie, fontWeight: 700 }}>{totals.calories} kcal</span>
                <span style={{ color: T.inkSoft }}><strong style={{ color: '#d9544a' }}>P</strong> {totals.protein}g</span>
                <span style={{ color: T.inkSoft }}><strong style={{ color: T.blue }}>C</strong> {totals.carbs}g</span>
                <span style={{ color: T.inkSoft }}><strong style={{ color: '#d9773f' }}>F</strong> {totals.fat}g</span>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <div style={lbl}>Search food (online)</div>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder="e.g. chicken breast" style={inp} />
                </div>
                <button type="button" onClick={search} disabled={searching} style={{ fontFamily: MARKER, fontSize: '0.8rem', background: T.sticky, border: `1px solid ${T.ruled}`, borderRadius: 6, padding: '8px 14px', cursor: 'pointer', color: T.ink, whiteSpace: 'nowrap' }}>{searching ? '…' : 'search'}</button>
            </div>
            {note && <div style={{ fontFamily: FONT, fontSize: '0.75rem', color: T.pencil, marginTop: 4 }}>{note}</div>}
            {results.length > 0 && (
                <div style={{ maxHeight: 160, overflowY: 'auto', border: `1px solid ${T.ruled}`, borderRadius: 6, marginTop: 8 }}>
                    {results.map((r, i) => (
                        <button key={i} type="button" onClick={() => prefill(r)} style={{ display: 'block', width: '100%', textAlign: 'left', background: '#fffdf6', border: 'none', borderBottom: `1px solid ${T.ruled}`, padding: '8px 10px', cursor: 'pointer', fontFamily: FONT, color: T.inkSoft, fontSize: '0.9rem' }}>
                            <span style={{ fontWeight: 700, color: T.ink }}>{r.name}</span>{' '}
                            <span style={{ color: T.pencil }}>· {r.calories} kcal · P{r.protein}/C{r.carbs}/F{r.fat}</span>
                        </button>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {COMMON_FOODS.map((f, i) => (
                    <button key={i} type="button" onClick={() => prefill(f)} title={`${f.name} \u2014 ${f.calories} kcal`} style={{ fontFamily: FONT, fontSize: '0.78rem', background: '#fffdf6', border: `1px solid ${T.ruled}`, borderRadius: 50, padding: '4px 11px', cursor: 'pointer', color: T.inkSoft, whiteSpace: 'nowrap' }}>
                        {f.name}
                    </button>
                ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addFood({ name: form.name, serving: form.serving, calories: Number(form.calories) || 0, protein: Number(form.protein) || 0, carbs: Number(form.carbs) || 0, fat: Number(form.fat) || 0 }); }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr)) auto', gap: 8, alignItems: 'flex-end', marginTop: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}><div style={lbl}>Name</div><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Food" style={inp} /></div>
                <div><div style={lbl}>Kcal</div><input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} placeholder="0" style={inp} /></div>
                <div><div style={lbl}>Prot</div><input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} placeholder="0" style={inp} /></div>
                <div><div style={lbl}>Carbs</div><input type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} placeholder="0" style={inp} /></div>
                <div><div style={lbl}>Fat</div><input type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} placeholder="0" style={inp} /></div>
                <button type="submit" disabled={busy || !form.name} style={{ fontFamily: MARKER, fontSize: '0.8rem', background: T.sticky, border: `1px solid ${T.ruled}`, borderRadius: 6, padding: '9px 14px', cursor: 'pointer', color: T.ink, whiteSpace: 'nowrap' }}>{busy ? '…' : '+ add'}</button>
            </form>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {foods.length === 0 ? (
                    <div style={{ fontFamily: FONT, color: T.pencil, fontSize: '0.9rem' }}>no food logged yet &mdash; search, tap a common food, or type it in.</div>
                ) : foods.map((f) => (
                    <div key={f.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: FONT, color: T.inkSoft, fontSize: '0.95rem', padding: '4px 0', borderBottom: `1px dashed ${T.ruled}` }}>
                        <span style={{ flex: 1 }}>{f.name}{f.serving ? ` (${f.serving})` : ''} &mdash; {Math.round(f.calories)} kcal · P{round10(f.protein)}/C{round10(f.carbs)}/F{round10(f.fat)}</span>
                        <button type="button" onClick={() => deleteFood(f.id)} style={{ fontFamily: FONT, fontSize: '0.9rem', background: 'none', border: 'none', color: T.margin, cursor: 'pointer', padding: 2, flexShrink: 0 }}>&#10005;</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function RecordsSection({ unit }) {
    const [prs, setPrs] = useState([]);
    useEffect(() => {
        (async () => {
            try {
                const r = await axiosInstance.get(`${API_URL}/api/fitness/prs`);
                setPrs(r.data.prs || []);
            } catch (e) { console.error(e); }
        })();
    }, []);
    if (!prs.length) return null;
    const u = unit === 'metric' ? 'kg' : 'lb';
    return (
        <Paper style={{ padding: '22px 26px', marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
                <MarkerTitle style={{ fontSize: '1.2rem' }}><Highlight color={T.highYellow} style={{ padding: '0 6px' }}>&#9733; Personal Records</Highlight></MarkerTitle>
                <span style={{ fontFamily: FONT, fontSize: '0.72rem', color: T.pencil }}>estimated 1-rep max (Epley)</span>
            </div>
            <div style={{ marginTop: 4 }}>
                {prs.slice(0, 8).map((p) => {
                    const recent = (Date.now() - new Date(p.date + 'T00:00:00').getTime()) < 7 * 86400000;
                    return (
                        <div key={p.exercise} style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', padding: '8px 0', borderBottom: `1px dashed ${T.ruled}`, fontFamily: FONT, fontSize: '0.95rem' }}>
                            <span style={{ flex: 1, fontWeight: 700, color: T.ink }}>{p.exercise}</span>
                            <span style={{ color: T.inkSoft }}>{p.load} {u} &times; {p.reps}</span>
                            <span style={{ color: T.calorie, fontWeight: 700 }}>&rarr; est. {Math.round(p.e1rm)} {u} 1RM</span>
                            <span style={{ color: T.pencil, fontSize: '0.8rem', minWidth: 44, textAlign: 'right' }}>{new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            {recent && <span style={{ fontFamily: MARKER, fontSize: '0.7rem', color: '#7a1f1f', background: T.highPink, borderRadius: 4, padding: '1px 6px' }}>NEW</span>}
                        </div>
                    );
                })}
            </div>
        </Paper>
    );
}

function Dashboard() {
    const { user, logout } = useAuth();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [selectedDate, setSelectedDate] = useState(todayStr());
    const [days, setDays] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ water: 0, sleep: '', notes: '' });
    const [editingId, setEditingId] = useState(null);
    const [workoutVersion, setWorkoutVersion] = useState(0);
    const [streak, setStreak] = useState({ current: 0, best: 0 });

    const daysMap = useMemo(() => {
        const m = {};
        days.forEach(d => { m[d.date] = d; });
        return m;
    }, [days]);

    const loadCalendar = useCallback(async (y, mo) => {
        try {
            const r = await axiosInstance.get(`${API_URL}/api/fitness/calendar`, { params: { year: y, month: mo } });
            setDays(r.data.days);
            setError('');
        } catch (e) {
            console.error(e);
            setError('Could not load your journal.');
        }
    }, []);

    const loadStreak = useCallback(async () => {
        try {
            const r = await axiosInstance.get(`${API_URL}/api/fitness/streak`);
            setStreak({ current: r.data.current || 0, best: r.data.best || 0 });
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const r = await axiosInstance.get(`${API_URL}/api/fitness/overview`);
                setProfile(r.data.profile);
            } catch (e) { console.error(e); }
            await loadCalendar(year, month);
            await loadStreak();
            setLoading(false);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { loadCalendar(year, month); }, [year, month, loadCalendar]);

    useEffect(() => {
        const d = daysMap[selectedDate];
        if (d) {
            setForm({
                water: d.waterGlasses || 0,
                sleep: d.sleepHours ? String(d.sleepHours) : '',
                notes: d.notes || '',
            });
        }
    }, [selectedDate, daysMap]);

    const changeMonth = (delta) => {
        let m = month + delta, y = year;
        if (m < 1) { m = 12; y -= 1; }
        if (m > 12) { m = 1; y += 1; }
        setMonth(m); setYear(y);
    };

    const goToday = () => {
        const t = new Date();
        setYear(t.getFullYear()); setMonth(t.getMonth() + 1); setSelectedDate(todayStr());
    };

    const selectDay = (date) => { if (date) setSelectedDate(date); };
    const refresh = async () => { await loadCalendar(year, month); await loadStreak(); };

    const logWorkout = async (w) => {
        setBusy(true);
        try { await axiosInstance.post(`${API_URL}/api/fitness/workouts`, { ...w, date: selectedDate }); await refresh(); setWorkoutVersion(v => v + 1); }
        catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    const updateWorkout = async (w) => {
        setBusy(true);
        try {
            const { id, ...body } = w;
            await axiosInstance.put(`${API_URL}/api/fitness/workouts/${id}`, body);
            setEditingId(null);
            await refresh();
            setWorkoutVersion(v => v + 1);
        } catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    const deleteWorkout = async (id) => {
        if (!window.confirm('Tear this workout out of the journal?')) return;
        setBusy(true);
        try { await axiosInstance.delete(`${API_URL}/api/fitness/workouts/${id}`); await refresh(); setWorkoutVersion(v => v + 1); }
        catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    const saveDay = async () => {
        setBusy(true);
        try {
            await axiosInstance.put(`${API_URL}/api/fitness/log`, {
                date: selectedDate,
                waterGlasses: form.water,
                sleepHours: form.sleep ? Number(form.sleep) : 0,
                notes: form.notes,
            });
            await refresh();
        } catch (e) { console.error(e); }
        finally { setBusy(false); }
    };

    const setFormField = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const sel = daysMap[selectedDate] || {};
    const grid = useMemo(() => buildGrid(year, month), [year, month]);
    const selLabel = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const eaten = sel.caloriesConsumed || 0;
    const burned = (sel.workouts || []).reduce((s, w) => s + (Number(w.caloriesBurned) || 0), 0);
    const allowance = profile?.calorieTarget;
    const remaining = allowance != null ? allowance - eaten + burned : null;
    const goalLabel = { lose: 'lose fat', build: 'build muscle', maintain: 'maintain', endurance: 'endurance' }[profile?.goalType] || '';

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#28221b', color: '#efe6d2', fontFamily: FONT, fontSize: '1.2rem' }}>
                Opening your journal&hellip;
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: 'radial-gradient(1200px 700px at 50% -10%, #332a20, #211b15)', color: T.ink, fontFamily: FONT, padding: '24px 16px 60px', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: 1080, margin: '0 auto' }}>

                {/* HEADER */}
                <Paper lined={false} style={{ padding: '20px 26px', marginBottom: 18 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                        <div>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <MarkerTitle style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)' }}>My Lift Journal</MarkerTitle>
                                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 12, background: T.highYellow, opacity: 0.75, zIndex: -1 }} />
                            </div>
                            <div style={{ color: T.pencil, fontSize: '0.95rem', marginTop: 8 }}>
                                {user?.first_name ? `Hey ${user.first_name} — ` : ''}
                                {profile?.goalType ? `goal: ${profile.goalType} · keep showing up.` : 'log it, own it, rack it up.'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                                <span style={{ fontFamily: MARKER, fontSize: '0.85rem', background: T.highYellow, padding: '3px 10px', borderRadius: 4, color: T.ink }}>
                                    {streak.current > 0 ? `\u2605 ${streak.current}-day streak` : '\u2605 start your streak'}
                                </span>
                                {streak.best > 0 && <span style={{ fontFamily: FONT, fontSize: '0.75rem', color: T.pencil }}>best: {streak.best} days</span>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {['\u25C0', '\u25B6'].map((a, i) => (
                                <button key={a} onClick={() => changeMonth(i === 0 ? -1 : 1)}
                                    style={{ width: 38, height: 38, borderRadius: '50%', border: `2px solid ${T.ruled}`, background: '#fffdf6', cursor: 'pointer', fontSize: '0.9rem', color: T.ink }}>{a}</button>
                            ))}
                            <button onClick={goToday} style={{ fontFamily: FONT, background: 'none', border: 'none', borderBottom: '2px dashed #d9544a', cursor: 'pointer', color: '#d9544a', fontSize: '0.95rem', padding: '4px 6px' }}>today</button>
                            <button onClick={logout} style={{ fontFamily: FONT, background: 'none', border: 'none', color: T.pencil, cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline', padding: '4px 6px' }}>sign out</button>
                        </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <Tape rotate={-2}>{monthLabel(year, month)}</Tape>
                    </div>
                </Paper>

                {error && <div style={{ fontFamily: FONT, color: '#d9544a', margin: '0 0 14px' }}>{error}</div>}

                {/* CALENDAR */}
                <Paper lined={false} style={{ padding: '18px 16px', marginBottom: 22 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                        {DOW.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: MARKER, fontSize: '0.72rem', color: T.pencil }}>{d}</div>)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                        {grid.map((date, idx) => {
                            if (!date) return <div key={`b${idx}`} style={{ minHeight: 74 }} />;
                            const d = daysMap[date];
                            const isToday = date === todayStr();
                            const isSel = date === selectedDate;
                            return (
                                <button key={date} onClick={() => selectDay(date)}
                                    style={{
                                        minHeight: 74, borderRadius: 6, padding: 6, cursor: 'pointer', textAlign: 'center',
                                        background: isSel ? T.highPink : (isToday ? T.highYellow : '#fffdf8'),
                                        border: isSel ? `2px solid ${T.margin}` : `1px solid ${T.ruled}`,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    }}>
                                    <span style={{ fontFamily: FONT, fontSize: '1.15rem', fontWeight: 700, color: T.ink }}>{Number(date.slice(8, 10))}</span>
                                    <span style={{ display: 'flex', gap: 3, marginTop: 5, height: 8 }}>
                                        {d?.workoutCount > 0 && <i style={dmark('#d9544a')} />}
                                        {d?.waterGlasses > 0 && <i style={dmark(T.blue)} />}
                                        {d?.sleepHours > 0 && <i style={dmark(T.sleep)} />}
                                        {d?.caloriesConsumed > 0 && <i style={dmark(T.calorie)} />}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 12, fontSize: '0.78rem', color: T.pencil, flexWrap: 'wrap' }}>
                        <span><i style={dmark('#d9544a')} /> workout</span>
                        <span><i style={dmark(T.blue)} /> h2o</span>
                        <span><i style={dmark(T.sleep)} /> sleep</span>
                        <span><i style={dmark(T.calorie)} /> food</span>
                    </div>
                </Paper>

                <Paper margin style={{ padding: '26px 28px 28px 58px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <Tape rotate={2}>{selLabel.toUpperCase()}</Tape>
                    </div>

                    {/* ENERGY BALANCE */}
                    <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.35)', border: `1px dashed ${T.ruled}`, borderRadius: 8 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start', fontFamily: FONT }}>
                            <div>
                                <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: T.pencil, fontWeight: 700 }}>EATEN</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: T.calorie }}>{eaten.toLocaleString()}<span style={{ fontSize: '0.8rem', color: T.pencil, fontWeight: 400 }}> kcal</span></div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: T.pencil, fontWeight: 700 }}>BURNED</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2f9e44' }}>&minus;{burned.toLocaleString()}<span style={{ fontSize: '0.8rem', color: T.pencil, fontWeight: 400 }}> kcal</span></div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: T.pencil, fontWeight: 700 }}>ALLOWANCE</div>
                                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: T.ink }}>{allowance != null ? allowance.toLocaleString() : '\u2014'}<span style={{ fontSize: '0.8rem', color: T.pencil, fontWeight: 400 }}> kcal</span></div>
                            </div>
                        </div>
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1.05rem' }}>
                            {allowance == null ? (
                                <span style={{ color: T.inkSoft }}>set your goal to see your daily allowance. <Link to="/fit/setup-profile" style={{ color: T.blue }}>set it &rarr;</Link></span>
                            ) : remaining >= 0 ? (
                                <span style={{ color: T.inkSoft }}>net <strong style={{ color: '#15803d' }}>{remaining.toLocaleString()} kcal remaining</strong> &mdash; {goalLabel ? `on track to ${goalLabel}` : 'on track'}</span>
                            ) : (
                                <span style={{ color: T.inkSoft }}>net <strong style={{ color: T.margin }}>{(-remaining).toLocaleString()} kcal over</strong> allowance &mdash; {goalLabel ? `slowing ${goalLabel}` : 'over target'}</span>
                            )}
                        </div>
                    </div>

                    {/* WORKOUT */}
                    <div style={{ marginTop: 10 }}>
                        <MarkerTitle style={{ fontSize: '1.2rem' }}>Workout</MarkerTitle>
                        <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                            {sel.workouts?.length ? sel.workouts.map((w) => (
                                <li key={w.id} style={{ padding: '6px 0', borderBottom: `1px dashed ${T.ruled}` }}>
                                    {editingId === w.id ? (
                                        <WorkoutForm onSave={updateWorkout} initial={w} onCancel={() => setEditingId(null)} busy={busy} weight={profile?.currentWeight} unit={profile?.unit} />
                                    ) : (
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: FONT, fontSize: '1.05rem', color: T.inkSoft }}>
                                            <span style={{ color: colorFor(w.type), fontWeight: 700, flexShrink: 0 }}>&bull;</span>
                                            <span style={{ flex: 1 }}>{w.type} &mdash; {w.sets ? `${w.sets}\u00D7${w.reps}${w.load ? ` @ ${Math.round(w.load)} ${profile?.unit === 'metric' ? 'kg' : 'lb'}` : ''}` : `${w.durationMinutes} min`} &mdash; {w.caloriesBurned} kcal</span>
                                            <button type="button" onClick={() => setEditingId(w.id)} style={{ fontFamily: FONT, fontSize: '0.8rem', background: 'none', border: 'none', color: T.blue, cursor: 'pointer', textDecoration: 'underline', padding: 2, flexShrink: 0 }}>edit</button>
                                            <button type="button" onClick={() => deleteWorkout(w.id)} style={{ fontFamily: FONT, fontSize: '0.9rem', background: 'none', border: 'none', color: T.margin, cursor: 'pointer', padding: 2, flexShrink: 0 }}>&#10005;</button>
                                        </div>
                                    )}
                                </li>
                            )) : (
                                <li style={{ fontFamily: FONT, color: T.pencil, fontSize: '0.95rem' }}>nothing logged &mdash; add a session below.</li>
                            )}
                        </ul>
                        <WorkoutForm onSave={logWorkout} busy={busy} weight={profile?.currentWeight} unit={profile?.unit} />
                    </div>

                    <div style={{ border: 'none', borderTop: `2px dashed ${T.ruled}`, margin: '18px 0' }} />

                    {/* FOOD */}
                    <MarkerTitle style={{ fontSize: '1.2rem' }}>Food</MarkerTitle>
                    <FoodSection date={selectedDate} onChanged={refresh} />

                    {/* SLEEP */}
                    <div style={{ marginTop: 20 }}>
                        <MarkerTitle style={{ fontSize: '1rem' }}>Sleep</MarkerTitle>
                        <input type="number" step="0.5" value={form.sleep} onChange={(e) => setFormField('sleep', e.target.value)} placeholder="0"
                            style={{ width: '100%', marginTop: 6, background: 'transparent', border: 'none', borderBottom: `2px solid ${T.ruled}`, fontFamily: FONT, fontSize: '1.15rem', color: T.ink, outline: 'none' }} />
                        <span style={{ fontFamily: FONT, fontSize: '0.8rem', color: T.pencil }}>hours</span>
                    </div>

                    {/* HYDRATION */}
                    <div style={{ marginTop: 20 }}>
                        <MarkerTitle style={{ fontSize: '1rem' }}>
                            Hydration <span style={{ fontFamily: FONT, fontSize: '0.85rem', color: T.pencil, fontWeight: 400 }}>({form.water}/8 glasses)</span>
                        </MarkerTitle>
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Cup key={i} filled={i < form.water} onClick={() => setFormField('water', form.water === i + 1 ? i : i + 1)} />
                            ))}
                        </div>
                    </div>

                    {/* NOTES */}
                    <div style={{ marginTop: 22 }}>
                        <MarkerTitle style={{ fontSize: '1rem' }}>Notes</MarkerTitle>
                        <textarea rows={4} value={form.notes} onChange={(e) => setFormField('notes', e.target.value)} placeholder="how'd the day go? soreness, energy, wins..."
                            style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,0.35)', border: `1px dashed ${T.ruled}`, borderRadius: 6, fontFamily: FONT, fontSize: '1.05rem', color: T.ink, resize: 'vertical', outline: 'none', padding: '10px', boxSizing: 'border-box', lineHeight: 1.5 }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 26 }}>
                        <button onClick={saveDay} disabled={busy}
                            style={{ fontFamily: MARKER, fontSize: '1rem', background: T.highGreen, border: '1px solid #9ccd7a', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', color: T.ink, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                            {busy ? 'saving\u2026' : '\u2713 save day'}
                        </button>
                    </div>
                </Paper>

                <RecordsSection unit={profile?.unit} key={workoutVersion} />
            </div>
        </div>
    );
}

export default Dashboard;