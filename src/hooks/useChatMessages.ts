import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';

export interface ChatRow {
  id: string;
  question_id: string;
  sender_id: string;
  message: string | null;
  image_url: string | null;
  created_at: string;
  sender_profile?: {
    name: string;
    email: string;
  } | null;
}

/**
 * Custom hook to fetch and subscribe in real-time to chat messages for a question.
 * Appends new messages via Supabase Realtime (postgres_changes INSERT) into TanStack Query cache.
 */
export const useChatMessages = (questionId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, error } = useQuery<ChatRow[], Error>({
    queryKey: ['chat_messages', questionId],
    queryFn: async () => {
      if (!questionId || !supabase) return [];

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          sender_profile:profiles!chats_sender_id_fkey(name, email)
        `)
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (error) {
        // Fallback without explicit join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('chats')
          .select('*')
          .eq('question_id', questionId)
          .order('created_at', { ascending: true });

        if (fallbackError) throw fallbackError;
        return (fallbackData as ChatRow[]) || [];
      }

      return (data as ChatRow[]) || [];
    },
    enabled: !!questionId,
  });

  useEffect(() => {
    if (!questionId || !supabase) return;

    const channel = supabase
      .channel(`chat_messages_${questionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chats',
          filter: `question_id=eq.${questionId}`,
        },
        (payload) => {
          const newRow = payload.new as ChatRow;

          queryClient.setQueryData<ChatRow[]>(['chat_messages', questionId], (oldData = []) => {
            if (oldData.some((msg) => msg.id === newRow.id)) return oldData;
            return [...oldData, newRow];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId, queryClient]);

  // Send message helper
  const sendMessage = async (senderId: string, text: string, imageUrl?: string | null) => {
    if (!questionId || !supabase) return null;

    const { data, error } = await supabase
      .from('chats')
      .insert({
        question_id: questionId,
        sender_id: senderId,
        message: text.trim() || null,
        image_url: imageUrl || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChatRow;
  };

  return { messages, isLoading, error, sendMessage };
};
