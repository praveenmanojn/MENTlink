-- ============================================================================
-- PeerLink Complete Database Initialization Script for Supabase
-- ============================================================================

-- 0. CLEANUP (Safe execution for brand new or existing projects)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.post_meetup_to_chat() CASCADE;
DROP FUNCTION IF EXISTS public.post_meetup_status_update() CASCADE;
DROP FUNCTION IF EXISTS public.get_mentors_nearby(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) CASCADE;
DROP FUNCTION IF EXISTS public.haversine_distance(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) CASCADE;

-- Dropping tables with CASCADE automatically drops all triggers attached to them
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.meetups CASCADE;
DROP TABLE IF EXISTS public.audio_sessions CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.call_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.question_status CASCADE;
DROP TYPE IF EXISTS public.session_status CASCADE;
DROP TYPE IF EXISTS public.meetup_status CASCADE;

-- 1. ENUM TYPES
CREATE TYPE public.call_type AS ENUM ('audio', 'video');
CREATE TYPE public.user_role AS ENUM ('student', 'mentor', 'admin');
CREATE TYPE public.question_status AS ENUM ('waiting', 'accepted', 'solved', 'cancelled');
CREATE TYPE public.session_status AS ENUM ('scheduled', 'ongoing', 'completed', 'cancelled');
CREATE TYPE public.meetup_status AS ENUM ('scheduled', 'completed', 'cancelled');

-- 2. TABLES

-- PROFILES TABLE
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role public.user_role NOT NULL DEFAULT 'student'::public.user_role,
    subjects TEXT[] DEFAULT '{}',
    reputation NUMERIC(4,2) DEFAULT 0.00,
    solved_count INT DEFAULT 0,
    avg_response_minutes NUMERIC DEFAULT 0,
    acceptance_rate NUMERIC DEFAULT 0,
    availability BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'available',
    is_verified BOOLEAN DEFAULT false,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- QUESTIONS TABLE
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status public.question_status NOT NULL DEFAULT 'waiting'::public.question_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CHATS TABLE
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AUDIO SESSIONS TABLE
CREATE TABLE public.audio_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 5,
    call_type public.call_type NOT NULL DEFAULT 'audio'::public.call_type,
    status public.session_status NOT NULL DEFAULT 'scheduled'::public.session_status,
    room_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- MEETUPS TABLE
CREATE TABLE public.meetups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status public.meetup_status NOT NULL DEFAULT 'scheduled'::public.meetup_status,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RATINGS TABLE
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID UNIQUE NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stars INT CHECK (stars BETWEEN 1 AND 5) NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. AUTOMATED HELPER FUNCTIONS & TRIGGERS

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER trg_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER trg_meetups_updated_at BEFORE UPDATE ON public.meetups FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Auto-create profile on signup trigger
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

  BEGIN
    INSERT INTO public.profiles (id, email, name, role, reputation, solved_count, availability, is_verified)
    VALUES (NEW.id, NEW.email, extracted_name, extracted_role, 0.00, 0, false, false)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger warning: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Post meetup to chat on creation
