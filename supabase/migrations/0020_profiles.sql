-- Profiles table for darts-wien administration
-- Links Supabase auth users to a role and (optionally) a player.
-- Run this after 0010_tournament_final_standings.sql

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id      UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT         NOT NULL DEFAULT 'pending'
                            CHECK (role IN ('pending', 'scorekeeper', 'admin')),
  player_id    BIGINT       REFERENCES public.players(id) ON DELETE SET NULL,
  display_name TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE(player_id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- A user can read their own profile.
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all profiles.
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- A user can insert their own profile (on signup). Role defaults to 'pending'.
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'pending');

-- Admins can update any profile (promote/demote, link player_id).
-- Users cannot self-promote.
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can delete profiles.
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
