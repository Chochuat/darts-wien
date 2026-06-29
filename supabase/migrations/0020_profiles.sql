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

-- SECURITY DEFINER function: returns the caller's role, bypassing RLS.
-- Needed because admin policies must check the caller's role in the same
-- table, which would cause infinite recursion if done with a sub-query.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, anon;

-- A user can read their own profile.
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all profiles.
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

-- A user can insert their own profile (on signup). Role defaults to 'pending'.
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'pending');

-- Admins can update any profile (promote/demote, link player_id).
-- Users cannot self-promote.
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- Admins can delete profiles.
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() = 'admin');
