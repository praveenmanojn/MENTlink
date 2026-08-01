-- ============================================================
-- Migration: Scheduled Sessions / Meetings Table
-- Run this in Supabase SQL Editor -> New Query -> Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scheduled_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  jitsi_room_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.scheduled_sessions ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_sessions TO authenticated;

-- Drop existing policies if any
DROP POLICY IF EXISTS "scheduled_sessions_select_policy" ON public.scheduled_sessions;
DROP POLICY IF EXISTS "scheduled_sessions_insert_policy" ON public.scheduled_sessions;
DROP POLICY IF EXISTS "scheduled_sessions_update_policy" ON public.scheduled_sessions;

-- SELECT: Student, Mentor, or Admin
CREATE POLICY "scheduled_sessions_select_policy"
  ON public.scheduled_sessions FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- INSERT: Student or Mentor
CREATE POLICY "scheduled_sessions_insert_policy"
  ON public.scheduled_sessions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- UPDATE: Student, Mentor, or Admin
CREATE POLICY "scheduled_sessions_update_policy"
  ON public.scheduled_sessions FOR UPDATE TO authenticated
  USING (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'scheduled_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_sessions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
