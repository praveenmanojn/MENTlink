-- ============================================================
-- SQL: Enable Supabase Realtime WebSocket & Fix Chats RLS
-- Run this in Supabase SQL Editor → New Query → Run
-- ============================================================

-- 1. Enable Realtime WebSocket for all live chat and status tables
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
  WHEN OTHERS THEN
    -- If publication doesn't exist or permissions vary
    NULL;
END $$;

-- 2. Clean RLS policies for chats to ensure student and mentor receive WebSocket events
DROP POLICY IF EXISTS "chats_select_policy" ON public.chats;
DROP POLICY IF EXISTS "chats_insert_policy" ON public.chats;
DROP POLICY IF EXISTS "Participants or admins can view chats" ON public.chats;
DROP POLICY IF EXISTS "Participants can insert chats" ON public.chats;

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chats_select_policy"
  ON public.chats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "chats_insert_policy"
  ON public.chats FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.questions q
      WHERE q.id = chats.question_id
      AND (q.student_id = auth.uid() OR q.mentor_id = auth.uid() OR q.status = 'waiting')
    )
  );

GRANT SELECT, INSERT ON public.chats TO authenticated;
