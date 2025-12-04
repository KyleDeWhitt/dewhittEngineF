import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminDashboard() {
    const { logout } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            
            const res = await axios.get(`${API_URL}/api/admin/clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (userId, field, value) => {
        setClients(prevClients => prevClients.map(client => {
            if (client.id === userId) {
                const project = client.Project || {};
                return { ...client, Project: { ...project, [field]: value } };
            }
            return client;
        }));
    };

    const saveProject = async (client) => {
        try {
            const token = localStorage.getItem('authToken');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            
            const projectData = {
                name: client.Project?.name,
                status: client.Project?.status,
                progress: client.Project?.progress,
                nextInvoiceDate: client.Project?.nextInvoiceDate,
                subscriptionAmount: client.Project?.subscriptionAmount
            };

            await axios.put(`${API_URL}/api/admin/project/${client.id}`, projectData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(`Saved updates for ${client.first_name}`);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error("Save failed:", error);
            setMessage("Error saving changes.");
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0b1121', padding: '40px', color: 'white' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', margin: 0, color: 'white' }}>Mission <span style={{ color: '#FFD700' }}>Control</span></h1>
                    <p style={{ color: '#888' }}>Admin Dashboard • Manage Client Projects</p>
                </div>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid #334155', color: '#ccc', padding: '10px 20px', borderRadius: '20px' }}>
                    Log Out
                </button>
            </header>

            {message && <div style={{ background: '#00bdff', color: 'black', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontWeight: 'bold' }}>{message}</div>}

            <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
                {loading ? <p>Loading clients...</p> : (
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#FFD700' }}>Client</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#FFD700' }}>Project Name</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#FFD700' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#FFD700' }}>Progress</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#FFD700' }}>Invoice</th>
                                <th style={{ textAlign: 'left', padding: '10px', color: '#FFD700' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(client => (
                                <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <td style={{ padding: '10px' }}>
                                        <strong>{client.first_name} {client.last_name}</strong><br/>
                                        <span style={{ fontSize: '0.8em', color: '#888' }}>{client.email}</span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input 
                                            value={client.Project?.name || ''} 
                                            onChange={(e) => handleInputChange(client.id, 'name', e.target.value)}
                                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', padding: '5px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <select 
                                            value={client.Project?.status || 'Onboarding'}
                                            onChange={(e) => handleInputChange(client.id, 'status', e.target.value)}
                                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', padding: '5px' }}
                                        >
                                            <option value="Onboarding">Onboarding</option>
                                            <option value="Phase 1: Discovery">Phase 1: Discovery</option>
                                            <option value="Phase 2: 3D Modeling">Phase 2: 3D Modeling</option>
                                            <option value="Phase 3: React Dev">Phase 3: React Dev</option>
                                            <option value="Phase 4: QA Testing">Phase 4: QA Testing</option>
                                            <option value="Live">Live</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input 
                                            type="number"
                                            value={client.Project?.progress || 0} 
                                            onChange={(e) => handleInputChange(client.id, 'progress', e.target.value)}
                                            style={{ width: '50px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', padding: '5px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <input 
                                            value={client.Project?.nextInvoiceDate || ''} 
                                            onChange={(e) => handleInputChange(client.id, 'nextInvoiceDate', e.target.value)}
                                            style={{ width: '80px', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', color: 'white', padding: '5px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button onClick={() => saveProject(client)} style={{ padding: '5px 15px', background: '#00bdff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            SAVE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;