"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  created_at: string;
}

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
    (row: { id: number; name: string; throw: number; created_at: string }) => ({
      id: row.id,
      name: row.name,
      score: row.throw,
      created_at: row.created_at,
    }),
  );
}

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