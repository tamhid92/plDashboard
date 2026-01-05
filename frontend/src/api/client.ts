import axios from 'axios';

// Base URL set at build time to /api (proxied by nginx)
export const BASE_URL = import.meta.env.VITE_BASE_URL || '';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        // No X-API-TOKEN here - nginx adds it server-side
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);