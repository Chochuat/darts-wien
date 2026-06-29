import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, requireNumericParam } from "@/lib/api-utils";
import type { ApiMatchRow } from "@/lib/validation";

/**
 * Handles GET requests for a single tournament by ID.
 *
 * @param _req - The incoming request.
 * @param context - Route context.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "tournament ID");
  if (param instanceof NextResponse) return param;
  const tournamentId = param.id;

  const supabase = await getSupabase();

  const { data: tournament, error: tError } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", tournamentId)
    .single();

  if (tError || !tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const [groupsRes, allMatchesRes, registrationsRes, finalStandingsRes] =
    await Promise.all([
      supabase
        .from("tournament_groups")
        .select("id, label")
        .eq("tournament_id", tournamentId),
      supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournamentId)
        .in("match_type", ["tournament_group", "tournament_playoff"])
        .order("sort_order"),
      supabase
        .from("tournament_registrations")
        .select("id")
        .eq("tournament_id", tournamentId),
      supabase
        .from("tournament_final_standings")
        .select("*")
        .eq("tournament_id", tournamentId)
        .order("position"),
    ]);

  const groups = groupsRes.data ?? [];
  const groupIds = groups.map((g) => g.id);

  const groupMatches = (allMatchesRes.data ?? []).filter(
    (m) => m.match_type === "tournament_group",
  );
  const playoffMatches = (allMatchesRes.data ?? []).filter(
    (m) => m.match_type === "tournament_playoff",
  );
  const registrations = registrationsRes.data;
  const finalStandings = finalStandingsRes.data;

  const groupPlayersRes = await supabase
    .from("tournament_group_players")
    .select("group_id, player_id")
    .in("group_id", groupIds.length ? groupIds : [0]);
  const groupPlayersRows = groupPlayersRes.data ?? [];

  const involvedPlayerIds = new Set<number>();
  for (const gp of groupPlayersRows) involvedPlayerIds.add(gp.player_id);
  for (const m of groupMatches) {
    involvedPlayerIds.add(m.player1_id);
    involvedPlayerIds.add(m.player2_id);
  }
  for (const m of playoffMatches) {
    involvedPlayerIds.add(m.player1_id);
    involvedPlayerIds.add(m.player2_id);
  }
  if (tournament.winner_player_id != null) {
    involvedPlayerIds.add(tournament.winner_player_id);
  }

  const { data: allPlayers } = await supabase
    .from("players")
    .select("id, name, slug")
    .in(
      "id",
      involvedPlayerIds.size ? [...involvedPlayerIds] : [0],
    );

  const playerMap = new Map(
    (allPlayers ?? []).map((p) => [p.id, p]),
  );

  const unknownPlayer = (pid: number) => ({ id: pid, name: "Unknown", slug: "unknown" });
  const getPlayer = (pid: number) => playerMap.get(pid) ?? unknownPlayer(pid);

  const playersByGroup = new Map<number, number[]>();
  for (const gp of groupPlayersRows ?? []) {
    const arr = playersByGroup.get(gp.group_id) ?? [];
    arr.push(gp.player_id);
    playersByGroup.set(gp.group_id, arr);
  }

  const matchesByGroup = new Map<number, typeof groupMatches>();
  for (const m of groupMatches ?? []) {
    if (m.tournament_group_id == null) continue;
    const arr = matchesByGroup.get(m.tournament_group_id) ?? [];
    arr.push(m);
    matchesByGroup.set(m.tournament_group_id, arr);
  }

  const groupDetails = (groups ?? []).map((g) => {
    const groupPlayerIds = playersByGroup.get(g.id) ?? [];
    const players = groupPlayerIds
      .map((pid) => playerMap.get(pid))
      .filter((p): p is { id: number; name: string; slug: string } => p != null);

    const gm = matchesByGroup.get(g.id) ?? [];

    const matches: ApiMatchRow[] = gm.map((m) => ({
      id: m.id,
      matchType: m.match_type,
      status: m.status,
      player1: getPlayer(m.player1_id),
      player2: getPlayer(m.player2_id),
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

    const standings = players.map((p) => {
      const playerMatches = gm.filter(
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
    });

    standings.sort((a, b) => {
      const ptDiff = b.points - a.points;
      if (ptDiff !== 0) return ptDiff;
      return b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst);
    });
    standings.forEach((entry, idx) => {
      entry.pos = idx + 1;
    });

    return {
      label: g.label,
      players: players.map((p) => ({ id: p.id, name: p.name, slug: p.slug })),
      standings,
      matches,
    };
  });

  const roundOrder = ["Quarter-Finals", "Semi-Finals", "3rd Place", "Final"] as const;

  const playoffs = roundOrder.map((name) => ({
    name,
    matches: (playoffMatches ?? [])
      .filter((m) => m.tournament_round_name === name)
      .map((m) => ({
        id: m.id,
        matchType: m.match_type,
        status: m.status,
        player1: getPlayer(m.player1_id),
        player2: getPlayer(m.player2_id),
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
      })) as ApiMatchRow[],
  }));

  const apiStandings = (finalStandings ?? []).map((fs) => {
    const p = playerMap.get(fs.player_id);
    return {
      pos: fs.position,
      player: p ? { id: p.id, name: p.name, slug: p.slug } : unknownPlayer(fs.player_id),
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

  const total180s = [...(groupMatches ?? []), ...(playoffMatches ?? [])].reduce(
    (sum, m) => sum + (m.player1_180 ?? 0) + (m.player2_180 ?? 0),
    0,
  );

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
      playerCount: registrations?.length ?? 0,
      groupMatchCount: groupMatches?.length ?? 0,
      playoffMatchCount: playoffMatches?.length ?? 0,
      total180s,
    },
    groups: groupDetails,
    playoffs,
    finalStandings: apiStandings,
  };

  return NextResponse.json(response);
}

/**
 * Handles PATCH requests to update a tournament.
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "tournament ID");
  if (param instanceof NextResponse) return param;
  const tournamentId = param.id;

  const body = await req.json();
  const supabase = await getSupabase();

  const updates: Record<string, unknown> = {};
  if (body.date !== undefined) updates.date = body.date;
  if (body.numGroups !== undefined) updates.num_groups = body.numGroups;

  const { data, error } = await supabase
    .from("tournaments")
    .update(updates)
    .eq("id", tournamentId)
    .select()
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data);
}
