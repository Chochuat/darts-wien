-- Tighten write RLS policies: only admin/scorekeeper profiles can write.
-- Read policies stay public (USING (true)).
-- Run this after 0020_profiles.sql

-- Helper: an admin is an authenticated user whose profile.role = 'admin'.
-- A scorekeeper is an authenticated user whose profile.role = 'scorekeeper'.
-- These checks replace the previous loose `auth.role() = 'authenticated'` gates.

-- ─── tournaments ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Organizers can insert tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Organizers can update tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Organizers can delete tournaments" ON public.tournaments;

CREATE POLICY "Admins can insert tournaments"
  ON public.tournaments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tournaments"
  ON public.tournaments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tournaments"
  ON public.tournaments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─── tournament_registrations ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Organizers can insert tournament_registrations" ON public.tournament_registrations;
DROP POLICY IF EXISTS "Organizers can update tournament_registrations" ON public.tournament_registrations;
DROP POLICY IF EXISTS "Organizers can delete tournament_registrations" ON public.tournament_registrations;

CREATE POLICY "Admins can insert tournament_registrations"
  ON public.tournament_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tournament_registrations"
  ON public.tournament_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tournament_registrations"
  ON public.tournament_registrations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─── tournament_groups ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Organizers can insert tournament_groups" ON public.tournament_groups;
DROP POLICY IF EXISTS "Organizers can update tournament_groups" ON public.tournament_groups;
DROP POLICY IF EXISTS "Organizers can delete tournament_groups" ON public.tournament_groups;

CREATE POLICY "Admins can insert tournament_groups"
  ON public.tournament_groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tournament_groups"
  ON public.tournament_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tournament_groups"
  ON public.tournament_groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─── tournament_group_players ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Organizers can insert tournament_group_players" ON public.tournament_group_players;
DROP POLICY IF EXISTS "Organizers can update tournament_group_players" ON public.tournament_group_players;
DROP POLICY IF EXISTS "Organizers can delete tournament_group_players" ON public.tournament_group_players;

CREATE POLICY "Admins can insert tournament_group_players"
  ON public.tournament_group_players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tournament_group_players"
  ON public.tournament_group_players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tournament_group_players"
  ON public.tournament_group_players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─── matches ────────────────────────────────────────────────────────────────
-- Scorekeepers can write matches, but only for in_progress tournaments.
-- Admins can write any match.
DROP POLICY IF EXISTS "Organizers can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Organizers can update matches" ON public.matches;
DROP POLICY IF EXISTS "Organizers can delete matches" ON public.matches;

CREATE POLICY "Admins and scorekeepers can insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('admin', 'scorekeeper')
    )
  );

CREATE POLICY "Admins can update any match"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Scorekeepers can update matches in in_progress tournaments"
  ON public.matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'scorekeeper'
    )
    AND EXISTS (
      SELECT 1 FROM public.tournaments t
      WHERE t.id = matches.tournament_id AND t.status = 'in_progress'
    )
  );

CREATE POLICY "Admins can delete matches"
  ON public.matches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─── players ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Organizers can insert players" ON public.players;
DROP POLICY IF EXISTS "Organizers can update players" ON public.players;
DROP POLICY IF EXISTS "Organizers can delete players" ON public.players;

CREATE POLICY "Admins can insert players"
  ON public.players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update players"
  ON public.players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete players"
  ON public.players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─── seasons ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Organizers can insert seasons" ON public.seasons;
DROP POLICY IF EXISTS "Organizers can update seasons" ON public.seasons;
DROP POLICY IF EXISTS "Organizers can delete seasons" ON public.seasons;

CREATE POLICY "Admins can insert seasons"
  ON public.seasons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update seasons"
  ON public.seasons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete seasons"
  ON public.seasons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ─── tournament_final_standings ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Organizers can insert tournament_final_standings" ON public.tournament_final_standings;
DROP POLICY IF EXISTS "Organizers can update tournament_final_standings" ON public.tournament_final_standings;
DROP POLICY IF EXISTS "Organizers can delete tournament_final_standings" ON public.tournament_final_standings;

CREATE POLICY "Admins can insert tournament_final_standings"
  ON public.tournament_final_standings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tournament_final_standings"
  ON public.tournament_final_standings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tournament_final_standings"
  ON public.tournament_final_standings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );
