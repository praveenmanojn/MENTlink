import { create } from 'zustand';

type ThemeState = {
  isDark: boolean;
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: true,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
}));