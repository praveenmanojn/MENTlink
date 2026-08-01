import { create } from 'zustand';
import { supabase } from '../services/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  session: Session | null;
  role: 'student' | 'mentor' | 'admin' | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  isAuthenticated: false,

  initialize: async () => {
    if (!supabase) return;
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    let userRole: 'student' | 'mentor' | 'admin' = (session?.user?.user_metadata?.role as any) || 'student';

    if (session?.user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          userRole = profile.role as 'student' | 'mentor' | 'admin';
        }
      } catch (e) {
        console.warn('Error fetching user profile role:', e);
      }
    }

    set({ 
      session, 
      user: session?.user || null, 
      role: session ? userRole : null,
      isAuthenticated: !!session 
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      let newRole: 'student' | 'mentor' | 'admin' = (newSession?.user?.user_metadata?.role as any) || 'student';

      if (newSession?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', newSession.user.id)
            .single();

          if (profile?.role) {
            newRole = profile.role as 'student' | 'mentor' | 'admin';
          }
        } catch (e) {
          console.warn('Error fetching user profile role on auth change:', e);
        }
      }

      set({ 
        session: newSession, 
        user: newSession?.user || null,
        role: newSession ? newRole : null,
        isAuthenticated: !!newSession 
      });
    });
  },

  setSession: async (session) => {
    let userRole: 'student' | 'mentor' | 'admin' = (session?.user?.user_metadata?.role as any) || 'student';

    if (session?.user && supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          userRole = profile.role as 'student' | 'mentor' | 'admin';
        }
      } catch (e) {
        console.warn('Error fetching user profile role in setSession:', e);
      }
    }

    set({ 
      session, 
      user: session?.user || null, 
      role: session ? userRole : null,
      isAuthenticated: !!session 
    });
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ user: null, session: null, role: null, isAuthenticated: false });
  },
}));
