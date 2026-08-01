-- Migration: Add call_type enum and column to public.audio_sessions

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_type') THEN
        CREATE TYPE public.call_type AS ENUM ('audio', 'video');
    END IF;
END $$;

ALTER TABLE public.audio_sessions 
ADD COLUMN IF NOT EXISTS call_type public.call_type NOT NULL DEFAULT 'audio'::public.call_type;
