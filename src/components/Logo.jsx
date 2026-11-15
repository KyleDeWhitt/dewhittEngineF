import React, { useLayoutEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Slide-in timing
const INTRO_DELAY = 0.2;     // seconds to wait after the model first renders
const INTRO_DURATION = 1.6;  // seconds for the words to slide into place
const START_OFFSET = 10;     // how far off-screen (left/right) the words start
const MAX_STEP = 1 / 30;     // never advance the animation more than this per frame,
                             // so one slow frame can't make the words jump

const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Model(props) {
  const { scene } = useGLTF('/Logo.glb');
  const invalidate = useThree((state) => state.invalidate);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const intro = useRef({ elapsed: 0, done: true });

  // Layout effect (not a normal effect) so the words are already restyled and
  // parked off-screen before the first frame is drawn. Otherwise the raw model
  // flashes in the middle of the screen for a frame.
  useLayoutEffect(() => {
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeBoundingBox();
        meshes.push(child);
      }
    });

    if (meshes.length < 2) return;

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
    topMesh.scale.set(1, 1, 1);

    // --- 2. BOTTOM WORD (SILVER) ---
    bottomMesh.material = new THREE.MeshStandardMaterial({
      color: '#C0C0C0',
      metalness: 1,
      roughness: 0.15,
    });
    bottomMesh.scale.set(1, 1, 1);

    const skipIntro = prefersReducedMotion();

    // Top word slides in from the LEFT, bottom word from the RIGHT.
    topMesh.position.set(skipIntro ? 0 : -START_OFFSET, 0, 0);
    bottomMesh.position.set(skipIntro ? 0 : START_OFFSET, 0.5, 1.4);

    // While the words are off-screen, still let the GPU process them. That way
    // the material is compiled before the slide starts instead of causing a
    // stutter at the moment the words enter the screen.
    topMesh.frustumCulled = skipIntro;
    bottomMesh.frustumCulled = skipIntro;

    topRef.current = topMesh;
    bottomRef.current = bottomMesh;
    intro.current = { elapsed: 0, done: skipIntro };
    invalidate();

    return () => {
      topMesh.material.dispose();
      bottomMesh.material.dispose();
    };
  }, [scene, invalidate]);

  useFrame((state, delta) => {
    const anim = intro.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    if (anim.done || !top || !bottom) return;

    anim.elapsed += Math.min(delta, MAX_STEP);
    const t = THREE.MathUtils.clamp((anim.elapsed - INTRO_DELAY) / INTRO_DURATION, 0, 1);
    const offset = START_OFFSET * (1 - easeOutQuart(t));

    top.position.x = -offset;
    bottom.position.x = offset;

    if (t >= 1) {
      anim.done = true;
      top.frustumCulled = true;
      bottom.frustumCulled = true;
    }

    // Keep drawing frames until the slide finishes (needed when the canvas
    // only renders on demand).
    invalidate();
  });

  return (
    <primitive object={scene} rotation={[Math.PI / 2, 0, 0]} {...props} />
  );
}

useGLTF.preload('/Logo.glb');
