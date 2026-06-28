"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { PlayerSummary, PlayerMatchPerspective } from "@/lib/validation";

interface PlayersResponse {
  players: PlayerSummary[];
}

interface PlayerResponse {
  player: PlayerSummary & {
    pos: number;
    played: number;
    wins: number;
    losses: number;
    setsFor: number;
    setsAgainst: number;
    points: number;
    one80s: number;
    form: ("W" | "L")[];
  };
  matches: PlayerMatchPerspective[];
}

async function fetchPlayers(): Promise<PlayersResponse> {
  const res = await fetch("/api/players");
  if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`);
  const data = await res.json();
  return { players: data.players.map((p: unknown) => PlayerSummary.parse(p)) };
}

async function fetchPlayerBySlug(slug: string): Promise<PlayerResponse> {
  const res = await fetch(`/api/players/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Failed to fetch player: ${res.status}`);
  const data = await res.json();
  return { ...data, matches: data.matches.map((m: unknown) => PlayerMatchPerspective.parse(m)) };
}

async function fetchPlayerMatches(slug: string): Promise<PlayerMatchPerspective[]> {
  const res = await fetch(`/api/players/${encodeURIComponent(slug)}/matches`);
  if (!res.ok) throw new Error(`Failed to fetch player matches: ${res.status}`);
  const data = await res.json();
  return data.map((m: unknown) => PlayerMatchPerspective.parse(m));
}

export function usePlayers() {
  return useQuery({
    queryKey: queryKeys.player.all,
    queryFn: fetchPlayers,
    staleTime: 60_000,
  });
}

export function usePlayerBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.player.bySlug(slug),
    queryFn: () => fetchPlayerBySlug(slug),
    staleTime: 30_000,
  });
}

export function usePlayerMatches(slug: string) {
  return useQuery({
    queryKey: queryKeys.player.matches(slug),
    queryFn: () => fetchPlayerMatches(slug),
    staleTime: 30_000,
  });
}
