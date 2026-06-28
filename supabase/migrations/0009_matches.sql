-- Matches unified table for darts-wien
-- Run this after 0008_tournament_group_players.sql
--
-- One row per physical match (two players).
-- The app computes W/L from leg scores.
-- lifecycle: pending -> completed | no_show

CREATE TABLE IF NOT EXISTS public.matches (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  season_id             BIGINT   NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  player1_id            BIGINT   NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  player2_id            BIGINT   NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  status                TEXT     NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'completed', 'no_show')),
  legs_player1          SMALLINT CHECK (legs_player1 >= 0),
  legs_player2          SMALLINT CHECK (legs_player2 >= 0),
  legs_target           SMALLINT NOT NULL CHECK (legs_target BETWEEN 2 AND 6),
  max_throws            SMALLINT NOT NULL DEFAULT 45,
  player1_180           SMALLINT NOT NULL DEFAULT 0 CHECK (player1_180 >= 0),
  player2_180           SMALLINT NOT NULL DEFAULT 0 CHECK (player2_180 >= 0),
  no_show_player_id     BIGINT   REFERENCES public.players(id) ON DELETE SET NULL,
  match_type            TEXT     NOT NULL
                                CHECK (match_type IN ('league', 'tournament_group', 'tournament_playoff')),
  tournament_id         BIGINT   REFERENCES public.tournaments(id) ON DELETE CASCADE,
  tournament_group_id   BIGINT   REFERENCES public.tournament_groups(id) ON DELETE SET NULL,
  tournament_round_name TEXT,
  sort_order            SMALLINT CHECK (sort_order >= 0),
  match_date            DATE     NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- player1 and player2 must be different
  CHECK (player1_id <> player2_id),

  -- Structural integrity: FK/sort_order consistency per match_type
  CHECK (
    (match_type = 'league' AND tournament_id IS NULL AND tournament_group_id IS NULL AND tournament_round_name IS NULL AND sort_order IS NULL)
    OR
    (match_type = 'tournament_group' AND tournament_id IS NOT NULL AND tournament_group_id IS NOT NULL AND tournament_round_name IS NULL AND sort_order IS NULL)
    OR
    (match_type = 'tournament_playoff' AND tournament_id IS NOT NULL AND tournament_group_id IS NULL AND tournament_round_name IS NOT NULL AND sort_order IS NOT NULL)
  ),

  -- Status+legs+no_show consistency
  CHECK (
    (status = 'pending' AND legs_player1 IS NULL AND legs_player2 IS NULL AND no_show_player_id IS NULL)
    OR
    (status = 'completed' AND legs_player1 IS NOT NULL AND legs_player2 IS NOT NULL AND no_show_player_id IS NULL)
    OR
    (status = 'no_show' AND legs_player1 IS NOT NULL AND legs_player2 IS NOT NULL AND no_show_player_id IS NOT NULL)
  ),

  -- tournament_round_name only valid for playoff matches
  CHECK (
    tournament_round_name IS NULL
    OR tournament_round_name IN ('Quarter-Finals', 'Semi-Finals', '3rd Place', 'Final')
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_season_player1
  ON public.matches (season_id, player1_id);

CREATE INDEX IF NOT EXISTS idx_matches_season_player2
  ON public.matches (season_id, player2_id);

CREATE INDEX IF NOT EXISTS idx_matches_season_date
  ON public.matches (season_id, match_date DESC);

CREATE INDEX IF NOT EXISTS idx_matches_tournament
  ON public.matches (tournament_id);

CREATE INDEX IF NOT EXISTS idx_matches_tournament_group
  ON public.matches (tournament_group_id);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read matches"
  ON public.matches FOR SELECT USING (true);

CREATE POLICY "Organizers can insert matches"
  ON public.matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update matches"
  ON public.matches FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Organizers can delete matches"
  ON public.matches FOR DELETE USING (auth.role() = 'authenticated');
