// A generated (not recorded) side-view squat set, used as the example on the landing page.
// Five reps that get a little shallower and slower, so the example observations have
// something to point out. Same data format as pose.js produces.
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.

const FPS = 15;
const W = 720, H = 1280;

// Landmark positions (0-1 of the frame) for a lifter facing left, d = squat depth 0..1
function pose(d) {
    const ankle = { x: 0.52, y: 0.86 };
    const knee = { x: 0.52 - 0.13 * d, y: 0.70 + 0.04 * d };
    const hip = { x: 0.52 + 0.10 * d, y: 0.53 + 0.20 * d };
    const lean = 0.17 * d; // torso tips forward as you sit down
    const shoulder = { x: hip.x - lean - 0.01, y: hip.y - 0.27 + 0.03 * d };
    const head = { x: shoulder.x - 0.03, y: shoulder.y - 0.09 };
    const elbow = { x: shoulder.x + 0.06, y: shoulder.y + 0.07 };
    const wrist = { x: shoulder.x - 0.02, y: shoulder.y + 0.01 };
    const heel = { x: ankle.x + 0.03, y: ankle.y + 0.02 };
    const toe = { x: ankle.x - 0.08, y: ankle.y + 0.025 };
    const far = (p, dx = 0.012, dy = -0.004) => ({ x: p.x + dx, y: p.y + dy });

    const lm = Array.from({ length: 33 }, () => ({ ...head, v: 0.2 }));
    const set = (i, p, v) => { lm[i] = { x: p.x, y: p.y, v }; };
    // face (0-10): nose and eyes/ears around the head point
    for (let i = 0; i <= 10; i++) set(i, { x: head.x - 0.01 + (i % 3) * 0.008, y: head.y + (i % 2) * 0.006 }, i === 0 ? 0.95 : 0.6);
    // left side faces the camera (near), right side is behind (far)
    set(11, shoulder, 0.97); set(12, far(shoulder), 0.6);
    set(13, elbow, 0.95); set(14, far(elbow), 0.55);
    set(15, wrist, 0.95); set(16, far(wrist), 0.55);
    set(23, hip, 0.97); set(24, far(hip), 0.6);
    set(25, knee, 0.97); set(26, far(knee), 0.6);
    set(27, ankle, 0.97); set(28, far(ankle), 0.6);
    set(29, heel, 0.9); set(30, far(heel), 0.5);
    set(31, toe, 0.9); set(32, far(toe), 0.5);
    return lm;
}

export function makeDemoPose() {
    const frames = [];
    let t = 0;
    const push = (d) => {
        const row = [Math.round(t * 1000)];
        for (const p of pose(d)) row.push(Math.round(p.x * 1000), Math.round(p.y * 1000), Math.round(p.v * 100));
        frames.push(row);
        t += 1 / FPS;
    };
    const hold = (n) => { for (let k = 0; k < n; k++) push(0); };
    hold(12);
    // [depth, seconds] per rep: later reps shallower and slower
    [[1, 2.2], [1, 2.2], [0.96, 2.4], [0.84, 2.8], [0.76, 3.3]].forEach(([depth, dur]) => {
        const n = Math.round(dur * FPS), down = Math.round(n * 0.45);
        for (let k = 0; k < n; k++) {
            const ph = k < down ? k / down : 1 - (k - down) / (n - down);
            push(depth * (0.5 - 0.5 * Math.cos(ph * Math.PI)));
        }
        hold(6);
    });
    hold(6);
    return { fps: FPS, width: W, height: H, model: 'example', truncated: false, frames };
}
