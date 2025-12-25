import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
  timeout: 5000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // We might want to redirect here, but usually router handles redirection on guard check
      // or we can emit an event. For now, just clear token.
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
