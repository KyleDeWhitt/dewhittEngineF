import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import SubscribeButton from '../components/SubscribeButton';
// 👇 1. Import your new 3D Scene
import ThreeScene from '../components/ThreeScene';

// Define the Base URL needed for other routes
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Dashboard() {
    const { user, logout } = useAuth();
    
    // State to hold data from the backend
    const [goals, setGoals] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const displayName = user?.name || 'Client'; 

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('authToken'); 

            if (!token) {
                 setLoading(false);
                 logout(); 
                 return;
            }

            try {
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const [goalsRes, logsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/goals`, config),
                    axios.get(`${BASE_URL}/api/logs`, config)
                ]);

                setGoals(goalsRes.