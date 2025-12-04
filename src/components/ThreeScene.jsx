import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { Model as Logo } from './Logo'; 

const Section = ({ children, align = 'left' }) => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start'),
    padding: '0 10%'
  }}>
    <div style={{ width: '100%' }}>{children}</div>
  </div>
);

const AnimatedLights = () => {
  const rimLight = useRef();
  const keyLight = useRef();
  const fillLight = useRef();
  const flashLight = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // 1. RIM LIGHT: Fade to 100
    if (rimLight.current) {
        rimLight.current.intensity = THREE.MathUtils.lerp(rimLight.current.intensity, 100, 0.02);
    }

    // 2. KEY LIGHT: Fade to 30
    if (time > 0.5 && keyLight.current) {
        keyLight.current.intensity = THREE.MathUtils.lerp(keyLight.current.intensity, 30, 0.03);
    }

    // 3. FILL & FLASH: Fade to 15/20
    if (time > 1.0) {
        if (fillLight.current) fillLight.current.intensity = THREE.MathUtils.lerp(fillLight.current.intensity, 15, 0.02);
        if (flashLight.current) flashLight.current.intensity = THREE.MathUtils.lerp(flashLight.current.intensity, 20, 0.02);
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      
      <directionalLight ref={keyLight} position={[5, 10, 20]} intensity={0} color="#fff0dd" castShadow />
      <directionalLight ref={fillLight} position={[-10, 0, 20]} intensity={0} color="#dbeeff" />
      <pointLight ref={flashLight} position={[0, 0, 15]} intensity={0} color="#ffffff" />
      
      <spotLight 
        ref={rimLight}
        position={[0, 20, -10]} 
        angle={0.6} 
        penumbra={1} 
        intensity={0} 
        color="#00bdff" 
        castShadow 
      />
    </>
  );
};

const ThreeScene = () => {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#0b1121' }}> 
      
      <Canvas camera={{ position: [0, 0, 50], fov: 25 }}>
        
        <color attach="background" args={['#0b1121']} />
        <fog attach="fog" args={['#0b1121', 35, 95]} />

        <AnimatedLights />
        <Environment preset="city" />

        <ScrollControls pages={5} damping={0.1}>
            <Suspense fallback={null}>
                <Logo />
            </Suspense>

            <Scroll html style={{ width: '100%' }}>
                
                {/* NAV */}
                <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>DeWhitt<span style={{ color: '#FFD700' }}>Designs</span></div>
                  <a href="/login">
                    <button style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer', pointerEvents: 'auto' }}>
                      Start Project
                    </button>
                  </a>
                </nav>

                {/* 1. SPLASH */}
                <Section></Section>

                {/* 2. HERO */}
                <Section>
                  <h1 style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '20px', color: 'white' }}>
                    Stop Building <br /> Boring Websites.
                  </h1>
                  <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '500px' }}>
                    We build immersive, 3D-enabled platforms on a secure, production-ready SaaS engine.
                  </p>
                </Section>

                {/* 3. PROBLEM / SOLUTION */}
                <Section align="center">
                  <div style={{ width: '100%', maxWidth: '1000px' }}>
                    <div className="comparison-grid">
                        <div className="comparison-card bad">
                            <h3>The Old Way</h3>
                            <ul>
                                <li>Generic Wordpress Templates</li>
                                <li>Insecure Plugins & Hacks</li>
                                <li>Slow Loading Speeds</li>
                                <li>You Don't Own The Code</li>
                            </ul>
                        </div>
                        <div className="comparison-card good">
                            <h3>The DeWhitt Way</h3>
                            <ul>
                                <li>Custom React Engine</li>
                                <li>Bank-Grade Security (JWT/SSL)</li>
                                <li>Immersive 3D Interaction</li>
                                <li>Scalable Database Built-In</li>
                            </ul>
                        </div>
                    </div>
                  </div>
                </Section>

                {/* 4. THE ENGINE */}
                <Section align="center">
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    
                    <div className="engine-card">
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px', marginBottom: '30px', textAlign: 'center' }}>
                            <h2 style={{ color: 'white', fontSize: '2.5rem', margin: 0 }}>The Engine Under The Hood</h2>
                        </div>
                        
                        <div className="engine-specs">
                            <div className="spec-item">
                                <h3>⚡ Full-Stack Core</h3>
                                <p>Built on <strong>Node.js</strong> and <strong>PostgreSQL</strong>. A scalable backend architecture that grows with your business.</p>
                            </div>
                            
                            <div className="spec-item">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="cube-spinner">
                                        <div className="cube-face"></div>
                                        <div className="cube-face"></div>
                                        <div className="cube-face"></div>
                                        <div className="cube-face"></div>
                                        <div className="cube-face"></div>
                                        <div className="cube-face"></div>
                                    </div>
                                    3D Native
                                </h3>
                                <p>Powered by <strong>React Three Fiber</strong>. We don't just embed images; we render live, interactive 3D worlds.</p>
                            </div>

                            <div className="spec-item">
                                <h3>💳 Monetization</h3>
                                <p>Pre-configured <strong>Stripe</strong> integration for subscriptions, one-time payments, and customer management.</p>
                            </div>
                            <div className="spec-item">
                                <h3>🔒 Bank-Grade Security</h3>
                                <p>Standardized <strong>JWT Authentication</strong>, SSL Encryption, and Rate Limiting to protect user data.</p>
                            </div>
                        </div>
                    </div>

                  </div>
                </Section>

                {/* 5. CTA - NOW WRAPPED IN GLASS */}
                <Section align="center">
                  {/* 👇 FIXED: Added Glass Styles here */}
                  <div style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(15px)',
                      borderRadius: '40px',
                      padding: '60px 40px',
                      maxWidth: '800px',
                      width: '100%',
                      margin: '0 auto',
                      textAlign: 'center'
                  }}>
                    <h2 style={{ fontSize: '3rem', color: '#FFD700', marginBottom: '30px' }}>Let's Build Something Solid.</h2>
                    <a href="/register">
                        <button style={{ marginTop: '10px', padding: '20px 60px', fontSize: '1.5rem', borderRadius: '50px', background: '#FFD700', color: 'black', border: 'none', cursor: 'pointer', pointerEvents: 'auto', fontWeight: 'bold' }}>
                        Get Started
                        </button>
                    </a>
                    <div style={{ marginTop: '40px', color: '#666' }}>
                      © 2025 DeWhitt Designs. Built with React Three Fiber.
                    </div>
                  </div>
                </Section>

            </Scroll>
        </ScrollControls>

      </Canvas>
    </div>
  );
};

export default ThreeScene;