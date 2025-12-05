import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Model as Logo } from './Logo'; 

// Use the ENV variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Dashboard() {
    const { user, logout } = useAuth();
    
    // 1. STATE: Hold the REAL data here
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // 2. EFFECT: Fetch data on load
    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                // We call a new endpoint: /api/my-project
                const response = await axios.get(`${API_URL}/api/my-project`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProject(response.data);
            } catch (err) {
                console.error("Error loading project:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProjectData();
        }
    }, [user]);

    // Default values if data is loading or missing
    const status = project?.status || "Onboarding";
    const progress = project?.progress || 0; // Assuming your DB has a 'progress' field, otherwise 0
    // Note: If your Project model doesn't have a 'progress' column yet, this will be 0. 

    return (
        <div style={{ minHeight: '100vh', background: '#0b1121', color: 'white', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
            
            {/* HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', margin: 0 }}>Project <span style={{ color: '#FFD700' }}>Alpha</span></h1>
                    <p style={{ color: '#888', margin: 0 }}>Client Portal • {user?.email || 'Guest'}</p>
                </div>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid #334155', color: '#ccc', padding: '10px 20px', borderRadius: '20px' }}>
                    Log Out
                </button>
            </header>

            {/* DASHBOARD GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* CARD 1: LIVE PREVIEW */}
                <div className="glass-card" style={{ gridColumn: 'span 2', height: '400px', position: 'relative', overflow: 'hidden', padding: 0 }}>
                    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Live Asset Preview</h3>
                        <span style={{ color: '#00bdff', fontSize: '0.8rem', letterSpacing: '1px' }}>INTERACTIVE VIEW</span>
                    </div>
                    <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                        <ambientLight intensity={1.5} />
                        <Environment preset="city" />
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                        <Logo /> 
                    </Canvas>
                </div>

                {/* CARD 2: STATUS (NOW REAL) */}
                <div className="glass-card">
                    <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>Current Status</h3>
                    
                    {loading ? (
                        <p>Loading project updates...</p>
                    ) : (
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{status}</span>
                                <span style={{ color: '#00bdff' }}>{progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: '#00bdff', borderRadius: '4px', boxShadow: '0 0 10px #00bdff' }}></div>
                            </div>
                        </div>
                    )}

                    <ul style={{ padding: 0 }}>
                        <li style={{ color: status === 'Discovery' ? '#FFD700' : '#888' }}>
                           {status === 'Discovery' ? '⟳' : (progress > 10 ? '✓' : '•')} Phase 1: Discovery
                        </li>
                        <li style={{ color: status === '3D Modeling' ? '#FFD700' : '#888' }}>
                           {status === '3D Modeling' ? '⟳' : (progress > 40 ? '✓' : '•')} Phase 2: 3D Modeling
                        </li>
                    </ul>
                </div>

                {/* CARD 3: SUBSCRIPTION */}
                <div className="glass-card">
                    <h3 style={{ color: '#FFD700', marginBottom: '20px' }}>Subscription</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '10px' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$500</span>
                        <span style={{ color: '#888', marginLeft: '5px' }}>/ month</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#00ff41' }}>
                        <span style={{ width: '10px', height: '10px', background: '#00ff41', borderRadius: '50%' }}></span>
                        Active
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;