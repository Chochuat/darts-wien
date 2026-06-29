-- Club settings singleton table.
-- Holds global, club-wide configuration. Currently stores the tiebreaker
-- dimension order used when resolving group advancement ties.
-- Run this after 0024_tournament_standings_snapshot.sql

CREATE TABLE IF NOT EXISTS public.club_settings (
  id                SMALLINT    PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  tiebreaker_order  TEXT[]      NOT NULL DEFAULT ARRAY[
    'head_to_head', 'leg_diff', 'legs_won', 'legs_lost', 'one80s'
  ],
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the singleton row.
INSERT INTO public.club_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.club_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read club_settings"
  ON public.club_settings FOR SELECT USING (true);

CREATE POLICY "Admins can update club_settings"
  ON public.club_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
