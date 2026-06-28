-- Players table for darts-wien
-- Run this after 0002_seasons.sql

CREATE TABLE IF NOT EXISTS public.players (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT         NOT NULL UNIQUE,
  slug       TEXT         NOT NULL UNIQUE
                          GENERATED ALWAYS AS (lower(replace(name, ' ', '-'))) STORED,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read players"
  ON public.players FOR SELECT USING (true);

CREATE POLICY "Organizers can insert players"
  ON public.players FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update players"
  ON public.players FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete players"
  ON public.players FOR DELETE USING (auth.role() = 'authenticated');
