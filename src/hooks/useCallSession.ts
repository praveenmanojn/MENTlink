import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { CallSession } from '../types/call';

/**
 * Hook to fetch a single call session by session ID.
 * @param sessionId UUID of the audio_sessions row
 */
export const useCallSession = (sessionId: string | undefined) => {
  return useQuery<CallSession | null, Error>({
    queryKey: ['call_session', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data, error } = await supabase
        .from('audio_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data as CallSession;
    },
    enabled: !!sessionId,
  });
};
