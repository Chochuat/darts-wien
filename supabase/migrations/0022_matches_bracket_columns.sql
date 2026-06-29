-- Bracket engine columns on matches + starting_score + relaxed legs_target.
-- Run this after 0021_rls_tighten_writes.sql

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS next_match_id BIGINT REFERENCES public.matches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS advances TEXT CHECK (advances IN ('winner', 'loser')) DEFAULT 'winner',
  ADD COLUMN IF NOT EXISTS player_slot TEXT CHECK (player_slot IN ('player1', 'player2')),
  ADD COLUMN IF NOT EXISTS starting_score SMALLINT NOT NULL DEFAULT 501 CHECK (starting_score > 0);

-- Relax legs_target bounds to allow admin-configurable values.
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_legs_target_check;
ALTER TABLE public.matches
  ADD CONSTRAINT matches_legs_target_check CHECK (legs_target BETWEEN 1 AND 10);

-- Allow NULL player slots for downstream playoff matches (filled by bracket
-- engine when the upstream match resolves). Keep the "player1 <> player2" guard.
ALTER TABLE public.matches
  ALTER COLUMN player1_id DROP NOT NULL;
ALTER TABLE public.matches
  ALTER COLUMN player2_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_matches_next_match
  ON public.matches (next_match_id);
