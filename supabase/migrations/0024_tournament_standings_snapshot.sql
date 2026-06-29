-- Tournament standings snapshot table.
-- Captures the season standings for registered players at the moment the
-- admin generates groups. Stored for reproducibility so later match results
-- do not silently re-rank the generation.
-- Run this after 0023_tournament_format.sql

CREATE TABLE IF NOT EXISTS public.tournament_standings_snapshot (
  tournament_id  BIGINT   NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id      BIGINT   NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  rank           SMALLINT NOT NULL CHECK (rank >= 1),
  points         INTEGER  NOT NULL DEFAULT 0,
  leg_diff       INTEGER  NOT NULL DEFAULT 0,
  legs_won       INTEGER  NOT NULL DEFAULT 0,
  legs_lost      INTEGER  NOT NULL DEFAULT 0,
  one80s         INTEGER  NOT NULL DEFAULT 0,
  PRIMARY KEY (tournament_id, player_id)
);

ALTER TABLE public.tournament_standings_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament_standings_snapshot"
  ON public.tournament_standings_snapshot FOR SELECT USING (true);

CREATE POLICY "Admins can insert tournament_standings_snapshot"
  ON public.tournament_standings_snapshot FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tournament_standings_snapshot"
  ON public.tournament_standings_snapshot FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
