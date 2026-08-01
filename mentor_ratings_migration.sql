-- ============================================================
-- Migration: Mentor Ratings Table
-- Run this in Supabase SQL Editor -> New Query -> Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mentor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  -- Prevent duplicate ratings per question
  UNIQUE (student_id, question_id)
);

-- RLS
ALTER TABLE public.mentor_ratings ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_ratings TO authenticated;

-- Drop existing policies if any
DROP POLICY IF EXISTS "mentor_ratings_select_policy" ON public.mentor_ratings;
DROP POLICY IF EXISTS "mentor_ratings_insert_policy" ON public.mentor_ratings;
DROP POLICY IF EXISTS "mentor_ratings_update_policy" ON public.mentor_ratings;

-- SELECT: Both mentor and student can read their own ratings
CREATE POLICY "mentor_ratings_select_policy"
  ON public.mentor_ratings FOR SELECT TO authenticated
  USING (
    auth.uid() = mentor_id OR
    auth.uid() = student_id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- INSERT: Only students can insert ratings
CREATE POLICY "mentor_ratings_insert_policy"
  ON public.mentor_ratings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
  );

-- UPDATE: Only the student who created it can update
CREATE POLICY "mentor_ratings_update_policy"
  ON public.mentor_ratings FOR UPDATE TO authenticated
  USING (auth.uid() = student_id);

NOTIFY pgrst, 'reload schema';
