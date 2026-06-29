"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { ApiMatchesResponse, ApiMatchRow } from "@/lib/validation";
import type { MatchListQuery } from "@/lib/validation";

type MatchListParams = {
  seasonId?: number;
  playerId?: number;
  matchType?: NonNullable<MatchListQuery["matchType"]>;
  result?: NonNullable<MatchListQuery["result"]>;
  q?: string;
  page?: number;
  limit?: number;
};

/**
 * Builds a query string from match list parameters.
 *
 * @param params - The match list parameters.
 */
function buildQueryString(params: MatchListParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Fetches matches from the API.
 *
 * @param params - The match list parameters.
 */
async function fetchMatches(params: MatchListParams) {
  const qs = buildQueryString(params);
  const res = await fetch(`/api/matches${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.status}`);
  const data = await res.json();
  return ApiMatchesResponse.parse(data);
}

/**
 * Fetches a single match by ID.
 *
 * @param id - The match ID.
 */
async function fetchMatchDetail(id: number) {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch match: ${res.status}`);
  const data = await res.json();
  return ApiMatchRow.parse(data);
}

/**
 * Fetches match data by query parameters.
 *
 * @param params - Query parameters for filtering matches.
 */
export function useMatches(params: MatchListParams = {}) {
  return useQuery({
    queryKey: queryKeys.match.list(
      params as unknown as Record<string, string | number | undefined>,
    ),
    queryFn: () => fetchMatches(params),
    staleTime: 30_000,
  });
}

/**
 * Fetches a single match by its ID.
 *
 * @param id - The match ID.
 */
export function useMatchDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.match.detail(id),
    queryFn: () => fetchMatchDetail(id),
    staleTime: 30_000,
  });
}
