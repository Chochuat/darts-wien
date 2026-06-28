import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tournamentId = Number(id);
  if (Number.isNaN(tournamentId)) {
    return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const { data: groups } = await supabase
    .from("tournament_groups")
    .select("id, label")
    .eq("tournament_id", tournamentId);

  const groupDetails = await Promise.all(
    (groups ?? []).map(async (g) => {
      const { data: groupPlayers } = await supabase
        .from("tournament_group_players")
        .select("player_id")
        .eq("group_id", g.id);

      const { data: playerDetails } = await supabase
        .from("players")
        .select("id, name, slug");

      const playerMap = new Map(
        (playerDetails ?? []).map((p) => [p.id, p]),
      );

      const players = (groupPlayers ?? [])
        .map((gp) => playerMap.get(gp.player_id))
        .filter((p): p is { id: number; name: string; slug: string } => p != null);

      const { data: groupMatches } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_group_id", g.id)
        .eq("match_type", "tournament_group");

      const matches = (groupMatches ?? []).map((m) => ({
        id: m.id,
        matchType: m.match_type,
        status: m.status,
        player1: playerMap.get(m.player1_id) ?? { id: 0, name: "Unknown", slug: "unknown" },
        player2: playerMap.get(m.player2_id) ?? { id: 0, name: "Unknown", slug: "unknown" },
        legsPlayer1: m.legs_player1,
        legsPlayer2: m.legs_player2,
        legsTarget: m.legs_target,
        maxThrows: m.max_throws,
        player1_180: m.player1_180,
        player2_180: m.player2_180,
        noShowPlayerId: m.no_show_player_id,
        matchDate: m.match_date,
        groupLabel: g.label,
        roundName: undefined,
        sortOrder: undefined,
      }));

      const standings = (players ?? []).map((p) => {
        const playerMatches = (groupMatches ?? []).filter(
          (m) => m.player1_id === p.id || m.player2_id === p.id,
        );
        let wins = 0;
        let losses = 0;
        let setsFor = 0;
        let setsAgainst = 0;
        let one80s = 0;

        for (const m of playerMatches) {
          const isP1 = m.player1_id === p.id;
          const legsFor = isP1 ? m.legs_player1 : m.legs_player2;
          const legsAgainst = isP1 ? m.legs_player2 : m.legs_player1;
          if (legsFor != null && legsAgainst != null) {
            if (legsFor > legsAgainst) wins++;
            else losses++;
            setsFor += legsFor;
            setsAgainst += legsAgainst;
          }
          one80s += isP1 ? m.player1_180 : m.player2_180;
        }

        return {
          player: { id: p.id, name: p.name, slug: p.slug },
          pos: 1,
          played: playerMatches.length,
          wins,
          losses,
          setsFor,
          setsAgainst,
          points: wins * 2,
          one80s,
        };
      }).sort((a, b) => {
        const ptDiff = b.points - a.points;
        if (ptDiff !== 0) return ptDiff;
        return b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst);
      }).map((entry, idx) => ({ ...entry, pos: idx + 1 }));

      return {
        label: g.label,
        players: players.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
        standings,
        matches,
      };
    }),
  );

  const { data: playoffMatches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "tournament_playoff")
    .order("sort_order");

  const { data: allPlayers } = await supabase
    .from("players")
    .select("id, name, slug");

  const playerMap = new Map(
    (allPlayers ?? []).map((p) => [p.id, p]),
  );

  const roundOrder = ["Quarter-Finals", "Semi-Finals", "3rd Place", "Final"];
  const playoffs = roundOrder.map((name) => ({
    name: name as "Quarter-Finals" | "Semi-Finals" | "3rd Place" | "Final",
    matches: (playoffMatches ?? [])
      .filter((m) => m.tournament_round_name === name)
      .map((m) => ({
        id: m.id,
        matchType: m.match_type,
        status: m.status,
        player1: playerMap.get(m.player1_id) ?? { id: 0, name: "Unknown", slug: "unknown" },
        player2: playerMap.get(m.player2_id) ?? { id: 0, name: "Unknown", slug: "unknown" },
        legsPlayer1: m.legs_player1,
        legsPlayer2: m.legs_player2,
        legsTarget: m.legs_target,
        maxThrows: m.max_throws,
        player1_180: m.player1_180,
        player2_180: m.player2_180,
        noShowPlayerId: m.no_show_player_id,
        matchDate: m.match_date,
        roundName: m.tournament_round_name,
        sortOrder: m.sort_order,
        groupLabel: undefined,
      })),
  }));

  const { data: finalStandings } = await supabase
    .from("tournament_final_standings")
    .select("*")
    .eq("tournament_id", tournamentId)
    .order("position");

  const apiStandings = (finalStandings ?? []).map((fs) => {
    const p = playerMap.get(fs.player_id);
    return {
      pos: fs.position,
      player: p ? { id: p.id, name: p.name, slug: p.slug } : { id: fs.player_id, name: "Unknown", slug: "unknown" },
      played: fs.played,
      wins: fs.wins,
      losses: fs.losses,
      setsFor: fs.sets_for,
      setsAgainst: fs.sets_against,
      groupPoints: fs.group_points,
      playoffPoints: fs.playoff_points,
      bonusPoints: fs.bonus_points,
      totalPoints: fs.total_points,
      one80s: fs.one80s,
    };
  });

  const winner = tournament.winner_player_id != null
    ? playerMap.get(tournament.winner_player_id) ?? null
    : null;

  const response = {
    tournament: {
      id: tournament.id,
      weekNumber: tournament.week_number,
      date: tournament.date,
      type: tournament.type,
      status: tournament.status,
      winner: winner
        ? { id: winner.id, name: winner.name, slug: winner.slug }
        : null,
      generationType: tournament.generation_type,
      playerCount: 0,
      groupMatchCount: 0,
      playoffMatchCount: 0,
      total180s: 0,
    },
    groups: groupDetails,
    playoffs,
    finalStandings: apiStandings,
  };

  return NextResponse.json(response);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tournamentId = Number(id);
  if (Number.isNaN(tournamentId)) {
    return NextResponse.json({ error: "Invalid tournament ID" }, { status: 400 });
  }

  const body = await req.json();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updates: Record<string, unknown> = {};
  if (body.date !== undefined) updates.date = body.date;
  if (body.numGroups !== undefined) updates.num_groups = body.numGroups;

  const { data, error } = await supabase
    .from("tournaments")
    .update(updates)
    .eq("id", tournamentId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
