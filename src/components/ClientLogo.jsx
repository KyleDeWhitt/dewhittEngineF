import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function Model(props) {
  // 1. CHANGE THIS to match your new filename!
  const { scene } = useGLTF('euro_logo.glb'); 
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
        // Optional: Add a slow spin
        groupRef.current.rotation.y += 0.005;
        
        // Optional: Add a gentle float
        groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group {...props} dispose={null} ref={groupRef}>
      {/* <primitive> renders the entire Blender scene exactly as it is.
        Adjust 'scale' if your model is too huge or too tiny.
      */}
      <primitive object={scene} scale={.05} /> 
    </group>
  );
}

// Preload to prevent lag
useGLTF.preload('euro_logo.glb');