
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',           
  withCredentials: true,     
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      import('../store/authStore.js').then(({ useAuthStore }) => {
        const wasAuthenticated = useAuthStore.getState().isAuthenticated;
        useAuthStore.getState().clearUser();
        if (wasAuthenticated) {
          window.location.href = '/login';
        }
      });
    }
    return Promise.reject(error);
  }
);

export default api;
