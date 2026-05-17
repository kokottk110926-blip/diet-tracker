-- Diet Tracker Schema
-- Run this entire file in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.users (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT UNIQUE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add columns if they don't exist (safe to re-run)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS height       REAL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS goal_weight  REAL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS goal_fat REAL;

CREATE TABLE IF NOT EXISTS public.records (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  weight      REAL,
  fat         REAL,
  memo        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT records_user_date_unique UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS records_user_id_idx ON public.records(user_id);
CREATE INDEX IF NOT EXISTS records_date_idx ON public.records(date);

-- Row Level Security — permissive (name-based login, no Supabase Auth)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_users" ON public.users
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public_records" ON public.records
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
