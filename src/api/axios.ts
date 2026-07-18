import axios from 'axios';
import { toast } from 'react-hot-toast';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle 429 Too Many Requests (AI Overload)
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '5', 10);
      const message = error.response.data?.message || `AI systems are busy. Retrying in ${retryAfter}s...`;
      
      const toastId = toast.loading(message, {
        icon: '⏳',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      console.warn(`🚀 AI Overload [429]: ${message}. Trace: ${error.response.data?.traceId}`);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          toast.dismiss(toastId);
          resolve(instance(originalRequest));
        }, retryAfter * 1000);
      });
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${instance.defaults.baseURL}/auth/refresh`, {
          refreshToken
        });

        localStorage.setItem('access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    if (error.response?.data?.traceId) {
      console.error(`❌ API Error [TraceID: ${error.response.data.traceId}]`, error.response.data);
    }
    return Promise.reject(error);
  }
);

export default instance;
