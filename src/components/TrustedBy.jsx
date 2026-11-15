import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useGLTF, Environment, Float } from '@react-three/drei';

useGLTF.preload('/euro_logo.glb');

const projects = [
  // 1. EURO LOGO
  // FIXED: Set scale to 0.05
  { type: 'glb', path: '/euro_logo.glb', title: '3D LOGOS', scale: 0.05 }, 
  
  // 2. STANDARD SHAPES
  { type: 'color', color: '#FFD700', title: 'HDRI LIGHTING' }, 
      
];

function FloatingItem({ position, item }) {
  const meshRef = useRef();
  const { scene } = useGLTF(item.path || '/euro_logo.glb');
  const sceneClone = item.type === 'glb' ? scene.clone() : null;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={position}>
       <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
         <group ref={meshRef}>
           {item.type === 'glb' ? (
             <primitive 
               object={sceneClone} 
               scale={item.scale} 
               rotation={[0, 0, 0]} 
             />
           ) : (
             <mesh rotation={[0.5, 0.4, 0]}>
               <dodecahedronGeometry args={[1, 0]} /> 
               <meshStandardMaterial 
                  color={item.color} 
                  metalness={0.9} 
                  roughness={0.1} 
               />
             </mesh>
           )}
         </group>
       </Float>
       
       <Text 
         position={[0, -2, 0]} 
         fontSize={0.4} 
         color="white"
         anchorX="center" 
         anchorY="middle"
         letterSpacing={0.1}
       >
         {item.title}
       </Text>
    </group>
  );
}

function MarqueeGroup() {
  const groupRef = useRef();
  const [paused, setPaused] = useState(false);
  const gap = 5; 
  const displayItems = [...projects, ...projects, ...projects];
  const cycleWidth = projects.length * gap; 

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (!paused) {
      groupRef.current.position.x -= delta * 1.5; 
    }
    if (groupRef.current.position.x < -cycleWidth) {
      groupRef.current.position.x += cycleWidth;
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setPaused(true)} 
      onPointerOut={() => setPaused(false)}
    >
      {displayItems.map((item, index) => (
        <FloatingItem 
          key={index} 
          position={[index * gap, 0, 0]} 
          item={item} 
        />
      ))}
    </group>
  );
}

export default function TrustedBy() {
  return (
    <section style={{ 
      height: '400px', 
      width: '100%', 
      position: 'relative',
      background: 'transparent', 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <p style={{ 
        textAlign: 'center', 
        color: '#666', 
        marginBottom: '10px', 
        letterSpacing: '3px',
        fontSize: '0.9rem',
        textTransform: 'uppercase'
      }}>
      
      </p>

      <div style={{ width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 40 }} gl={{ alpha: true }}>
          {/* THE MAGIC LIGHTING */}
          <Environment files="/hdri/city.hdr" />
          
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} />
          
          <group position={[0, 0, 0]}>
             <MarqueeGroup />
          </group>
        </Canvas>
      </div>
    </section>
  );
}