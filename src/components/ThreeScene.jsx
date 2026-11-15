import React, { Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Model } from './Logo';
import * as THREE from 'three';

const MAX_STEP = 1 / 30; // cap per-frame movement so a slow frame can't cause a jump

function CameraRig() {
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  // The canvas only draws when something changes, so ask for a frame on scroll.
  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [invalidate]);

  useFrame((state, delta) => {
    const scrollY = window.scrollY;
    const scrollMax = document.body.scrollHeight - window.innerHeight || 1;
    const scrollProgress = Math.min(scrollY / scrollMax, 1);

    // Responsive Logic
    // If width < 800px (mobile), pull back to z=22 so the logo fits
    const isMobile = size.width < 800;
    const startZ = isMobile ? 22 : 12;

    const targetZ = startZ + (scrollProgress * 15);

    // Smooth, frame-rate independent movement toward the target
    const camera = state.camera;
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      targetZ,
      2,
      Math.min(delta, MAX_STEP)
    );

    // Keep drawing until the camera has settled, then go idle.
    if (Math.abs(camera.position.z - targetZ) > 0.001) {
      invalidate();
    } else {
      camera.position.z = targetZ;
    }
  });
  return null;
}

const ThreeScene = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 800;

  return (
    <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        // Use the screen's own sharpness, capped at 1.5x. Forcing 2x made
        // ordinary laptops draw 2-4x more pixels than they can show smoothly.
        dpr={[1, 1.5]}
        // Only draw a frame when something moves (intro slide, scrolling).
        // A still logo then costs nothing, which keeps the rest of the page smooth.
        frameloop="demand"
        shadows={false} // Disabling shadows fixes the lag
        camera={{ position: [0, 0, isMobile ? 22 : 12], fov: isMobile ? 50 : 45 }}
      >

        {/* --- LIGHTING --- */}
        <Environment files="/hdri/city.hdr" />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} intensity={2} angle={0.3} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#444" />

        {/* Face Light to illuminate the front */}
        <spotLight
          position={[0, 2, 10]}
          intensity={4}
          angle={0.6}
          distance={30}
        />

        <Suspense fallback={null}>
          <Model position={[0, 0, 0]} />
        </Suspense>

        <CameraRig />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
