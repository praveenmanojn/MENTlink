-- ============================================================
-- FINAL FIX: Missing GRANT permissions on questions table
-- The RLS policies exist but the authenticated role needs
-- explicit table-level GRANTs to perform INSERT/SELECT/UPDATE.
--
-- Copy ALL of this → Supabase SQL Editor → Run
-- ============================================================

-- 1. Grant table-level permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON public.questions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.questions TO anon;

-- Also grant on related tables just in case
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.chats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.audio_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meetups TO authenticated;
GRANT SELECT, INSERT ON public.ratings TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- 2. Ensure sequence usage is granted (needed for UUID gen if applicable)
-- (UUID uses gen_random_uuid() so no sequence needed, but adding for safety)

-- 3. Drop and cleanly recreate RLS policies for questions
DROP POLICY IF EXISTS "Students can create questions" ON public.questions;
DROP POLICY IF EXISTS "questions_insert_policy" ON public.questions;
DROP POLICY IF EXISTS "Questions viewable by authenticated users" ON public.questions;
DROP POLICY IF EXISTS "questions_select_policy" ON public.questions;
DROP POLICY IF EXISTS "Participants or admins can update questions" ON public.questions;
DROP POLICY IF EXISTS "questions_update_policy" ON public.questions;

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "questions_select_policy"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "questions_insert_policy"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "questions_update_policy"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================
-- VERIFY with these two queries after running:
--
-- Query 1: Check grants
-- SELECT grantee, privilege_type FROM information_schema.role_table_grants
-- WHERE table_name = 'questions';
--
-- Query 2: Check RLS policies
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'questions';
-- ============================================================
