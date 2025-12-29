import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Center, useGLTF, Environment } from '@react-three/drei';

// ==========================================
// 1. THE DEWITT BRAND ICON (NEW: GLB MODEL)
// ==========================================
function DeWittModel() {
  const { scene } = useGLTF('/DD.glb');
  const groupRef = useRef(); // <--- New ref for the container

  // 1. DEFINE ROYAL PURPLE COLOR
  // You can tune this hex code. #6B3FA0 is a solid Royal Purple.
  // Other options: #7851A9 (lighter), #4B0082 (Indigo/Deep)
  const purpleColor = new THREE.Color("#663399"); 

  // 2. APPLY THE COLOR TO THE MODEL
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Option A: If you want to keep the metalness/roughness but change color
        child.material.color = purpleColor;
        
        // Option B (Recommended): Force a specific material look
        // child.material = new THREE.MeshStandardMaterial({
        //   color: purpleColor,
        //   metalness: 0.8,
        //   roughness: 0.2,
        //   envMapIntensity: 1
        // });
      }
    });
  }, [scene, purpleColor]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Spin the PARENT group around the World Y axis (Vertical)
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Center>
      {/* 1. THE SPINNER (Parent Group) */}
      <group ref={groupRef}> 
        
        {/* 2. THE MODEL (Child) - Static rotation just to stand it up */}
        <primitive 
          object={scene} 
          scale={4} 
          rotation={[Math.PI / 2, 0, 0]} // Keep this rotation to make it stand up
        />
        
      </group>
    </Center>
  );
}

// Preload the GLB file for smoother loading
useGLTF.preload('/DD.glb');

function DeWittGLBIcon() {
  return (
    <div style={{ width: '90px', height: '90px', display: 'inline-block' }}> 
      {/* FIX: Removed double comma and moved camera back to z=6 so it can see the object */}
      <Canvas camera={{ position: [0, 0, 6] }} gl={{ alpha: true }}>
        <Environment preset="studio" />
        <DeWittModel />
      </Canvas>
    </div>
  );
}

// ==========================================
// 2. THE LIGHTNING BOLT
// ==========================================
function LightningBolt() {
  const meshRef = useRef();
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0.2, 2); s.lineTo(-0.8, 0); s.lineTo(-0.2, 0); 
    s.lineTo(-0.8, -2); s.lineTo(0.8, -0.2); s.lineTo(0.2, -0.2); s.lineTo(0.8, 2);
    return s;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 2; 
    const t = state.clock.getElapsedTime();
    meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 10) * 0.3; // Reduced max intensity
  });

  return (
    <Center>
      <mesh ref={meshRef}>
        <extrudeGeometry args={[shape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.1 }]} />
        <meshStandardMaterial color="#FFD700" roughness={0.2} metalness={1} emissive="#FFD700" emissiveIntensity={0.5} />
      </mesh>
    </Center>
  );
}

function AnimatedBoltIcon() {
  return (
    <div style={{ width: '60px', height: '60px', display: 'inline-block' }}>
      <Canvas camera={{ position: [0, 0, 5] }} gl={{ alpha: true }}>
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} intensity={5} />
        <LightningBolt />
      </Canvas>
    </div>
  );
}

// ==========================================
// 3. THE ROTATING CUBE
// ==========================================
function RotatingCube() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.8, 1.8, 1.8]} />
      <meshStandardMaterial color="#FFD700" wireframe={true} emissive="#FFD700" emissiveIntensity={0.2} />
    </mesh>
  );
}

function GoldCubeIcon() {
  return (
    <div style={{ width: '60px', height: '60px', display: 'inline-block' }}>
      <Canvas camera={{ position: [0, 0, 3] }} gl={{ alpha: true }}>
        <ambientLight intensity={2} />
        <RotatingCube />
      </Canvas>
    </div>
  );
}

// ==========================================
// 4. MAIN COMPONENT & DATA
// ==========================================
const serviceData = [
  {
    title: "High-Performance Web",
    desc: "Blazing fast websites built with React & Next.js. We prioritize SEO, speed, and conversion-focused architectures.",
    icon: <AnimatedBoltIcon /> 
  },
  {
    title: "Immersive 3D Experiences",
    desc: "Captivate your audience with interactive 3D elements. From product showcases (like the one above) to full virtual environments.",
    icon: <GoldCubeIcon /> 
  },
  {
    title: "Strategic Branding",
    desc: "Visual identities that stick. We forge logos, color systems, and design languages that tell your story at a glance.",
    // UPDATED ICON
    icon: <DeWittGLBIcon /> 
  }
];

function ServiceCard({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)', 
        border: hovered ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '20px',
        padding: '40px',
        transition: 'all 0.4s ease',
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)', 
        cursor: 'default',
        backdropFilter: 'blur(10px)',
        boxShadow: hovered ? '0 10px 30px rgba(255, 215, 0, 0.1)' : 'none',
        display: 'flex',          
        flexDirection: 'column',  
        alignItems: 'center',     
        textAlign: 'center'       
      }}
    >
      <div style={{ 
        height: '90px', 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', 
        width: '100%',            
        filter: hovered ? 'drop-shadow(0 0 10px #FFD700)' : 'none', 
        transition: 'all 0.3s ease'
      }}>
        {item.icon}
      </div>
      
      <h3 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '15px', 
        color: hovered ? '#FFD700' : 'white', 
        transition: 'color 0.3s ease'
      }}>
        {item.title}
      </h3>
      
      <p style={{ color: '#aaa', lineHeight: '1.6' }}>
        {item.desc}
      </p>
    </div>
  );
}

export default function Services() {
  return (
    <section style={{ 
      padding: '100px 5vw', 
      position: 'relative', 
      zIndex: 10 
    }}>
       
       <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: 'min(3rem, 6vw)', marginBottom: '20px' }}>
            Secret Ingredients
          </h2>
          <div style={{ width: '60px', height: '4px', background: '#FFD700', margin: '0 auto', borderRadius: '2px' }}></div>
       </div>

       <div style={{
         display: 'grid',
         gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
         gap: '40px',
         maxWidth: '1200px',
         margin: '0 auto'
       }}>
         {serviceData.map((service, index) => (
            <ServiceCard key={index} item={service} />
         ))}
       </div>
       
    </section>
  );
}