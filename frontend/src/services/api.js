import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 and extract data
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sv_token');
      localStorage.removeItem('sv_user');
      // Only redirect if not already on login/landing
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/' && path !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
