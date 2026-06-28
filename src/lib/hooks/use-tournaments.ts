"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  TournamentSummary,
  TournamentDetailResponse,
  ApiRegistrationEntry,
} from "@/lib/validation";

async function fetchTournaments(seasonId?: number) {
  const qs = seasonId ? `?seasonId=${seasonId}` : "";
  const res = await fetch(`/api/tournaments${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch tournaments: ${res.status}`);
  const data = await res.json();
  const rawTournaments = (data.tournaments ?? []) as unknown[];
  return {
    tournaments: rawTournaments.map((t) => TournamentSummary.parse(t)),
  };
}

async function fetchTournamentDetail(id: number) {
  const res = await fetch(`/api/tournaments/${id}`);
  if (!res.ok)
    throw new Error(`Failed to fetch tournament detail: ${res.status}`);
  const data = await res.json();
  return TournamentDetailResponse.parse(data);
}

async function fetchRegistrations(tournamentId: number) {
  const res = await fetch(`/api/tournaments/${tournamentId}/registrations`);
  if (!res.ok)
    throw new Error(`Failed to fetch registrations: ${res.status}`);
  const data = await res.json();
  return {
    registrations: data.registrations.map((r: unknown) =>
      ApiRegistrationEntry.parse(r),
    ),
  };
}

/**
 * Fetches tournaments, optionally filtered by season.
 *
 * @param seasonId - The season ID to filter by.
 */
export function useTournaments(seasonId?: number) {
  return useQuery({
    queryKey: queryKeys.tournament.list(seasonId),
    queryFn: () => fetchTournaments(seasonId),
    staleTime: 60_000,
  });
}

/**
 * Fetches a single tournament by its ID.
 *
 * @param id - The tournament ID.
 */
export function useTournamentDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.tournament.detail(id),
    queryFn: () => fetchTournamentDetail(id),
    staleTime: 60_000,
  });
}

/**
 * Fetches registrations for a specific tournament.
 *
 * @param tournamentId - The tournament ID.
 */
export function useTournamentRegistrations(tournamentId: number) {
  return useQuery({
    queryKey: queryKeys.tournament.registrations(tournamentId),
    queryFn: () => fetchRegistrations(tournamentId),
    staleTime: 30_000,
  });
}
