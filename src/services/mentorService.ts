import { supabase } from './supabase/client';
import { buildJitsiRoomUrl } from '../utils/jitsiHelper';

export interface MentorProfile {
  id: string;
  name: string;
  reputation: number;
  solved_count: number;
  subjects: string[];
  availability: boolean;
  status?: string; // 'available' | 'busy' | 'offline'
  distance_meters: number;
  latitude?: number;
  longitude?: number;
}

export interface BookingRequestInput {
  studentId: string;
  mentorId: string;
  subject: string;
  title: string;
  description?: string;
  callType: 'audio' | 'video' | 'meetup';
  scheduledTime: string; // ISO string
  durationMinutes?: number;
}

/**
 * Calculates distance in meters between two lat/lon coordinates (Haversine formula).
 */
export const calculateDistanceMeters = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Updates a mentor's current latitude, longitude, availability, and status string in public.profiles.
 */
export const updateMentorLocation = async (
  mentorId: string,
  lat: number,
  lon: number,
  available: boolean = true
) => {
  if (!supabase) return;

  const statusStr = available ? 'available' : 'busy';

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        latitude: lat,
        longitude: lon,
        availability: available,
        status: statusStr,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', mentorId);

    if (error) console.warn('Failed to update mentor location & status in DB:', error);
  } catch (e) {
    console.warn('Error in updateMentorLocation:', e);
  }
};

/**
 * Fetch online available mentors from public.profiles table.
 */
export const fetchNearbyMentors = async (
  studentLat: number,
  studentLon: number,
  radiusMeters: number = 50000,
  onlyAvailable: boolean = true
): Promise<MentorProfile[]> => {
  if (!supabase) return [];

  let query = supabase
    .from('profiles')
    .select('id, name, reputation, solved_count, subjects, availability, status, latitude, longitude')
    .eq('role', 'mentor');

  if (onlyAvailable) {
    query = query.eq('availability', true);
  }

  const { data: profiles, error } = await query;
  if (error || !profiles || profiles.length === 0) return [];

  return profiles
    .map((p) => {
      let dist = 850;
      if (p.latitude != null && p.longitude != null && studentLat && studentLon) {
        dist = calculateDistanceMeters(studentLat, studentLon, p.latitude, p.longitude);
      }
      return {
        id: p.id,
        name: p.name || 'Peer Mentor',
        reputation: Number(p.reputation) || 4.9,
        solved_count: p.solved_count || 24,
        subjects: p.subjects && p.subjects.length > 0 ? p.subjects : ['Mathematics', 'Physics'],
        availability: p.availability ?? true,
        status: p.status || (p.availability ? 'available' : 'offline'),
        distance_meters: dist,
        latitude: p.latitude,
        longitude: p.longitude,
      };
    })
    .sort((a, b) => a.distance_meters - b.distance_meters);
};

/**
 * Create a real doubt question & audio_session call booking request in Supabase.
 */
export const createBookingRequest = async (input: BookingRequestInput) => {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: question, error: questionError } = await supabase
    .from('questions')
    .insert({
      student_id: input.studentId,
      mentor_id: input.mentorId,
      subject: input.subject,
      title: input.title,
      description: input.description || `Booking request for ${input.subject}`,
      status: 'waiting',
    })
    .select()
    .single();

  if (questionError) throw questionError;

  let session = null;
  if (input.callType === 'video' || input.callType === 'audio') {
    const generatedRoomUrl = buildJitsiRoomUrl(question.id, {
      startWithVideo: input.callType === 'video',
      displayName: 'PeerLink Call',
    });

    const { data: sessionData, error: sessionError } = await supabase
      .from('audio_sessions')
      .insert({
        question_id: question.id,
        mentor_id: input.mentorId,
        student_id: input.studentId,
        start_time: input.scheduledTime,
        duration_minutes: input.durationMinutes || 5,
        call_type: input.callType,
        status: 'scheduled',
        room_url: generatedRoomUrl,
      })
      .select()
      .single();

    if (sessionError) console.warn('Error inserting audio_session:', sessionError);
    session = sessionData;
  }

  return { question, session };
};
