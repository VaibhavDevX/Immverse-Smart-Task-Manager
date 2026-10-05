import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach active mock user ID header
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const activeUserId = localStorage.getItem('immverse_active_user_id');
    if (activeUserId) {
      config.headers['x-user-id'] = activeUserId;
    }
  }
  return config;
});

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';

    return Promise.reject({
      message,
      code,
      status: error.response?.status || 500,
    });
  }
);
