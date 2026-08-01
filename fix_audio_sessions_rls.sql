-- ============================================================
-- SQL: Fix audio_sessions RLS Policy (Allows both Student & Mentor to start calls)
-- "new row violates row-level security policy for table audio_sessions" error fix
--
-- Why it failed: The old policy restricted INSERT to auth.uid() = mentor_id only.
-- When a student clicked "Call", auth.uid() was student_id, triggering RLS block!
--
-- Copy ALL → Supabase SQL Editor → Run
-- ============================================================

-- 1. Table-level permissions
GRANT SELECT, INSERT, UPDATE ON public.audio_sessions TO authenticated;

-- 2. Drop existing RLS policies on audio_sessions
DROP POLICY IF EXISTS "Mentors can create audio sessions" ON public.audio_sessions;
DROP POLICY IF EXISTS "Participants or admins can view audio sessions" ON public.audio_sessions;
DROP POLICY IF EXISTS "Participants can update audio sessions" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_sessions_select_policy" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_sessions_insert_policy" ON public.audio_sessions;
DROP POLICY IF EXISTS "audio_sessions_update_policy" ON public.audio_sessions;

ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;

-- 3. SELECT Policy: Students, Mentors, and Admins can view call sessions
CREATE POLICY "audio_sessions_select_policy"
  ON public.audio_sessions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 4. INSERT Policy: BOTH Student and Mentor can initiate call sessions
CREATE POLICY "audio_sessions_insert_policy"
  ON public.audio_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. UPDATE Policy: Both Student and Mentor can update session status (e.g., ongoing/completed)
CREATE POLICY "audio_sessions_update_policy"
  ON public.audio_sessions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = student_id OR
    auth.uid() = mentor_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
