import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { StandingsResponse, StandingPlayer, StandingRecentMatch } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const seasonId = Number(id);
  if (Number.isNaN(seasonId)) {
    return NextResponse.json({ error: "Invalid season ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  if (matchError) {
    return NextResponse.json({ error: matchError.message }, { status: 500 });
  }

  const { data: players, error: playerError } = await supabase
    .from("players")
    .select("id, name, slug");

  if (playerError) {
    return NextResponse.json({ error: playerError.message }, { status: 500 });
  }

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const statsMap = new Map<
    number,
    {
      played: number;
      wins: number;
      losses: number;
      setsFor: number;
      setsAgainst: number;
      one80s: number;
      recentResults: ("W" | "L")[];
      recentMatches: StandingRecentMatch[];
    }
  >();

  for (const p of players) {
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

  for (const m of matches) {
    const p1Stats = statsMap.get(m.player1_id)!;
    const p2Stats = statsMap.get(m.player2_id)!;
    const p2 = playerMap.get(m.player2_id);
    const p1 = playerMap.get(m.player1_id);

    p1Stats.played++;
    p2Stats.played++;

    p1Stats.setsFor += m.legs_player1;
    p1Stats.setsAgainst += m.legs_player2;
    p2Stats.setsFor += m.legs_player2;
    p2Stats.setsAgainst += m.legs_player1;

    p1Stats.one80s += m.player1_180;
    p2Stats.one80s += m.player2_180;

    if (m.legs_player1 > m.legs_player2) {
      p1Stats.wins++;
      p2Stats.losses++;
    } else {
      p2Stats.wins++;
      p1Stats.losses++;
    }

    if (p2 && p1Stats.recentMatches.length < 5) {
      const won = m.legs_player1 > m.legs_player2;
      p1Stats.recentResults.push(won ? "W" : "L");
      p1Stats.recentMatches.push({
        opponent: p2.name,
        score: `${m.legs_player1}-${m.legs_player2}`,
        result: won ? "W" : "L",
        date: m.match_date,
        one80: m.player1_180,
      });
    }

    if (p1 && p2Stats.recentMatches.length < 5) {
      const won = m.legs_player2 > m.legs_player1;
      p2Stats.recentResults.push(won ? "W" : "L");
      p2Stats.recentMatches.push({
        opponent: p1.name,
        score: `${m.legs_player2}-${m.legs_player1}`,
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

  const standingPlayers: StandingPlayer[] = sortedPlayers.map(
    (entry, index) => {
      const player = playerMap.get(entry.playerId)!;
      return {
        pos: index + 1,
        playerId: entry.playerId,
        name: player.name,
        slug: player.slug,
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
    },
  );

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
