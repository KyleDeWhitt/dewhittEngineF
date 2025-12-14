import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function DroidLoader(props) {
  // 1. Load the model
  // Ensure 'droid.glb' is in your 'public/models/' folder
  const { nodes, materials } = useGLTF('/droid.glb');
  
  // 2. Refs for independent animation
  const groupRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // A. FLOAT (The whole droid bobs up and down)
    if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t * 2) * 0.1; 
    }

    // B. ROLL (The Body spins like a ball)
    if (bodyRef.current) {
        bodyRef.current.rotation.x -= delta * 5; // Spin forward speed
    }

    // C. LOOK (The Head swivels left/right)
    if (headRef.current) {
        // Sine wave makes it look left... then right...
        headRef.current.rotation.z = Math.sin(t * 1.5) * 0.3; 
        // Slight bobble for realism
        headRef.current.rotation.x = Math.sin(t * 4) * 0.05; 
    }
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      
      {/* --- THE BODY (Rolling Sphere) --- */}
      {nodes.Body && (
        <mesh 
            ref={bodyRef}
            geometry={nodes.Body.geometry} 
            material={materials.DroidWhite} 
            position={[0, 0, 1.2]} 
        >
             {nodes.Panel_L && <mesh geometry={nodes.Panel_L.geometry} material={materials.DroidAccent} />}
             {nodes.Panel_R && <mesh geometry={nodes.Panel_R.geometry} material={materials.DroidAccent} />}
        </mesh>
      )}

      {/* --- THE HEAD (Floating Dome) --- */}
      {nodes.Head && (
          <group ref={headRef} position={[0, 0, 1.75]}>
              <mesh geometry={nodes.Head.geometry} material={materials.DroidWhite} />
              
              {nodes.Lens_Housing && <mesh geometry={nodes.Lens_Housing.geometry} material={materials.DroidDark} />}
              {nodes.Lens_Glass && <mesh geometry={nodes.Lens_Glass.geometry} material={materials.LensBlack} />}
              {nodes.Antenna && <mesh geometry={nodes.Antenna.geometry} material={materials.DroidDark} />}
          </group>
      )}
      
      {/* --- SHADOW --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial color="black" opacity={0.2} transparent />
      </mesh>

    </group>
  );
}

useGLTF.preload('/droid.glb');