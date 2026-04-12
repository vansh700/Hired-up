import axios from 'axios';

// 5001 - Live Code Backend
const api = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// 5005 - Main Platform Backend (Auth, Jobs, Applications)
export const mainApi = axios.create({
    baseURL: 'http://localhost:5005/api',
});

// Sync logic for both interceptors
const setupInterceptors = (instance) => {
    instance.interceptors.request.use((config) => {
        // 1. Check for token in URL (incoming from main platform)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken) {
            localStorage.setItem('hiredUpToken', urlToken);
            const newUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, '', newUrl);
        }

        // 2. Attach token from localStorage to Header
        const token = localStorage.getItem('hiredUpToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    }, (error) => {
        return Promise.reject(error);
    });
};

setupInterceptors(api);
setupInterceptors(mainApi);

export default api;
