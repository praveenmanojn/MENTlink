import { create } from 'zustand';

type UserState = {
  profile: null | { id: string; name: string; email: string; role: string };
};

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));