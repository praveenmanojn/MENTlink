-- ============================================================
-- Migration: System Settings Table for Maintenance Mode
-- Run this in Supabase SQL Editor -> New Query -> Run
-- ============================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_settings TO authenticated, anon;

-- Drop existing policies if any
DROP POLICY IF EXISTS "system_settings_select_policy" ON public.system_settings;
DROP POLICY IF EXISTS "system_settings_all_policy" ON public.system_settings;

-- SELECT: Public / Authenticated read access
CREATE POLICY "system_settings_select_policy"
  ON public.system_settings FOR SELECT
  TO authenticated, anon
  USING (true);

-- INSERT/UPDATE/DELETE: Anyone authenticated can modify (or admin)
CREATE POLICY "system_settings_all_policy"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default maintenance mode = false
INSERT INTO public.system_settings (key, value)
VALUES ('maintenance_mode', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'system_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
  END IF;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

NOTIFY pgrst, 'reload schema';
