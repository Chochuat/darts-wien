-- Seasons table for darts-wien
-- Run this after 0001_game_throw.sql

CREATE TABLE IF NOT EXISTS public.seasons (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT         NOT NULL,
  start_date DATE         NOT NULL,
  end_date   DATE         NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read seasons"
  ON public.seasons FOR SELECT USING (true);

CREATE POLICY "Organizers can insert seasons"
  ON public.seasons FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update seasons"
  ON public.seasons FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete seasons"
  ON public.seasons FOR DELETE USING (auth.role() = 'authenticated');
