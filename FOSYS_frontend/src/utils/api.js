import axios from 'axios';

// ✅ Set correct FastAPI backend URL
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';

// ✅ Create a custom Axios instance
const api = axios.create({
    baseURL: API_URL,
});

// ✅ Add interceptor to include the token (if any)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

console.log("✅ Using backend at:", API_URL);  // <-- Add this for debugging
export default api;
