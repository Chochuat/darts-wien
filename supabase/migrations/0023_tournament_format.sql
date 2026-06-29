-- Tournament format config side table.
-- Per-tournament, per-phase legs/starting_score/max_throws configuration.
-- When the admin does not configure a phase, the generate Route Handler seeds
-- defaults from src/app/_components/tournaments/format-constants.ts.
-- Run this after 0022_matches_bracket_columns.sql

CREATE TABLE IF NOT EXISTS public.tournament_format (
  tournament_id   BIGINT   NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  phase           TEXT     NOT NULL CHECK (
    phase IN (
      'group', 'playoff', 'third_place', 'final',
      'grand_final_qf', 'grand_final_sf', 'grand_final_third',
      'grand_final_final', 'grand_final_consolation_sf',
      'grand_final_5th', 'grand_final_7th'
    )
  ),
  legs_target     SMALLINT NOT NULL CHECK (legs_target BETWEEN 1 AND 10),
  starting_score  SMALLINT NOT NULL DEFAULT 501 CHECK (starting_score > 0),
  max_throws      SMALLINT NOT NULL DEFAULT 45 CHECK (max_throws > 0),
  PRIMARY KEY (tournament_id, phase)
);

ALTER TABLE public.tournament_format ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tournament_format"
  ON public.tournament_format FOR SELECT USING (true);

CREATE POLICY "Admins can insert tournament_format"
  ON public.tournament_format FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tournament_format"
  ON public.tournament_format FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tournament_format"
  ON public.tournament_format FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
