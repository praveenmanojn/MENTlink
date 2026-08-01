-- ============================================================
-- FIX: Complete Jitsi Call & Chat Flow Setup
-- Run this in Supabase SQL Editor → New Query → Run
-- ============================================================

-- ── STEP 1: Ensure room_url column exists on audio_sessions ──
ALTER TABLE public.audio_sessions ADD COLUMN IF NOT EXISTS room_url TEXT;
ALTER TABLE public.audio_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- ── STEP 2: Enable Realtime for all key tables ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'questions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.questions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'chats') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'audio_sessions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audio_sessions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- ── STEP 3: Fix audio_sessions RLS (both student AND mentor can create/update sessions) ──
GRANT SELECT, INSERT, UPDATE ON public.audio_sessions TO authenticated;

DROP POLICY IF EXISTS "Mentors can create audio sessions" ON public.audio_sessions;
DROP POLICY IF EXISTS "Participants or admins can view audio sessions" ON public.audio_sessions;
DROP POLICY IF EXISTS "Participants can update audio sessions" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_sessions_select_policy" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_sessions_insert_policy" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_sessions_update_policy" ON public.audio_sessions;

ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone in the session can view it
CREATE POLICY "audio_sessions_select_policy"
  ON public.audio_sessions FOR SELECT TO authenticated
  USING (
    auth.uid() = student_id OR auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- INSERT: BOTH student and mentor can initiate call sessions
CREATE POLICY "audio_sessions_insert_policy"
  ON public.audio_sessions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id OR auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- UPDATE: Both can update session status (ongoing → completed)
CREATE POLICY "audio_sessions_update_policy"
  ON public.audio_sessions FOR UPDATE TO authenticated
  USING (
    auth.uid() = student_id OR auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ── STEP 4: Fix chats RLS (student & mentor can read+write) ──
GRANT SELECT, INSERT ON public.chats TO authenticated;

DROP POLICY IF EXISTS "chats_select_policy" ON public.chats;
DROP POLICY IF EXISTS "chats_insert_policy" ON public.chats;
DROP POLICY IF EXISTS "Participants or admins can view chats" ON public.chats;
DROP POLICY IF EXISTS "Participants can insert chats" ON public.chats;

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read chats (needed for Realtime WebSocket)
CREATE POLICY "chats_select_policy"
  ON public.chats FOR SELECT TO authenticated
  USING (true);

-- Only participants (student or mentor on that question) can write
CREATE POLICY "chats_insert_policy"
  ON public.chats FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = chats.question_id
      AND (q.student_id = auth.uid() OR q.mentor_id = auth.uid())
    )
  );

-- ── STEP 5: Fix questions UPDATE RLS (mentor can accept: set mentor_id + status) ──
DROP POLICY IF EXISTS "questions_update_policy" ON public.questions;
DROP POLICY IF EXISTS "Mentors can update questions" ON public.questions;
DROP POLICY IF EXISTS "Students can update own questions" ON public.questions;

CREATE POLICY "questions_update_policy"
  ON public.questions FOR UPDATE TO authenticated
  USING (
    auth.uid() = student_id OR
    (mentor_id IS NULL AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'mentor'
    )) OR
    auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'mentor') OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Reload schema
NOTIFY pgrst, 'reload schema';
