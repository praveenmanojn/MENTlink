/**
 * Call Types & Interfaces — PeerLink
 */

export type CallType = 'audio' | 'video';

export type CallStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';

export interface CallSession {
  id: string;
  question_id: string;
  mentor_id: string;
  student_id: string;
  start_time: string; // timestamptz ISO string
  duration_minutes: number;
  call_type: CallType;
  status: CallStatus;
  room_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface ScheduleCallInput {
  question_id: string;
  mentor_id: string;
  student_id: string;
  start_time: string;
  duration_minutes: number;
  call_type: CallType;
  room_url?: string;
}
