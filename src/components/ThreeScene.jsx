import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Stars, Environment } from '@react-three/drei';
import { Link } from 'react-router-dom';
// 👇 FIXED: Import the Logo instead of the Model
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

const ThreeScene = () => {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000000' }}> 
      {/* Camera z=4 ensures the logo fits on screen */}
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        
        {/* LIGHTING & ENV */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} />
        <Environment preset="city" />
        <Stars radius={300} depth={50} count={5000} factor={4} fade speed={1} />

        {/* SCROLL CONTROLS */}
        <ScrollControls pages={3} damping={0.1}>
            
            {/* LAYER 1: THE 3D LOGO */}
            <Suspense fallback={null}>
                <Logo />
            </Suspense>

            {/* LAYER 2: THE HTML OVERLAY */}
            <Scroll html style={{ width: '100%' }}>
                
                <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>DeWhitt<span style={{ color: '#009A44' }}>Designs</span></div>
                  <Link to="/login">
                    <button style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer', pointerEvents: 'auto' }}>
                      Start Project
                    </button>
                  </Link>
                </nav>

                {/* HERO */}
                <Section>
                  <h1 style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '20px', color: 'white' }}>
                    Stop Building <br /> Boring Websites.
                  </h1>
                  <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '500px' }}>
                    Scroll down to see the DeWhitt difference.
                  </p>
                </Section>

                {/* SECTION 2 */}
                <Section align="right">
                  <div style={{ textAlign: 'right', color: 'white' }}>
                    <h2 style={{ fontSize: '3rem', marginBottom: '20px' }}>We Break The Mold.</h2>
                    <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '400px', marginLeft: 'auto' }}>
                      Standard templates restrict your creativity. We deconstruct the web and rebuild it in 3D.
                    </p>
                  </div>
                </Section>

                {/* SECTION 3 */}
                <Section align="center">
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <h2 style={{ fontSize: '3rem', color: '#009A44' }}>Let's Build Something Solid.</h2>
                    <Link to="/register">
                        <button style={{ marginTop: '20px', padding: '15px 40px', fontSize: '1.2rem', borderRadius: '5px', background: '#009A44', color: 'white', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}>
                        Get Started
                        </button>
                    </Link>
                    <div style={{ marginTop: '50px', color: '#666' }}>
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