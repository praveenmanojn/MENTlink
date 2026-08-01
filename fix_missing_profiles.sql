-- ============================================================
-- FIX: Foreign key violation on questions.student_id
-- "insert or update on table questions violates foreign key
--  constraint questions_student_id_fkey"
--
-- This happens when a student's auth.uid() has NO matching row
-- in public.profiles. Run this to auto-create missing profiles.
--
-- Copy ALL → Supabase SQL Editor → Run
-- ============================================================

-- Step 1: Insert missing profiles for all auth users who don't have one
INSERT INTO public.profiles (id, email, name, role)
SELECT
  u.id,
  u.email,
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''), split_part(u.email, '@', 1), 'User'),
  CASE
    WHEN LOWER(u.raw_user_meta_data->>'role') = 'mentor' THEN 'mentor'::public.user_role
    WHEN LOWER(u.raw_user_meta_data->>'role') = 'admin'  THEN 'admin'::public.user_role
    ELSE 'student'::public.user_role
  END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Step 2: Verify — this should return 0 rows if all profiles exist
-- SELECT u.id, u.email FROM auth.users u
-- LEFT JOIN public.profiles p ON p.id = u.id
-- WHERE p.id IS NULL;

-- ============================================================
-- Also ensure handle_new_user trigger is working for future signups
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  extracted_role public.user_role;
  extracted_name TEXT;
  raw_role TEXT;
BEGIN
  raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  IF raw_role = 'mentor' THEN
    extracted_role := 'mentor'::public.user_role;
  ELSIF raw_role = 'admin' THEN
    extracted_role := 'admin'::public.user_role;
  ELSE
    extracted_role := 'student'::public.user_role;
  END IF;

  extracted_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''), split_part(NEW.email, '@', 1), 'User');

  INSERT INTO public.profiles (id, email, name, role, reputation, solved_count, availability, is_verified)
  VALUES (NEW.id, NEW.email, extracted_name, extracted_role, 0.00, 0, false, false)
  ON CONFLICT (id) DO UPDATE
    SET name  = EXCLUDED.name,
        email = EXCLUDED.email,
        role  = EXCLUDED.role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user warning: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Re-create trigger in case it was missing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
