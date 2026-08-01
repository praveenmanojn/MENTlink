-- ============================================================
-- SQL Migration: Enable Full Profiles Access for Admin & Sync Missing Profiles
-- Run this in Supabase SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 3. Drop existing profiles policies
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;

-- 4. Allow all authenticated users to read all profiles (needed so students see mentors & admins see all users)
CREATE POLICY "profiles_select_all"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

-- 5. Allow users to insert their own profile
CREATE POLICY "profiles_insert_all"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Allow users to update their own profile, OR admin to update any profile
CREATE POLICY "profiles_update_all"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 7. Allow admins to delete any profile
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 8. Sync missing profiles for all registered auth.users
INSERT INTO public.profiles (id, email, name, role, availability, is_verified)
SELECT
  u.id,
  u.email,
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''), split_part(u.email, '@', 1), 'User'),
  CASE
    WHEN LOWER(u.raw_user_meta_data->>'role') = 'mentor' THEN 'mentor'::public.user_role
    WHEN LOWER(u.raw_user_meta_data->>'role') = 'admin'  THEN 'admin'::public.user_role
    ELSE 'student'::public.user_role
  END,
  true,
  true
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 9. Enable Realtime on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
