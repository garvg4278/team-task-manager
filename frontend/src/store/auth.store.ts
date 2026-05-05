import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, setAccessToken } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MEMBER';
  avatar?: string;
  bio?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setUser: (user: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          const { user, accessToken } = data.data;
          setAccessToken(accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register({ name, email, password });
          const { user, accessToken } = data.data;
          setAccessToken(accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Logout even if API fails
        } finally {
          setAccessToken(null);
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user }),

      initialize: async () => {
        const { accessToken } = get();
        if (accessToken) {
          setAccessToken(accessToken);
          await get().fetchMe();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
