import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { ScheduleCallInput, CallSession } from '../types/call';
import { scheduleCallNotification } from '../services/notifications/notificationService';
import { buildJitsiRoomUrl } from '../utils/jitsiHelper';

/**
 * Hook to schedule an audio or video call session.
 * Inserts a row into public.audio_sessions with status 'scheduled' and room_url.
 */
export const useScheduleCall = () => {
  const queryClient = useQueryClient();

  return useMutation<CallSession, Error, ScheduleCallInput>({
    mutationFn: async (input: ScheduleCallInput) => {
      if (!supabase) throw new Error('Supabase client not initialized');

      const tempId = `sess-${Date.now()}`;
      const generatedRoomUrl = input.room_url || buildJitsiRoomUrl(tempId, {
        startWithVideo: input.call_type === 'video',
        displayName: 'PeerLink Call',
      });

      const { data, error } = await supabase
        .from('audio_sessions')
        .insert({
          question_id: input.question_id,
          mentor_id: input.mentor_id,
          student_id: input.student_id,
          start_time: input.start_time,
          duration_minutes: input.duration_minutes,
          call_type: input.call_type,
          status: 'scheduled',
          room_url: generatedRoomUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule local push notification reminder 1 minute before call start time
      const startDate = new Date(input.start_time);
      const reminderDate = new Date(startDate.getTime() - 60000);
      if (reminderDate.getTime() > Date.now()) {
        scheduleCallNotification(
          'Upcoming Call Reminder',
          `Your ${input.call_type} session is scheduled to start in 1 minute!`,
          reminderDate
        );
      }

      // Also post a message to chats table with the Jitsi room link
      try {
        await supabase.from('chats').insert({
          question_id: input.question_id,
          sender_id: input.mentor_id,
          message: `📅 Scheduled a ${input.call_type} call for ${new Date(input.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nJitsi Room Link: ${generatedRoomUrl}`,
        });
      } catch (chatErr) {
        console.warn('Failed to post scheduled call chat message:', chatErr);
      }

      return data as CallSession;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['call_sessions', variables.question_id] });
      queryClient.invalidateQueries({ queryKey: ['chats', variables.question_id] });
    },
  });
};
