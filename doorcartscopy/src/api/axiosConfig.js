import axios from 'axios';

// Base URL for the Doorcarts backend API.
// Set VITE_API_URL in a .env file at the project root to point at a
// deployed backend (e.g. VITE_API_URL=https://api.doorcarts.com/api).
// Falls back to the local backend dev server.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  // The backend signs the JWT into an httpOnly cookie (see
  // Backend/src/utils/generateToken.js -> sendTokenResponse). withCredentials
  // is required so the browser sends/receives that cookie on every request.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: attach a Bearer token as a fallback auth path.
// The backend's `protect` middleware checks the httpOnly cookie first and
// only falls back to this header if no cookie is present (see
// Backend/src/middleware/auth.js). We still store the token returned from
// verify-otp in localStorage so this fallback works in environments where
// third-party cookies are blocked.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: on 401, clear stale auth state and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;