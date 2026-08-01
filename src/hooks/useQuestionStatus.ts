import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';

export interface QuestionData {
  id: string;
  student_id: string;
  mentor_id: string | null;
  subject: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: 'waiting' | 'accepted' | 'solved' | 'cancelled';
  created_at: string;
  updated_at: string;
  mentor_profile?: {
    name: string;
    email: string;
    availability?: boolean;
    status?: string;
  } | null;
  student_profile?: {
    name: string;
    email: string;
  } | null;
}

/**
 * Custom hook to fetch and subscribe in real-time to a question's status & details.
 * Uses TanStack Query for cache and Supabase Realtime for zero-polling updates.
 */
export const useQuestionStatus = (questionId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: question, isLoading, error } = useQuery<QuestionData | null, Error>({
    queryKey: ['question_status', questionId],
    queryFn: async () => {
      if (!questionId || !supabase) return null;

      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          mentor_profile:profiles!questions_mentor_id_fkey(name, email, availability, status),
          student_profile:profiles!questions_student_id_fkey(name, email)
        `)
        .eq('id', questionId)
        .maybeSingle();

      if (error) {
        // Fallback without explicit join if relation alias differs
        const { data: fallbackData } = await supabase
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .maybeSingle();

        return (fallbackData as QuestionData) || null;
      }

      return (data as QuestionData) || null;
    },
    enabled: !!questionId,
  });

  useEffect(() => {
    if (!questionId || !supabase) return;

    const channel = supabase
      .channel(`question_status_${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `id=eq.${questionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['question_status', questionId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, queryClient]);

  return { question, isLoading, error };
};
