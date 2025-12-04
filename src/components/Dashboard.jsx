import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Model as Logo } from './Logo'; // We render their "Project" live

function Dashboard() {
    const { user, logout } = useAuth();
    
    // Mock Data - In the future, this comes from your Database
    const projectStatus = "Phase 2: 3D Modeling";
    const progress = 40; // Percentage

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#0b1121', 
            color: 'white', 
            padding: '40px',
            fontFamily: "'Inter', sans-serif"
        }}>
            
            {/* 1. HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>Project <span style={{ color: '#FFD700' }}>Alpha</span></h1>
                    <p style={{ color: '#888', margin: 0 }}>Client Portal • {user?.email || 'Guest'}</p>
                </div>
                <button 
                    onClick={logout}
                    style={{ 
                        background: 'transparent', 
                        border: '1px solid #334155', 
                        color: '#ccc', 
                        padding: '10px 20px', 
                        borderRadius: '20px' 
                    }}
                >
                    Log Out
                </button>
            </header>

            {/* 2. DASHBOARD GRID */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '30px'
            }}>

                {/* CARD 1: LIVE PREVIEW (The 3D Hero) */}
                <div className="glass-card" style={{ gridColumn: 'span 2', height: '400px', position: 'relative', overflow: 'hidden', padding: 0 }}>
                    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Live Asset Preview</h3>
                        <span style={{ color: '#00bdff', fontSize: '0.8rem', letterSpacing: '1px' }}>INTERACTIVE VIEW</span>
                    </div>
                    
                    {/* Embedded 3D Scene */}
                    <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                        <ambientLight intensity={1.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={5} />
                        <Environment preset="city" />
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                        {/* Reusing your Logo component as the "Project" */}
                        <Logo /> 
                    </Canvas>
                </div>

                {/* CARD 2: PROJECT STATUS */}
                <div className="glass-card">
                    <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>Current Status</h3>
                    
                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{projectStatus}</span>
                            <span style={{ color: '#00bdff' }}>{progress}%</span>
                        </div>
                        {/* Custom Progress Bar */}
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: '#00bdff', borderRadius: '4px', boxShadow: '0 0 10px #00bdff' }}></div>
                        </div>
                    </div>

                    <ul style={{ padding: 0 }}>
                        <li style={{ color: '#888', textDecoration: 'line-through' }}>✓ Phase 1: Discovery</li>
                        <li style={{ color: 'white', fontWeight: 'bold' }}>⟳ Phase 2: 3D Modeling</li>
                        <li style={{ color: '#555' }}>• Phase 3: React Integration</li>
                        <li style={{ color: '#555' }}>• Phase 4: Deployment</li>
                    </ul>
                </div>

                {/* CARD 3: BILLING / SPECS */}
                <div className="glass-card">
                    <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>Subscription</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$500</span>
                        <span style={{ color: '#888', marginLeft: '5px' }}>/ month</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#00ff41' }}>
                        <span style={{ width: '10px', height: '10px', background: '#00ff41', borderRadius: '50%' }}></span>
                        Active • Next Invoice Dec 15
                    </div>

                    <button style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', border: 'none' }}>
                        Manage Payment Method
                    </button>
                </div>

                {/* CARD 4: ACTIONS */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ color: '#FFD700' }}>Quick Actions</h3>
                    <button style={{ padding: '15px', background: '#FFD700', color: 'black', borderRadius: '10px', fontWeight: 'bold', border: 'none' }}>
                        Upload New Assets
                    </button>
                    <button style={{ padding: '15px', background: 'transparent', border: '1px solid #FFD700', color: '#FFD700', borderRadius: '10px', fontWeight: 'bold' }}>
                        Request Revisions
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;