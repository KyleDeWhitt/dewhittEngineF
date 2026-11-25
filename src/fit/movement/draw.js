// Canvas drawing for form-check skeletons (no React, so components can share it).
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.
import { T, FONT } from '../theme';
import { BONES } from './analysis';

const LEFT = new Set([11, 13, 15, 23, 25, 27, 29, 31]);
export const JOINT_COLOR = { knee: '#d9544a', hip: '#3f6fb5', elbow: '#d9773f', shoulder: '#5f8f52', trunk: '#6a5acd' };
const JOINT_POINT = { knee: [25, 26], hip: [23, 24], elbow: [13, 14], shoulder: [11, 12] };

/** Draw one encoded pose row onto a canvas region. */
export function drawSkeleton(ctx, row, box, { side = null, highlight = null, angle = null, dim = false } = {}) {
    if (!row || row.length < 2) return;
    const P = (i) => ({ x: box.x + row[1 + i * 3] / 1000 * box.w, y: box.y + row[2 + i * 3] / 1000 * box.h, v: row[3 + i * 3] / 100 });
    const near = (i) => !side || (side === 'L' ? LEFT.has(i) : !LEFT.has(i));
    ctx.lineCap = 'round';
    for (const [a, b] of BONES) {
        const pa = P(a), pb = P(b);
        if (pa.v < 0.4 || pb.v < 0.4) continue;
        const isNear = near(a) && near(b);
        ctx.strokeStyle = dim ? 'rgba(255,255,255,0.9)' : (isNear ? T.ink : 'rgba(44,39,34,0.35)');
        ctx.lineWidth = isNear ? 4 : 2.5;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }
    for (let i = 11; i <= 32; i++) {
        if (i >= 17 && i <= 22) continue; // fingers
        const p = P(i);
        if (p.v < 0.4) continue;
        ctx.fillStyle = dim ? '#fff' : (LEFT.has(i) ? T.blue : T.margin);
        ctx.beginPath(); ctx.arc(p.x, p.y, near(i) ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();
    }
    const nose = P(0);
    if (nose.v >= 0.4) { ctx.strokeStyle = dim ? '#fff' : T.inkSoft; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(nose.x, nose.y, box.w * 0.035, 0, Math.PI * 2); ctx.stroke(); }

    if (highlight && JOINT_POINT[highlight] && angle != null) {
        const idx = side === 'R' ? JOINT_POINT[highlight][1] : JOINT_POINT[highlight][0];
        const p = P(idx);
        if (p.v >= 0.4) {
            ctx.fillStyle = JOINT_COLOR[highlight];
            ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
            const label = `${Math.round(angle)}°`;
            ctx.font = `bold 16px ${FONT}`;
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(255,253,246,0.92)';
            ctx.fillRect(p.x + 12, p.y - 12, tw + 10, 22);
            ctx.fillStyle = JOINT_COLOR[highlight];
            ctx.fillText(label, p.x + 17, p.y + 5);
        }
    }
}
