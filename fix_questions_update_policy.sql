-- ============================================================
-- FIX: Update RLS Policy on public.questions
-- "question was already accepted by another mentor" error fix
--
-- Why it failed: The previous UPDATE policy required auth.uid() = mentor_id,
-- but before accepting, mentor_id was NULL. So RLS blocked mentors from claiming it!
--
-- Copy ALL → Supabase SQL Editor → Run
-- ============================================================

DROP POLICY IF EXISTS "questions_update_policy" ON public.questions;
DROP POLICY IF EXISTS "Participants or admins can update questions" ON public.questions;

CREATE POLICY "questions_update_policy"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    (status = 'waiting' AND mentor_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Ensure authenticated role has update grant
GRANT UPDATE ON public.questions TO authenticated;
