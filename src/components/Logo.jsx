import React, { useRef, useState, useEffect } from 'react' // Added useState, useEffect
import { useGLTF, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Model(props) {
  const { nodes } = useGLTF('/euro_logo.glb')
  const groupRef = useRef()
  const scroll = useScroll()

  // --- RESPONSIVE SCALE LOGIC ---
  // If screen is smaller than 768px (mobile), shrink scale to 0.55. Otherwise 1.0.
  const [scale, setScale] = useState(window.innerWidth < 768 ? 0.55 : 1)

  useEffect(() => {
    const handleResize = () => {
      setScale(window.innerWidth < 768 ? 0.55 : 1)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  // ------------------------------

  useFrame((state, delta) => {
    const scrollOffset = scroll?.offset || 0; 
    const mouseX = state.mouse.x;
    const mouseY = state.mouse.y;

    if (groupRef.current) {
        
        // --- 1. CINEMATIC FLY-IN ---
        const mainText = groupRef.current.children[0];
        const subText = groupRef.current.children[1];

        // Targets 
        const targetMainY = 0.25; 
        const targetSubY = -1.5; 

        // Smooth Fly-In
        if (mainText) mainText.position.y = THREE.MathUtils.lerp(mainText.position.y, targetMainY, 0.02);
        if (subText) subText.position.y = THREE.MathUtils.lerp(subText.position.y, targetSubY, 0.02);

        // --- 2. SCROLL PUSH ---
        const targetZ = scrollOffset * -20;
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);

        // --- 3. FLOAT & MOUSE TRACKING ---
        const floatY = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        groupRef.current.position.y = floatY;
        
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX * 0.2, 0.05);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY * 0.2, 0.05);
    }
  })

  return (
    // APPLY THE DYNAMIC SCALE HERE 👇
    <group {...props} dispose={null} ref={groupRef} scale={scale}>
      
      {/* 1. "DeWhitt" */}
      <mesh 
        geometry={nodes.Logo_Main.geometry} 
        position={[0.094, 10.0, -0.891]} 
        rotation={[Math.PI / 2, 0, 0]}   
        scale={1.5}
        castShadow 
        receiveShadow
      >
          <meshStandardMaterial 
            color="#FFB800"        
            metalness={1.0}        
            roughness={0.15}       
            envMapIntensity={2.5}  
          />
      </mesh>

      {/* 2. "DESIGNS" */}
      <mesh 
        geometry={nodes.Logo_Sub.geometry} 
        position={[0.022, -10.0, 1.159]} 
        rotation={[Math.PI / 2, 0, 0]}
        scale={1.0}
        castShadow             
        receiveShadow 
      >
          <meshStandardMaterial 
            color="#e0e0e0"        
            roughness={0.4}        
            metalness={0.8}        
            envMapIntensity={2}    
          />
      </mesh>

    </group>
  )
}

useGLTF.preload('/Logo.glb')