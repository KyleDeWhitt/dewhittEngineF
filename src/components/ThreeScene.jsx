import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei'; // <--- Added Center
import { Model } from './Logo';
import * as THREE from 'three';

function CameraRig() {
  const { size } = useThree(); 

  useFrame((state, delta) => {
    const scrollY = window.scrollY;
    const scrollMax = document.body.scrollHeight - window.innerHeight || 1; 
    const scrollProgress = Math.min(scrollY / scrollMax, 1);
    
    // Responsive Logic
    // If width < 800px (mobile), pull back to z=22 so the logo fits
    const isMobile = size.width < 800;
    const startZ = isMobile ? 22 : 12; 

    const targetZ = startZ + (scrollProgress * 15);
    
    // Smooth Movement (delta * 2 removes the "jitter")
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z, 
      targetZ, 
      delta * 2 
    );
  });
  return null;
}

const ThreeScene = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 800;
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      <Canvas 
        dpr={2} // Keeps it sharp
        shadows={false} // Disabling shadows fixes the lag
        camera={{ position: [0, 0, 12], fov: isMobile ? 50 : 45 }}
      >
        
        {/* --- LIGHTING --- */}
        <Environment preset="city" />
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
          {/* Shift Model RIGHT on mobile to counter the left-offset */}
          <Model position={[isMobile ? 0.0 : 0, 0, 0]} />
        </Suspense>

        <CameraRig />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/2} minPolarAngle={Math.PI/2} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;