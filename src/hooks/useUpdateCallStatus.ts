import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { CallStatus, CallSession } from '../types/call';

interface UpdateCallStatusInput {
  sessionId: string;
  status: CallStatus;
  questionId?: string;
}

/**
 * Hook to update the status of a call session ('ongoing', 'completed', 'cancelled').
 */
export const useUpdateCallStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<CallSession, Error, UpdateCallStatusInput>({
    mutationFn: async ({ sessionId, status }: UpdateCallStatusInput) => {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data, error } = await supabase
        .from('audio_sessions')
        .update({ status })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data as CallSession;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['call_session', variables.sessionId] });
      if (variables.questionId) {
        queryClient.invalidateQueries({ queryKey: ['call_sessions', variables.questionId] });
      }
    },
  });
};
