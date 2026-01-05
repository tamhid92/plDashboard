import axios from 'axios';

// Use environment variable for Base URL, or empty string (relative) as fallback
// In production (nginx), this should likely be /api if using the nginx proxy
export const BASE_URL = import.meta.env.VITE_BASE_URL || '';
export const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-TOKEN': API_TOKEN,
    },
});

// Response interceptor for error handling if needed
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);
