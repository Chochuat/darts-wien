"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { StandingsResponse } from "@/lib/validation";

async function fetchStandings(seasonId: number) {
  const res = await fetch(`/api/seasons/${seasonId}/standings`);
  if (!res.ok) throw new Error(`Failed to fetch standings: ${res.status}`);
  const data = await res.json();
  return StandingsResponse.parse(data);
}

export function useStandings(seasonId: number) {
  return useQuery({
    queryKey: queryKeys.season.standings(seasonId),
    queryFn: () => fetchStandings(seasonId),
    staleTime: 30_000,
  });
}
