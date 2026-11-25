// Turns pose landmarks from a form-check clip into joint angles, reps and observations.
// Pure functions, no DOM: used when the client sends a clip and when the coach reviews it.
//
// Single-camera angles are estimates (typically 5-10 degrees off; worst for rotation and
// ankles). Observations describe what was measured; they are not a diagnosis.
//
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.

// MediaPipe Pose landmark indices
export const LM = {
    nose: 0, lShoulder: 11, rShoulder: 12, lElbow: 13, rElbow: 14, lWrist: 15, rWrist: 16,
    lHip: 23, rHip: 24, lKnee: 25, rKnee: 26, lAnkle: 27, rAnkle: 28, lHeel: 29, rHeel: 30, lFoot: 31, rFoot: 32,
};

export const BONES = [
    [11, 12], [11, 23], [12, 24], [23, 24],
    [11, 13], [13, 15], [12, 14], [14, 16],
    [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
    [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
];

// Joint angle = angle at the middle landmark
const JOINT_DEFS = {
    knee: { L: [23, 25, 27], R: [24, 26, 28], label: 'Knee' },
    hip: { L: [11, 23, 25], R: [12, 24, 26], label: 'Hip' },
    elbow: { L: [11, 13, 15], R: [12, 14, 16], label: 'Elbow' },
    shoulder: { L: [23, 11, 13], R: [24, 12, 14], label: 'Shoulder' },
};
export const JOINTS = Object.keys(JOINT_DEFS);
export const JOINT_LABEL = { ...Object.fromEntries(JOINTS.map(j => [j, JOINT_DEFS[j].label])), trunk: 'Torso lean' };

// Which joint drives the rep, by exercise name. Order matters (leg curl before curl).
const PRIMARY_RULES = [
    [/leg (curl|extension)|nordic|sissy|squat|lunge|leg press|step-up|pistol|thruster|box jump/i, 'knee'],
    [/deadlift|rack pull|romanian|good morning|hip thrust|glute bridge|kettlebell swing|back extension|clean|snatch|sit-up|crunch|leg raise|cable kickback|hip ab|hip ad/i, 'hip'],
    [/lateral raise|front raise|rear delt|fly|crossover|pec deck|face pull|straight-arm/i, 'shoulder'],
    [/bench|press|push-up|dip|curl|row|pull-up|chin-up|pulldown|pushdown|tricep|skull|kickback|arnold/i, 'elbow'],
];

export function primaryJointFor(exercise) {
    for (const [re, joint] of PRIMARY_RULES) if (re.test(exercise || '')) return joint;
    return null; // fall back to the joint that moved the most
}

const MIN_VIS = 0.5;

/** Landmark i of an encoded frame row, in pixel-proportional units. */
function point(row, i, w, h) {
    if (!row || row.length < 2) return null;
    const v = row[3 + i * 3] / 100;
    if (v < MIN_VIS) return null;
    return { x: row[1 + i * 3] / 1000 * w, y: row[2 + i * 3] / 1000 * h, v };
}

function angleAt(a, b, c) {
    if (!a || !b || !c) return null;
    const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y;
    const d = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
    if (!d) return null;
    const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / d));
    return Math.acos(cos) * 180 / Math.PI;
}

function mid(a, b) { return a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : (a || b); }

/** Torso angle from vertical (0 = upright), hip midpoint to shoulder midpoint. */
function trunkLean(row, w, h) {
    const s = mid(point(row, 11, w, h), point(row, 12, w, h));
    const hp = mid(point(row, 23, w, h), point(row, 24, w, h));
    if (!s || !hp) return null;
    const dx = s.x - hp.x, dy = hp.y - s.y; // y grows downward
    return Math.abs(Math.atan2(dx, dy) * 180 / Math.PI);
}

function meanVis(rows, idxs) {
    let sum = 0, n = 0;
    for (const r of rows) {
        if (r.length < 2) continue;
        for (const i of idxs) { sum += r[3 + i * 3] / 100; n++; }
    }
    return n ? sum / n : 0;
}

/** Fill gaps of up to maxGap frames by linear interpolation, then centered moving average. */
function clean(series, maxGap = 6, win = 5) {
    const s = series.slice();
    let i = 0;
    while (i < s.length) {
        if (s[i] != null) { i++; continue; }
        let j = i;
        while (j < s.length && s[j] == null) j++;
        const gap = j - i;
        if (i > 0 && j < s.length && gap <= maxGap) {
            const a = s[i - 1], b = s[j];
            for (let k = i; k < j; k++) s[k] = a + (b - a) * ((k - i + 1) / (gap + 1));
        }
        i = j;
    }
    const half = Math.floor(win / 2);
    return s.map((v, k) => {
        if (v == null) return null;
        let sum = 0, n = 0;
        for (let m = k - half; m <= k + half; m++) if (s[m] != null) { sum += s[m]; n++; }
        return sum / n;
    });
}

