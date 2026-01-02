import axios from 'axios';

// Use relative URL to leverage Vite proxy
export const BASE_URL = '';

export const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
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
