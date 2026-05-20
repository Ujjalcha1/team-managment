'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string; department?: string }) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { token, user } = res.data.data;
          localStorage.setItem('token', token);
          if (typeof window !== 'undefined') {
            document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;`;
          }
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false, error: err.response?.data?.message || 'Login failed' });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', data);
          const { token, user } = res.data.data;
          localStorage.setItem('token', token);
          if (typeof window !== 'undefined') {
            document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax;`;
          }
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false, error: err.response?.data?.message || 'Registration failed' });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
        }
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.data.user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.put('/auth/profile', data);
          set({ user: res.data.data.user, isLoading: false });
        } catch (err: any) {
          set({ isLoading: false, error: err.response?.data?.message || 'Update failed' });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }) }
  )
);
