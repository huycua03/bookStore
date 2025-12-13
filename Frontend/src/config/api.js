import axios from 'axios';

// Base API URL from environment variable
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
    (config) => {
        const customer = localStorage.getItem('customer');
        if (customer && customer !== 'undefined') {
            try {
                const customerData = JSON.parse(customer);
                if (customerData.token) {
                    config.headers.Authorization = `Bearer ${customerData.token}`;
                }
            } catch (error) {
                console.error('Error parsing customer data:', error);
                localStorage.removeItem('customer');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, clear local storage
            localStorage.removeItem('customer');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

