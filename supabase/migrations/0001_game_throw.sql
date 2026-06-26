-- Game Throw table for darts-wien leaderboard
-- Run this in the Supabase SQL Editor after creating your project

-- Table definition
CREATE TABLE IF NOT EXISTS public.game_throw (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT         NOT NULL,
  throw       INTEGER      NOT NULL CHECK (throw >= 0),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Index for fast top-N queries (ordered by score desc, then earliest first)
CREATE INDEX IF NOT EXISTS game_throw_throw_created_at_idx
  ON public.game_throw (throw DESC, created_at ASC);

-- Row Level Security: allow anon to read and insert
ALTER TABLE public.game_throw ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read (public leaderboard)
CREATE POLICY "Anyone can read game throws"
  ON public.game_throw
  FOR SELECT
  USING (true);

-- Policy: anyone can insert a throw (anon submissions for the pub game)
CREATE POLICY "Anyone can insert game throws"
  ON public.game_throw
  FOR INSERT
  WITH CHECK (true);