CREATE OR REPLACE FUNCTION public.post_meetup_to_chat()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.chats (question_id, sender_id, message)
  VALUES (NEW.question_id, NEW.student_id, '📅 Meetup scheduled at ' || NEW.location_name || ' for ' || to_char(NEW.scheduled_time, 'Mon DD, YYYY HH:MI AM'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_meetup_posted_to_chat AFTER INSERT ON public.meetups FOR EACH ROW EXECUTE PROCEDURE public.post_meetup_to_chat();

-- Post meetup status update on change
CREATE OR REPLACE FUNCTION public.post_meetup_status_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed'::public.meetup_status AND OLD.status != 'completed'::public.meetup_status THEN
    NEW.completed_at := timezone('utc'::text, now());
    INSERT INTO public.chats (question_id, sender_id, message) VALUES (NEW.question_id, NEW.mentor_id, '✅ Meetup marked as completed.');
  ELSIF NEW.status = 'cancelled'::public.meetup_status AND OLD.status != 'cancelled'::public.meetup_status THEN
    INSERT INTO public.chats (question_id, sender_id, message) VALUES (NEW.question_id, NEW.mentor_id, '❌ Meetup was cancelled.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_meetup_status_update BEFORE UPDATE ON public.meetups FOR EACH ROW EXECUTE PROCEDURE public.post_meetup_status_update();

-- 4. UTILITY & RPC FUNCTIONS

CREATE OR REPLACE FUNCTION public.haversine_distance(lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION, lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    R DOUBLE PRECISION := 6371000;
    phi1 DOUBLE PRECISION := radians(lat1);
    phi2 DOUBLE PRECISION := radians(lat2);
    delta_phi DOUBLE PRECISION := radians(lat2 - lat1);
    delta_lambda DOUBLE PRECISION := radians(lon2 - lon1);
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN RETURN 9999999; END IF;
    a := sin(delta_phi / 2.0) * sin(delta_phi / 2.0) + cos(phi1) * cos(phi2) * sin(delta_lambda / 2.0) * sin(delta_lambda / 2.0);
    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.get_mentors_nearby(student_lat DOUBLE PRECISION, student_lon DOUBLE PRECISION, radius_meters DOUBLE PRECISION DEFAULT 10000)
RETURNS TABLE (id UUID, name TEXT, reputation NUMERIC, solved_count INT, subjects TEXT[], availability BOOLEAN, distance_meters DOUBLE PRECISION)
LANGUAGE sql STABLE AS $$
  SELECT p.id, p.name, p.reputation, p.solved_count, p.subjects, p.availability, public.haversine_distance(student_lat, student_lon, p.latitude, p.longitude) AS distance_meters
  FROM public.profiles p
  WHERE p.role = 'mentor'::public.user_role AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND public.haversine_distance(student_lat, student_lon, p.latitude, p.longitude) <= radius_meters
  ORDER BY distance_meters ASC;
$$;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile or admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Questions viewable by authenticated users" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can create questions" ON public.questions FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants or admins can update questions" ON public.questions FOR UPDATE TO authenticated USING (auth.uid() = student_id OR auth.uid() = mentor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "Participants or admins can view chats" ON public.chats FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.questions q WHERE q.id = chats.question_id AND (q.student_id = auth.uid() OR q.mentor_id = auth.uid())) OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Participants can insert chats" ON public.chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.questions q WHERE q.id = chats.question_id AND (q.student_id = auth.uid() OR q.mentor_id = auth.uid())));

CREATE POLICY "Participants or admins can view audio sessions" ON public.audio_sessions FOR SELECT TO authenticated USING (auth.uid() = student_id OR auth.uid() = mentor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Mentors can create audio sessions" ON public.audio_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = mentor_id);
CREATE POLICY "Participants can update audio sessions" ON public.audio_sessions FOR UPDATE TO authenticated USING (auth.uid() = student_id OR auth.uid() = mentor_id);

CREATE POLICY "Participants or admins can view meetups" ON public.meetups FOR SELECT TO authenticated USING (auth.uid() = student_id OR auth.uid() = mentor_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::public.user_role);
CREATE POLICY "Participants can create meetups" ON public.meetups FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id OR auth.uid() = mentor_id);
CREATE POLICY "Participants can update meetups" ON public.meetups FOR UPDATE TO authenticated USING (auth.uid() = student_id OR auth.uid() = mentor_id);

CREATE POLICY "Ratings viewable by authenticated users" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can insert rating for their question" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 6. DUMMY SEED DATA
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;

INSERT INTO public.profiles (id, email, name, role, subjects, reputation, solved_count, avg_response_minutes, acceptance_rate, availability, is_verified, latitude, longitude)
VALUES
  (gen_random_uuid(), 'rahul@peerlink.dev', 'Rahul Sharma', 'mentor'::public.user_role, ARRAY['Mathematics', 'Physics'], 4.90, 266, 3.5, 98.0, true, true, 11.0168, 76.9558),
  (gen_random_uuid(), 'ananya@peerlink.dev', 'Ananya R.', 'mentor'::public.user_role, ARRAY['Chemistry', 'Biology'], 4.80, 201, 5.0, 95.0, true, true, 11.0200, 76.9600),
  (gen_random_uuid(), 'karthik@peerlink.dev', 'Karthik M.', 'mentor'::public.user_role, ARRAY['Computer Science', 'Maths'], 4.70, 156, 8.0, 91.0, false, true, 11.0100, 76.9500),
  (gen_random_uuid(), 'priya@peerlink.dev', 'Priya S.', 'mentor'::public.user_role, ARRAY['Physics', 'Chemistry'], 4.60, 132, 4.0, 94.0, true, true, 11.0250, 76.9700)
ON CONFLICT (email) DO NOTHING;
