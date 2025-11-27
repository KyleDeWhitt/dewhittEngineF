import axios from 'axios';

const axiosInstance = axios.create({
    // ✨ FIX: BaseURL now includes the full API route group /api/user 
    // This resolves the 404 error when combined with the path in ProfileSetup.jsx
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/user`, 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add the token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;