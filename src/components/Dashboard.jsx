import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Model as Logo } from './ClientLogo'; 
import CheckoutButton from './CheckoutButton'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const GOLD_COLOR = '#FFD700';
const BG_COLOR = '#0b1121';

const PHASES = [
    { name: 'Discovery', description: 'Consultation & Requirements' },
    { name: 'Strategy', description: 'Wireframes & Architecture' },
    { name: 'Development', description: 'High-fidelity Coding' },
    { name: 'Launch', description: 'QA Testing & Deployment' }
];

function Dashboard() {
    const { user, logout } = useAuth();
    const [project, setProject] = useState(null);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${API_URL}/api/my-project`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProject(response.data);
            } catch (err) {
                console.error("Error loading project:", err);
            } 
        };

        if (user) fetchProjectData();
    }, [user]);

    const status = project?.status || "Discovery"; 
    const progress = project?.progress || 10; 
    const isPremium = user?.planTier === 'premium'; 

    const activePhaseIndex = PHASES.findIndex(p => p.name === status);
    const safeActiveIndex = activePhaseIndex === -1 ? 0 : activePhaseIndex;

    return (
        <div style={{ minHeight: '100vh', background: BG_COLOR, color: 'white', fontFamily: "'Inter', sans-serif" }}>
            
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        {/* UPDATED: Removed the word "Project" from the beginning */}
                        <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: '800', letterSpacing: '-1px' }}>
                            <span style={{ color: GOLD_COLOR }}>{project?.name || 'Alpha'}</span>
                        </h1>
                        <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                            {project?.clientName || user?.email} • {isPremium ? 'Premium Plan' : 'Preview Mode'}
                        </p>
                    </div>
                    <button onClick={logout} style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid #334155', 
                        color: '#94a3b8', 
                        padding: '10px 24px', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}>
                        Log Out
                    </button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '30px' }}>

                    {/* 1. VISUALIZER */}
                    <div style={{ 
                        gridColumn: 'span 8', 
                        height: '600px', 
                        position: 'relative', 
                        overflow: 'hidden', 
                        borderRadius: '24px',
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{
                            position: 'absolute', top: 30, left: 30, zIndex: 10,
                            display: 'flex', gap: '10px'
                        }}>
                             <div style={{
                                background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '30px',
                                border: `1px solid ${GOLD_COLOR}`, color: GOLD_COLOR, 
                                fontSize: '0.75rem', fontWeight: 'bold', backdropFilter: 'blur(4px)'
                            }}>
                                ● LIVE PREVIEW
                            </div>
                        </div>

                        <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                            <ambientLight intensity={1.5} />
                            <Environment preset="city" />
                            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={isPremium ? 2 : 0.5} />
                            <Logo /> 
                        </Canvas>
                    </div>

                    {/* 2. ROADMAP */}
                    <div style={{ 
                        gridColumn: 'span 4', 
                        background: '#1e293b', 
                        borderRadius: '24px', 
                        padding: '30px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', 
                        flexDirection: 'column'
                    }}>
                        <h3 style={{ margin: '0 0 30px 0', fontSize: '1.2rem', color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
                            Project Roadmap
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', flex: 1 }}>
                            {PHASES.map((phase, index) => {
                                const isActive = index === safeActiveIndex;
                                const isPast = index < safeActiveIndex;
                                const isLocked = (!isPremium && index > 0) || index > safeActiveIndex; 

                                return (
                                    <div key={phase.name} style={{ 
                                        position: 'relative', 
                                        paddingLeft: '40px', 
                                        paddingBottom: '35px',
                                        opacity: isLocked && index > 1 ? 0.3 : 1 
                                    }}>
                                        {index !== PHASES.length - 1 && (
                                            <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: '0', width: '2px', background: '#334155' }}></div>
                                        )}
                                        <div style={{ 
                                            position: 'absolute', left: '0', top: '2px', 
                                            width: '24px', height: '24px', borderRadius: '50%', 
                                            background: isActive ? GOLD_COLOR : (isPast ? '#10b981' : '#334155'),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            zIndex: 2,
                                            boxShadow: isActive ? `0 0 15px ${GOLD_COLOR}66` : 'none',
                                            color: isActive ? 'black' : 'white',
                                            fontSize: '12px', fontWeight: 'bold'
                                        }}>
                                            {isPast ? '✓' : (isLocked ? '🔒' : (index + 1))}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: isActive ? GOLD_COLOR : 'white' }}>{phase.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{phase.description}</p>
                                            {isActive && (
                                                <div style={{ marginTop: '15px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                                                        <span>Completion</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '10px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${progress}%`, height: '100%', background: GOLD_COLOR, borderRadius: '10px' }}></div>
                                                    </div>
                                                </div>
                                            )}
                                            {isLocked && index === 1 && !isPremium && (
                                                <div style={{ marginTop: '15px' }}>
                                                    <CheckoutButton label="🔓 Unlock Phase 2" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;