-- ============================================================================
-- Migration: Add status to profiles & call details (room_url, updated_at) to audio_sessions
-- ============================================================================

-- 1. Add status column to profiles table ('available', 'busy', 'offline')
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- 2. Add room_url and updated_at columns to audio_sessions table
ALTER TABLE public.audio_sessions
ADD COLUMN IF NOT EXISTS room_url TEXT;

ALTER TABLE public.audio_sessions
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 3. Notify real-time listeners of schema updates
NOTIFY pgrst, 'reload schema';
