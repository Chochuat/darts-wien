-- Tournament Groups table for darts-wien
-- Run this after 0006_tournament_registrations.sql

CREATE TABLE IF NOT EXISTS public.tournament_groups (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tournament_id BIGINT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  label         TEXT   NOT NULL CHECK (label IN ('A', 'B', 'C', 'D')),
  UNIQUE(tournament_id, label)
);

ALTER TABLE public.tournament_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament_groups"
  ON public.tournament_groups FOR SELECT USING (true);

CREATE POLICY "Organizers can insert tournament_groups"
  ON public.tournament_groups FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update tournament_groups"
  ON public.tournament_groups FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete tournament_groups"
  ON public.tournament_groups FOR DELETE USING (auth.role() = 'authenticated');
