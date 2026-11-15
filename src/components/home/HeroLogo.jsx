import React, { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Model } from '../Logo';

// Approximate size of the logo in 3D units, with a little breathing room.
// Used to place the camera so the whole logo always fits the canvas.
const LOGO_WIDTH = 11.5;
const LOGO_HEIGHT = 4.4;
const MAX_STEP = 1 / 30;

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Keeps the logo fully in frame at any canvas shape (wide desktop, tall phone).
function FitCamera() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    const aspect = size.width / size.height;
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const fitHeight = LOGO_HEIGHT / 2 / halfFov;
    const fitWidth = LOGO_WIDTH / 2 / (halfFov * aspect);
    camera.position.set(0, 0, Math.max(fitHeight, fitWidth));
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

// Gentle idle float plus a slight tilt toward the mouse.
function LogoRig({ children }) {
  const group = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const still = useRef(reducedMotion());

  useEffect(() => {
    if (still.current) return undefined;
    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || still.current) return;
    const step = Math.min(delta, MAX_STEP);
    const t = state.clock.elapsedTime;

    const targetY = pointer.current.x * 0.3 + Math.sin(t * 0.6) * 0.07;
    const targetX = pointer.current.y * 0.12 + Math.sin(t * 0.45) * 0.03;

    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4, step);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 4, step);
    g.position.y = Math.sin(t * 0.8) * 0.06;
  });

  return <group ref={group}>{children}</group>;
}

const HeroLogo = () => {
  const wrap = useRef(null);
  const [inView, setInView] = useState(true);

  // Stop drawing the 3D scene when the hero is scrolled off screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrap} className="hero-logo" role="img" aria-label="DeWhitt Designs logo in gold and silver 3D lettering">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 0, 8], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
      >
        <FitCamera />

        <Environment files="/hdri/city.hdr" />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={2} angle={0.3} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#444" />
        <spotLight position={[0, 2, 10]} intensity={4} angle={0.6} distance={30} />

        <Suspense fallback={null}>
          <LogoRig>
            {/* Nudged up so the two words sit centered in the canvas */}
            <Model position={[0, 0.55, 0]} />
          </LogoRig>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroLogo;
