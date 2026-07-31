import { create } from 'zustand';

type AuthState = {
  user: null | { id: string; email: string; role: string };
  isAuthenticated: boolean;
  login: (userData: { id: string; email: string; role: string }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
