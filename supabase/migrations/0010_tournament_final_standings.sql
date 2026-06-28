-- Tournament Final Standings table for darts-wien
-- Run this after 0009_matches.sql

CREATE TABLE IF NOT EXISTS public.tournament_final_standings (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tournament_id   BIGINT   NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id       BIGINT   NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  position        SMALLINT NOT NULL CHECK (position >= 1),
  played          SMALLINT NOT NULL DEFAULT 0,
  wins            SMALLINT NOT NULL DEFAULT 0,
  losses          SMALLINT NOT NULL DEFAULT 0,
  sets_for        SMALLINT NOT NULL DEFAULT 0,
  sets_against    SMALLINT NOT NULL DEFAULT 0,
  one80s          SMALLINT NOT NULL DEFAULT 0,
  group_points    SMALLINT NOT NULL DEFAULT 0,
  playoff_points  SMALLINT NOT NULL DEFAULT 0,
  bonus_points    SMALLINT NOT NULL DEFAULT 0,
  total_points    SMALLINT NOT NULL DEFAULT 0,
  UNIQUE(tournament_id, player_id)
);

ALTER TABLE public.tournament_final_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament_final_standings"
  ON public.tournament_final_standings FOR SELECT USING (true);

CREATE POLICY "Organizers can insert tournament_final_standings"
  ON public.tournament_final_standings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update tournament_final_standings"
  ON public.tournament_final_standings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete tournament_final_standings"
  ON public.tournament_final_standings FOR DELETE USING (auth.role() = 'authenticated');
