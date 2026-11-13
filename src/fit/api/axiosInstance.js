import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_FIT_API_URL || 'http://localhost:3000'}`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout so requests don't hang forever
});

// Add the token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('fitAuthToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 responses globally - clear auth and redirect to login
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('fitAuthToken');
            localStorage.removeItem('fitUser');
            // Web (BrowserRouter) version: full navigation to the Fit login page.
            window.location.href = '/fit/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;