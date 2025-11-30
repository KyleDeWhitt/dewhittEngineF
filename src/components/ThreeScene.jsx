import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

// A simple spinning box component
const SpinningBox = () => {
  const meshRef = useRef();

  // Rotate the box every frame (60fps)
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#635bff" wireframe={false} />
    </mesh>
  );
};

const ThreeScene = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas>
        {/* 1. Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* 2. Controls (Let the user rotate/zoom) */}
        <OrbitControls enableZoom={false} />

        {/* 3. Background stars */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* 4. The 3D Object */}
        <SpinningBox />
      </Canvas>
    </div>
  );
};

export default ThreeScene;