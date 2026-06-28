"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { ApiMatchesResponse, ApiMatchRow } from "@/lib/validation";

interface MatchListParams {
  seasonId?: number;
  playerId?: number;
  matchType?: string;
  result?: string;
  q?: string;
  page?: number;
  limit?: number;
}

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

async function fetchMatches(params: MatchListParams) {
  const qs = buildQueryString(params);
  const res = await fetch(`/api/matches${qs}`);
  if (!res.ok) throw new Error(`Failed to fetch matches: ${res.status}`);
  const data = await res.json();
  return ApiMatchesResponse.parse(data);
}

async function fetchMatchDetail(id: number) {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch match: ${res.status}`);
  const data = await res.json();
  return ApiMatchRow.parse(data);
}

export function useMatches(params: MatchListParams = {}) {
  return useQuery({
    queryKey: queryKeys.match.list(params as Record<string, string | number | undefined>),
    queryFn: () => fetchMatches(params),
    staleTime: 30_000,
  });
}

export function useMatchDetail(id: number) {
  return useQuery({
    queryKey: queryKeys.match.detail(id),
    queryFn: () => fetchMatchDetail(id),
    staleTime: 30_000,
  });
}
