import { create } from 'zustand';

export interface UpcomingSession {
  id: string;
  studentName: string;
  subject: string;
  time: string;
  callType?: 'audio' | 'video' | 'meetup';
  startTimeMs?: number;
}

interface MentorState {
  upcomingSessions: UpcomingSession[];
  addSession: (session: UpcomingSession) => void;
  removeSession: (id: string) => void;
  clearSessions: () => void;
}

export const useMentorStore = create<MentorState>((set) => ({
  upcomingSessions: [
    {
      id: 'session-101',
      studentName: 'Praveen M.',
      subject: 'Mathematics',
      time: 'In 5 mins',
      callType: 'video',
      startTimeMs: Date.now() + 5 * 60 * 1000,
    },
  ],

  addSession: (newSession) =>
    set((state) => ({
      upcomingSessions: [newSession, ...state.upcomingSessions],
    })),

  removeSession: (id) =>
    set((state) => ({
      upcomingSessions: state.upcomingSessions.filter((s) => s.id !== id),
    })),

  clearSessions: () => set({ upcomingSessions: [] }),
}));
