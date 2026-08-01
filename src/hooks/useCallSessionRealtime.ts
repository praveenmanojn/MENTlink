import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { CallSession } from '../types/call';

/**
 * Hook to fetch and subscribe to real-time changes on audio_sessions for a given questionId.
 * @param questionId UUID of the question
 */
export const useCallSessionRealtime = (questionId: string | undefined) => {
  const queryClient = useQueryClient();

  // Primary Query
  const { data: sessions = [], isLoading, error } = useQuery<CallSession[], Error>({
    queryKey: ['call_sessions', questionId],
    queryFn: async () => {
      if (!questionId) return [];
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('audio_sessions')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as CallSession[]) || [];
    },
    enabled: !!questionId,
  });

  // Realtime Postgres Changes Subscription
  useEffect(() => {
    if (!questionId || !supabase) return;

    const channel = supabase
      .channel(`audio_sessions_realtime_${questionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'audio_sessions',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          // Re-fetch / invalidate queries when a call session is inserted or updated
          queryClient.invalidateQueries({ queryKey: ['call_sessions', questionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, queryClient]);

  return { sessions, isLoading, error };
};
