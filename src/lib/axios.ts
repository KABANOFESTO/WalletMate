import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api'
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('custom-auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('custom-auth-token');
      localStorage.removeItem('user');
      window.location.href = '/auth/sign-in';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