function pct(values, p) {
    const v = values.filter(x => x != null).sort((a, b) => a - b);
    if (!v.length) return null;
    return v[Math.min(v.length - 1, Math.max(0, Math.round((v.length - 1) * p)))];
}

const r1 = (n) => (n == null ? null : Math.round(n * 10) / 10);
const r0 = (n) => (n == null ? null : Math.round(n));
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);

/**
 * Per-frame angle series for a clip.
 * Returns { t: [sec], joints: { knee: {L,R,main}, ... }, trunk, side }
 * `main` is the near side for side-view clips and the L/R average for front-view clips.
 */
export function computeSeries(poseData, view = 'side') {
    const { frames = [], width = 1000, height = 1000 } = poseData || {};
    const t = frames.map(r => r[0] / 1000);
    const out = { t, joints: {}, trunk: null, side: null };

    // Near side for side view = the side whose landmarks the model is more confident about
    const leftIdx = [11, 13, 15, 23, 25, 27], rightIdx = [12, 14, 16, 24, 26, 28];
    const side = meanVis(frames, leftIdx) >= meanVis(frames, rightIdx) ? 'L' : 'R';
    out.side = side;

    for (const j of JOINTS) {
        const def = JOINT_DEFS[j];
        const L = clean(frames.map(r => angleAt(point(r, def.L[0], width, height), point(r, def.L[1], width, height), point(r, def.L[2], width, height))));
        const R = clean(frames.map(r => angleAt(point(r, def.R[0], width, height), point(r, def.R[1], width, height), point(r, def.R[2], width, height))));
        const main = view === 'front'
            ? L.map((v, k) => (v != null && R[k] != null ? (v + R[k]) / 2 : (v ?? R[k])))
            : (side === 'L' ? L.map((v, k) => v ?? R[k]) : R.map((v, k) => v ?? L[k]));
        out.joints[j] = { L, R, main };
    }
    out.trunk = clean(frames.map(r => trunkLean(r, width, height)));
    return out;
}

/** Find reps in an angle series using hysteresis. Works for joints that bend (dip) or raise (peak). */
export function findReps(t, series) {
    const valid = series.filter(v => v != null);
    if (valid.length < 10) return { reps: [], direction: null, range: 0 };
    const lo = pct(series, 0.05), hi = pct(series, 0.95);
    const range = hi - lo;
    if (range < 20) return { reps: [], direction: null, range };

    // Resting position = how the clip starts. Reps move away from it and back.
    const first = avg(valid.slice(0, Math.min(10, valid.length)));
    const direction = Math.abs(first - hi) <= Math.abs(first - lo) ? 'down' : 'up';
    const s = series.map(v => (v == null ? null : (direction === 'down' ? v : -v)));
    const sLo = direction === 'down' ? lo : -hi;
    const upper = sLo + 0.65 * range, lower = sLo + 0.35 * range;

    const reps = [];
    let state = 'unknown', topIdx = null, extIdx = null;
    for (let k = 0; k < s.length; k++) {
        const v = s[k];
        if (v == null) continue;
        if (v >= upper) {
            if (state === 'bottom' && topIdx != null && extIdx != null) {
                // Time the rep from when movement actually starts/stops, not the threshold crossing
                let st = topIdx, en = k;
                const floor = reps.length ? reps[reps.length - 1].end : 0;
                while (st - 1 > floor && s[st - 1] != null && s[st - 1] > s[st] + 0.2) st--;
                while (en + 1 < s.length && s[en + 1] != null && s[en + 1] > s[en] + 0.2) en++;
                reps.push({ start: st, bottom: extIdx, end: en });
            }
            state = 'top'; topIdx = k; extIdx = null;
        } else if (v <= lower && (state === 'top' || state === 'bottom')) {
            state = 'bottom';
            if (extIdx == null || v < s[extIdx]) extIdx = k;
        } else if (state === 'bottom' && (extIdx == null || v < s[extIdx])) {
            extIdx = k;
        }
    }
    return {
        direction,
        range,
        reps: reps.map(({ start, bottom, end }) => ({
            start: t[start], bottom: t[bottom], end: t[end], startIdx: start, bottomIdx: bottom, endIdx: end,
            value: series[bottom],
        })),
    };
}

/**
 * Full analysis of a clip. The result is what gets stored as `metrics` and shown to the coach.
 */
