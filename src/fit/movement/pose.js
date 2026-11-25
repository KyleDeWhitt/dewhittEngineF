// On-device pose tracking for form-check clips (MediaPipe Pose Landmarker).
// The video is processed on the client's phone/computer; only landmark numbers
// and two small face-blurred stills are ever sent to the server.
//
// Shared by the web app (src/fit/) and the Android app (dewhittFitEngine/app/src/):
// keep both copies identical.

const MP_VERSION = '1.2.2'; // keep in sync with @mediapipe/tasks-vision in package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task';
export const MODEL_NAME = 'mediapipe-pose-full@' + MP_VERSION;

export const SAMPLE_FPS = 15;
export const MAX_SECONDS = 60;
const STILL_WIDTH = 360;

let landmarkerPromise = null;
let lastTimestamp = 0; // VIDEO mode needs strictly increasing timestamps across clips

function getLandmarker() {
    if (!landmarkerPromise) {
        landmarkerPromise = (async () => {
            const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
            const vision = await FilesetResolver.forVisionTasks(WASM_URL);
            // CPU on purpose: the GPU delegate has an open bug on recent Snapdragon phones,
            // and clips are processed after recording, so speed matters less than reliability.
            return PoseLandmarker.createFromOptions(vision, {
                baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
                runningMode: 'VIDEO',
                numPoses: 1,
                minPoseDetectionConfidence: 0.5,
                minPosePresenceConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
        })();
        landmarkerPromise.catch(() => { landmarkerPromise = null; });
    }
    return landmarkerPromise;
}

function once(el, event, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { cleanup(); reject(new Error(`Timed out waiting for video ${event}`)); }, timeoutMs);
        const onOk = () => { cleanup(); resolve(); };
        const onErr = () => { cleanup(); reject(new Error('This video could not be read. Try recording again (MP4 works best).')); };
        const cleanup = () => { clearTimeout(timer); el.removeEventListener(event, onOk); el.removeEventListener('error', onErr); };
        el.addEventListener(event, onOk);
        el.addEventListener('error', onErr);
    });
}

async function seek(video, t) {
    if (Math.abs(video.currentTime - t) < 0.001) return;
    const p = once(video, 'seeked');
    video.currentTime = t;
    await p;
}

/** Load a File into a hidden <video> element ready for frame-by-frame seeking. */
export async function openVideo(file) {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.src = URL.createObjectURL(file);
    await once(video, 'loadeddata', 20000);
    // Some recorders (WebM) report Infinity until the end has been seeked once.
    if (!Number.isFinite(video.duration)) {
        video.currentTime = 1e7;
        await once(video, 'seeked').catch(() => {});
        video.currentTime = 0;
        await once(video, 'seeked').catch(() => {});
    }
    return video;
}

export function closeVideo(video) {
    if (!video) return;
    URL.revokeObjectURL(video.src);
    video.removeAttribute('src');
    video.load();
}

const q = (n) => Math.max(-2000, Math.min(3000, Math.round(n * 1000)));

/**
 * Run pose tracking over the clip.
 * Returns poseData: { fps, width, height, model, truncated, frames: [[tMs, x0,y0,v0, ...] | [tMs]] }
 * with x/y as 0-1000 integers of the frame and v (visibility) as 0-100.
 */
export async function trackVideo(video, { onProgress, onStage, signal } = {}) {
    onStage && onStage('Loading the body-tracking model (first time takes a few seconds)…');
    const landmarker = await getLandmarker();
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (!duration) throw new Error('Could not read the video length.');
    const end = Math.min(duration, MAX_SECONDS);
    const step = 1 / SAMPLE_FPS;
    const frames = [];

    onStage && onStage('Tracking your movement…');
    for (let t = 0; t <= end; t += step) {
        if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
        await seek(video, Math.min(t, duration - 0.001));
        lastTimestamp = Math.max(lastTimestamp + 1, Math.round(performance.now()));
        const res = landmarker.detectForVideo(video, lastTimestamp);
        const lm = res?.landmarks?.[0];
        const tMs = Math.round(t * 1000);
        if (lm && lm.length === 33) {
            const row = [tMs];
            for (const p of lm) row.push(q(p.x), q(p.y), Math.round((p.visibility ?? 0) * 100));
            frames.push(row);
        } else {
            frames.push([tMs]);
        }
        onProgress && onProgress(Math.min(1, t / end));
    }
    return {
        fps: SAMPLE_FPS,
        width: video.videoWidth,
        height: video.videoHeight,
        model: MODEL_NAME,
        truncated: duration > MAX_SECONDS,
        frames,
    };
}

/**
 * Grab a small JPEG of the clip at time t with the face pixelated.
 * `frame` is the encoded pose row for (about) that time, used to find the face.
 */
export async function captureStill(video, t, frame) {
    await seek(video, Math.max(0, Math.min(t, video.duration - 0.001)));
    const w = STILL_WIDTH;
    const h = Math.round(video.videoHeight * (w / video.videoWidth));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    // Face = landmarks 0-10 (nose, eyes, ears, mouth). Pixelate a padded box around them.
    if (frame && frame.length > 1) {
        const xs = [], ys = [];
        for (let i = 0; i <= 10; i++) {
            const x = frame[1 + i * 3], y = frame[2 + i * 3], v = frame[3 + i * 3];
            if (v >= 20) { xs.push(x / 1000 * w); ys.push(y / 1000 * h); }
        }
        if (xs.length >= 2) {
            const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
            const size = Math.max(maxX - minX, maxY - minY, w * 0.08);
            const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
            const half = size * 1.1;
            const bx = Math.max(0, Math.floor(cx - half)), by = Math.max(0, Math.floor(cy - half * 1.2));
            const bw = Math.min(w - bx, Math.ceil(half * 2)), bh = Math.min(h - by, Math.ceil(half * 2.4));
            if (bw > 0 && bh > 0) {
                const tiny = document.createElement('canvas');
                tiny.width = Math.max(1, Math.round(bw / 14)); tiny.height = Math.max(1, Math.round(bh / 14));
                const tctx = tiny.getContext('2d');
                tctx.drawImage(canvas, bx, by, bw, bh, 0, 0, tiny.width, tiny.height);
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(tiny, 0, 0, tiny.width, tiny.height, bx, by, bw, bh);
                ctx.imageSmoothingEnabled = true;
            }
        }
    }
    return canvas.toDataURL('image/jpeg', 0.6);
}
