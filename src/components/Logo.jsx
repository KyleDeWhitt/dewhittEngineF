import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Model(props) {
  const { scene } = useGLTF('/Logo.glb');
  const topRef = useRef();
  const bottomRef = useRef();

  useEffect(() => {
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        meshes.push(child);
      }
    });

    if (meshes.length >= 2) {
      // Sort by Geometry Height (Reliable)
      meshes.sort((a, b) => {
        const centerA = new THREE.Vector3();
        const centerB = new THREE.Vector3();
        a.geometry.boundingBox.getCenter(centerA);
        b.geometry.boundingBox.getCenter(centerB);
        return centerB.y - centerA.y; // High Y = Top
      });

      const topMesh = meshes[0];     // "DeWhitt"
      const bottomMesh = meshes[1];  // "DESIGNS"

      // --- FORCE CENTER GEOMETRY ---
      // This ensures the 0,0,0 point is the exact middle of the words
      topMesh.geometry.center();
      bottomMesh.geometry.center();

      // --- 1. TOP WORD (GOLD) ---
      topMesh.material = new THREE.MeshStandardMaterial({
        color: '#FFD700',
        metalness: 1,
        roughness: 0.15,
      });
      topRef.current = topMesh;
      
      // Position:
      topMesh.position.set(0, 0, 0); 
      topMesh.scale.set(1, 1, 1);
      
      // Animation Setup
      topMesh.userData.finalZ = 0; 
      topMesh.position.z -= 5; 

      // --- 2. BOTTOM WORD (SILVER) ---
      bottomMesh.material = new THREE.MeshStandardMaterial({
        color: '#C0C0C0',
        metalness: 1,
        roughness: 0.15,
      });
      bottomRef.current = bottomMesh;

      // POSITION FIX:
      // y = 0.5 -> Forward (Depth)
      // z = 1.4 -> DOWN (Height). Increased from 0.7 to 1.4 to clear the gap.
      bottomMesh.position.set(0, 0.5, 1.4); 
      bottomMesh.scale.set(1, 1, 1);

      // Animation Setup
      bottomMesh.userData.finalZ = 1.4; 
      bottomMesh.position.z += 5; 
    }
  }, [scene]);

  useFrame((state, delta) => {
    // Smooth Animation
    if (topRef.current) {
      topRef.current.position.z = THREE.MathUtils.lerp(
        topRef.current.position.z,
        topRef.current.userData.finalZ,
        delta * 3
      );
    }
    if (bottomRef.current) {
      bottomRef.current.position.z = THREE.MathUtils.lerp(
        bottomRef.current.position.z,
        bottomRef.current.userData.finalZ,
        delta * 3
      );
    }
  });

  return (
    <primitive object={scene} rotation={[Math.PI / 2, 0, 0]} {...props} />
  );
}

useGLTF.preload('/Logo.glb');