import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Adiciona token em todas requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Redireciona para login se 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const verifyToken = () => 
  api.get('/auth/me');

// ===== ASSETS =====
export const getAssets = () => 
  api.get('/assets');

export const getAsset = (id) => 
  api.get(`/assets/${id}`);

export const createAsset = (data) => 
  api.post('/assets', data);

export const updateAsset = (id, data) => 
  api.put(`/assets/${id}`, data);

export const deleteAsset = (id) => 
  api.delete(`/assets/${id}`);

export const getPortfolioSummary = () => 
  api.get('/assets/portfolio/summary');

// ===== ALERTS =====
export const getAlerts = () => 
  api.get('/alerts');

export const createAlert = (data) => 
  api.post('/alerts', data);

export const toggleAlert = (id) => 
  api.put(`/alerts/${id}/toggle`);

export const deleteAlert = (id) => 
  api.delete(`/alerts/${id}`);

// ===== NOTIFICATIONS =====
export const getNotifications = () => 
  api.get('/notifications');

export const markAsRead = (id) => 
  api.put(`/notifications/${id}/read`);

export const markAllAsRead = () => 
  api.put('/notifications/read-all');

export default api;