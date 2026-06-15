
import { create } from 'zustand';
import api from '../api/axios.js';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, 

  checkAuth: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearUser: () => set({ user: null, isAuthenticated: false }),

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
