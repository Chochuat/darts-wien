-- Tournament Group Players table for darts-wien
-- Run this after 0007_tournament_groups.sql

CREATE TABLE IF NOT EXISTS public.tournament_group_players (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id  BIGINT NOT NULL REFERENCES public.tournament_groups(id) ON DELETE CASCADE,
  player_id BIGINT NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  UNIQUE(group_id, player_id)
);

ALTER TABLE public.tournament_group_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament_group_players"
  ON public.tournament_group_players FOR SELECT USING (true);

CREATE POLICY "Organizers can insert tournament_group_players"
  ON public.tournament_group_players FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update tournament_group_players"
  ON public.tournament_group_players FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete tournament_group_players"
  ON public.tournament_group_players FOR DELETE USING (auth.role() = 'authenticated');
