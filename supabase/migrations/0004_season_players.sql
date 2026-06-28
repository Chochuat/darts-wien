-- Season-Players join table for darts-wien
-- Run this after 0003_players.sql

CREATE TABLE IF NOT EXISTS public.season_players (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  season_id  BIGINT NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  player_id  BIGINT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  UNIQUE(season_id, player_id)
);

ALTER TABLE public.season_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read season_players"
  ON public.season_players FOR SELECT USING (true);

CREATE POLICY "Organizers can insert season_players"
  ON public.season_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update season_players"
  ON public.season_players FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete season_players"
  ON public.season_players FOR DELETE USING (auth.role() = 'authenticated');
