import React, { Suspense, useMemo, useLayoutEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

// CACHE BUSTER
const MODEL_URL = '/Logo.glb?v=gold_v1'; 

useGLTF.preload(MODEL_URL);

function DraggableModel() {
  const gltf = useGLTF(MODEL_URL);
  const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  // --- MATERIAL OVERRIDE ---
  // Applying the "Gold Standard" look to match your branding
  useLayoutEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#FFD700',   // GOLD Color (Match branding)
          metalness: 1.0,     // Fully Metallic
          roughness: 0.15,    // Polished/Shiny
          envMapIntensity: 1.5 // Strong reflections from the "City" environment
        });
      }
    });
  }, [scene]);
  
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        
        {/* ROTATION: X=90 degrees (Kept the one that worked!) */}
        <primitive 
          object={scene} 
          scale={0.5} 
          position={[0, -0.5, 0]} 
          rotation={[Math.PI / 2, 0, 0]} 
        />
        
      </Float>
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
    </group>
  );
}

const InteractiveLogo = () => {
  return (
    <section style={{ 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      padding: '50px 0',
      position: 'relative',
      zIndex: 10 
    }}>
      
      <div style={{
        width: '100%',
        maxWidth: '600px',
        height: '400px',
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '30px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '0', 
          width: '100%', 
          textAlign: 'center', 
          color: '#666', 
          fontSize: '0.8rem', 
          letterSpacing: '2px',
          pointerEvents: 'none' 
        }}>
          DRAG TO ROTATE
        </div>

        <Canvas camera={{ position: [0, 0, 8], fov: 45 }} gl={{ alpha: true }}>
          
          {/* --- EXACT LIGHTING FROM MAIN SCENE --- */}
          {/* 1. Environment: City reflections */}
          <Environment preset="city" />
          
          {/* 2. Ambient: Low intensity (0.5) to keep shadows dramatic */}
          <ambientLight intensity={0.5} />
          
          {/* 3. Side Light: Definition */}
          <spotLight position={[10, 10, 10]} intensity={2} angle={0.3} penumbra={1} />
          
          {/* 4. Fill Light: Softens shadows */}
          <pointLight position={[-10, -10, -10]} intensity={1} color="#444" />

          {/* 5. FACE LIGHT: The Key Ingredient for Shine */}
          <spotLight 
            position={[0, 2, 10]} 
            intensity={4} 
            penumbra={1} 
            angle={0.6}           
            distance={30}
          />

          <Suspense fallback={null}>
            <DraggableModel />
          </Suspense>

          <OrbitControls 
            enableZoom={false} 
            autoRotate={true} 
            autoRotateSpeed={2}
          />
        </Canvas>

      </div>
    </section>
  );
};

export default InteractiveLogo;