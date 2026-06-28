-- Tournament Registrations table for darts-wien
-- Run this after 0005_tournaments.sql

CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tournament_id  BIGINT  NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id      BIGINT  NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  checked_in     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament_registrations"
  ON public.tournament_registrations FOR SELECT USING (true);

CREATE POLICY "Organizers can insert tournament_registrations"
  ON public.tournament_registrations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update tournament_registrations"
  ON public.tournament_registrations FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete tournament_registrations"
  ON public.tournament_registrations FOR DELETE USING (auth.role() = 'authenticated');
