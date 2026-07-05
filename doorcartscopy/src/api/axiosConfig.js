import axios from 'axios';

// അടിസ്ഥാന URL സെറ്റ് ചെയ്യുക (Change this when deploying)
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: എല്ലാ റിക്വസ്റ്റുകൾക്കും കൂടെ ടോക്കൺ അയക്കാൻ ഇത് സഹായിക്കും
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: ടോക്കൺ എക്സ്പയർ ആയാൽ ലോഗ്ഔട്ട് ചെയ്യാൻ
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;