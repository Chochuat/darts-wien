import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, requireNumericParam } from "@/lib/api-utils";
import type { StandingsResponse, StandingPlayer, StandingRecentMatch } from "@/lib/validation";

/**
 * Handles GET requests for season standings.
 *
 * @param _req - The incoming request.
 * @param context - Route context.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "season ID");
  if (param instanceof NextResponse) return param;
  const seasonId = param.id;

  const supabase = await getSupabase();

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .select("id, name, is_active")
    .eq("id", seasonId)
    .single();

  if (seasonError || !season) {
    return NextResponse.json({ error: "Season not found" }, { status: 404 });
  }

  const { data: matches, error: matchError } = await supabase
    .from("matches")
    .select(
      "id, player1_id, player2_id, legs_player1, legs_player2, player1_180, player2_180, match_date",
    )
    .eq("season_id", seasonId)
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .order("id", { ascending: false });

  if (matchError) return errorResponse(matchError);

  const { data: players, error: playerError } = await supabase
    .from("players")
    .select("id, name, slug");

  if (playerError) return errorResponse(playerError);

  const playerMap = new Map(
    (players ?? []).map((p) => [p.id, p]),
  );

  type Stats = {
    played: number;
    wins: number;
    losses: number;
    setsFor: number;
    setsAgainst: number;
    one80s: number;
    recentResults: ("W" | "L")[];
    recentMatches: StandingRecentMatch[];
  };

  const statsMap = new Map<number, Stats>();
  for (const p of players ?? []) {
    statsMap.set(p.id, {
      played: 0,
      wins: 0,
      losses: 0,
      setsFor: 0,
      setsAgainst: 0,
      one80s: 0,
      recentResults: [],
      recentMatches: [],
    });
  }

  const getStats = (pid: number): Stats => {
    const s = statsMap.get(pid);
    if (s) return s;
    const fresh: Stats = {
      played: 0,
      wins: 0,
      losses: 0,
      setsFor: 0,
      setsAgainst: 0,
      one80s: 0,
      recentResults: [],
      recentMatches: [],
    };
    statsMap.set(pid, fresh);
    return fresh;
  };

  for (const m of matches ?? []) {
    const l1 = m.legs_player1 ?? 0;
    const l2 = m.legs_player2 ?? 0;
    const p1Stats = getStats(m.player1_id);
    const p2Stats = getStats(m.player2_id);

    p1Stats.played++;
    p2Stats.played++;

    p1Stats.setsFor += l1;
    p1Stats.setsAgainst += l2;
    p2Stats.setsFor += l2;
    p2Stats.setsAgainst += l1;

    p1Stats.one80s += m.player1_180;
    p2Stats.one80s += m.player2_180;

    if (l1 > l2) {
      p1Stats.wins++;
      p2Stats.losses++;
    } else {
      p2Stats.wins++;
      p1Stats.losses++;
    }

    const p2 = playerMap.get(m.player2_id);
    const p1 = playerMap.get(m.player1_id);

    if (p2 && p1Stats.recentMatches.length < 5) {
      const won = l1 > l2;
      p1Stats.recentResults.push(won ? "W" : "L");
      p1Stats.recentMatches.push({
        opponent: p2.name,
        score: `${l1}-${l2}`,
        result: won ? "W" : "L",
        date: m.match_date,
        one80: m.player1_180,
      });
    }

    if (p1 && p2Stats.recentMatches.length < 5) {
      const won = l2 > l1;
      p2Stats.recentResults.push(won ? "W" : "L");
      p2Stats.recentMatches.push({
        opponent: p1.name,
        score: `${l2}-${l1}`,
        result: won ? "W" : "L",
        date: m.match_date,
        one80: m.player2_180,
      });
    }
  }

  const sortedPlayers = [...statsMap.entries()]
    .map(([playerId, stats]) => ({
      playerId,
      played: stats.played,
      wins: stats.wins,
      losses: stats.losses,
      setsFor: stats.setsFor,
      setsAgainst: stats.setsAgainst,
      one80s: stats.one80s,
      points: stats.wins * 2,
      form: stats.recentResults.slice(0, 5),
      recentMatches: stats.recentMatches,
    }))
    .sort((a, b) => {
      const ptDiff = b.points - a.points;
      if (ptDiff !== 0) return ptDiff;
      const setsDiffA = a.setsFor - a.setsAgainst;
      const setsDiffB = b.setsFor - b.setsAgainst;
      const sdDiff = setsDiffB - setsDiffA;
      if (sdDiff !== 0) return sdDiff;
      return b.wins - a.wins;
    });

  const standingPlayers: StandingPlayer[] = sortedPlayers.map((entry, index) => {
    const player = playerMap.get(entry.playerId);
    return {
      pos: index + 1,
      playerId: entry.playerId,
      name: player?.name ?? "Unknown",
      slug: player?.slug ?? "unknown",
      played: entry.played,
      wins: entry.wins,
      losses: entry.losses,
      setsFor: entry.setsFor,
      setsAgainst: entry.setsAgainst,
      points: entry.points,
      one80s: entry.one80s,
      form: entry.form,
      recentMatches: entry.recentMatches,
    };
  });

  const response: StandingsResponse = {
    season: {
      id: season.id,
      name: season.name,
      isActive: season.is_active,
    },
    players: standingPlayers,
  };

  return NextResponse.json(response);
}
