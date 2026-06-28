"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface LeaderboardEntry {
  /** Entry ID. */
  id: number;
  /** Player name. */
  name: string;
  /** Throw score. */
  score: number;
  /** Timestamp of the throw. */
  created_at: string;
}

/**
 * Fetches top throws from the leaderboard.
 * @param limit - Maximum number of entries to fetch
 */
export async function fetchTopThrows(limit = 10): Promise<LeaderboardEntry[]> {
  
  const sb = createClient();
  if (!sb) {
    return [];
  }
  
  const { data, error } = await sb
    .from("game_throw")
    .select("id, name, throw, created_at")
    .order("throw", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) {
    return [];
  }
  return (data ?? []).map(
    (row: { 
    id: number; 
    name: string; 
    throw: number; 
    created_at: string }) => ({
      id: row.id,
      name: row.name,
      score: row.throw,
      created_at: row.created_at,
    }),
  );
}

/**
 * Saves a throw to the leaderboard.
 * @param name - Player name
 * @param score - Throw score
 */
export async function saveThrow(name: string, score: number): Promise<void> {
  
  const sb = createClient();
  if (!sb) {
    return;
  }
  
  const { error } = await sb.from("game_throw").insert({ name, throw: score });
  if (error) {
    return;
  }
}

/**
 * Hook that fetches top throws reactively when dirtyKey changes.
 * @param dirtyKey - Increment to trigger a refetch
 */
export function useTopThrows(dirtyKey: number): {
  entries: LeaderboardEntry[];
  loading: boolean;
} {
  
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const dirty = dirtyKey;

  useEffect(() => {
    
    let cancelled = false;
    void fetchTopThrows(10)
      .then((rows) => {
        if (cancelled) return;
        setEntries(rows);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dirty]);

  return { entries, loading };
}