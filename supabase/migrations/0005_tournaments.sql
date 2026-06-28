-- Tournaments table for darts-wien
-- Run this after 0004_season_players.sql

CREATE TABLE IF NOT EXISTS public.tournaments (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  season_id           BIGINT   NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  week_number         SMALLINT NOT NULL CHECK (week_number BETWEEN 1 AND 16),
  date                DATE     NOT NULL,
  type                TEXT     NOT NULL DEFAULT 'regular'
                                CHECK (type IN ('regular', 'grand_final')),
  status              TEXT     NOT NULL DEFAULT 'registration'
                                CHECK (status IN ('registration', 'ready', 'in_progress', 'completed')),
  generation_type     TEXT,
  num_groups          SMALLINT CHECK (num_groups BETWEEN 2 AND 4),
  winner_player_id    BIGINT   REFERENCES public.players(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(season_id, week_number)
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournaments"
  ON public.tournaments FOR SELECT USING (true);

CREATE POLICY "Organizers can insert tournaments"
  ON public.tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update tournaments"
  ON public.tournaments FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete tournaments"
  ON public.tournaments FOR DELETE USING (auth.role() = 'authenticated');