export function analyzeClip(poseData, exercise, view = 'side') {
    const frames = poseData?.frames || [];
    const series = computeSeries(poseData, view);
    const tracked = frames.filter(r => r.length > 1).length;
    const trackedPct = frames.length ? tracked / frames.length : 0;

    // ROM per joint (5th-95th percentile so single glitches don't count)
    const rom = {};
    for (const j of JOINTS) {
        const m = series.joints[j].main;
        const a = pct(m, 0.05), b = pct(m, 0.95);
        rom[j] = a == null ? null : { min: r0(a), max: r0(b), range: r0(b - a) };
    }

    let primary = primaryJointFor(exercise);
    if (!primary || !rom[primary]) {
        primary = JOINTS.filter(j => rom[j]).sort((a, b) => rom[b].range - rom[a].range)[0] || 'knee';
    }

    const { reps: rawReps, direction } = findReps(series.t, series.joints[primary].main);
    const reps = rawReps.map((rp, n) => {
        const k = rp.bottomIdx;
        const L = series.joints[primary].L[k], R = series.joints[primary].R[k];
        return {
            n: n + 1,
            start: r1(rp.start), bottom: r1(rp.bottom), end: r1(rp.end),
            value: r0(rp.value),
            down: r1(rp.bottom - rp.start),
            up: r1(rp.end - rp.bottom),
            trunk: r0(series.trunk[k]),
            left: r0(L), right: r0(R),
            hip: primary !== 'hip' ? r0(series.joints.hip.main[k]) : null,
            knee: primary !== 'knee' ? r0(series.joints.knee.main[k]) : null,
        };
    });

    const trunkMax = r0(pct(series.trunk, 0.95));
    const observations = buildObservations({ reps, primary, direction, view, trackedPct, trunkMax, rom, poseData, exercise });

    return {
        version: 1,
        exercise,
        view,
        primary,
        direction,
        repCount: reps.length,
        reps,
        rom,
        trunkMax,
        trackedPct: r0(trackedPct * 100),
        side: view === 'side' ? series.side : null,
        observations,
    };
}

function buildObservations({ reps, primary, direction, view, trackedPct, trunkMax, rom, poseData }) {
    const obs = [];
    const J = JOINT_LABEL[primary].toLowerCase();
    const word = direction === 'up' ? 'top' : 'bottom';

    if (trackedPct < 0.8) {
        obs.push({ level: 'warn', text: `Body was only tracked in ${Math.round(trackedPct * 100)}% of the clip, so these numbers are less reliable. Film with the whole body in frame.` });
    }
    if (poseData?.truncated) obs.push({ level: 'info', text: 'Only the first 60 seconds were analyzed.' });
    if (view === 'front' && (primary === 'knee' || primary === 'hip')) {
        obs.push({ level: 'info', text: 'Filmed from the front: depth angles are approximate. A side view gives better depth numbers; the front view is better for left/right comparison.' });
    }

    if (!reps.length) {
        obs.push({ level: 'warn', text: `No clear reps found from ${J} movement${rom[primary] ? ` (it moved through about ${rom[primary].range}°)` : ''}.` });
        return obs;
    }

    obs.push({ level: 'info', text: `${reps.length} rep${reps.length === 1 ? '' : 's'} found from ${J} movement.` });

    const vals = reps.map(r => r.value).filter(v => v != null);
    if (vals.length >= 2) {
        const lo = Math.min(...vals), hi = Math.max(...vals);
        obs.push({
            level: hi - lo > 15 ? 'flag' : 'info',
            text: `${JOINT_LABEL[primary]} angle at the ${word} of each rep ranged ${lo}°–${hi}° (a ${hi - lo}° spread).`,
        });
        const firstV = vals[0], lastV = vals[vals.length - 1];
        const lost = direction === 'up' ? firstV - lastV : lastV - firstV; // positive = less range by the end
        if (vals.length >= 3 && lost > 10) {
            obs.push({ level: 'flag', text: `Range shrank by about ${lost}° from the first rep to the last.` });
        }
    }

    const ups = reps.map(r => r.up).filter(v => v != null && v > 0);
    if (ups.length >= 3 && ups[ups.length - 1] > ups[0] * 1.4) {
        obs.push({ level: 'flag', text: `The lifting phase slowed from ${ups[0]}s on rep 1 to ${ups[ups.length - 1]}s on the last rep.` });
    }
    const downs = reps.map(r => r.down).filter(v => v != null);
    if (downs.length && ups.length) {
        obs.push({ level: 'info', text: `Average tempo: ${r1(avg(downs))}s lowering, ${r1(avg(ups))}s lifting.` });
    }

    if (view === 'front') {
        const diffs = reps.filter(r => r.left != null && r.right != null).map(r => Math.abs(r.left - r.right));
        if (diffs.length) {
            const d = r0(avg(diffs));
            obs.push({ level: d > 10 ? 'flag' : 'info', text: `Left and right ${J} differed by about ${d}° at the ${word} of the reps.` });
        }
    }

    if ((primary === 'knee' || primary === 'hip') && trunkMax != null) {
        obs.push({ level: 'info', text: `Torso leaned up to about ${trunkMax}° from vertical.` });
    }
    return obs;
}

/** Nearest encoded frame row to time t (seconds). */
export function frameAt(poseData, t) {
    const frames = poseData?.frames || [];
    if (!frames.length) return null;
    const fps = poseData.fps || 15;
    const k = Math.max(0, Math.min(frames.length - 1, Math.round(t * fps)));
    return frames[k];
}
