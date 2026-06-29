import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, validationError } from "@/lib/api-utils";
import { MatchListQuery } from "@/lib/validation";
import type { ApiMatchRow } from "@/lib/validation";

/**
 * Handles GET requests for match listings.
 *
 * @param req - The incoming request.
 */
export async function GET(req: NextRequest) {
  const supabase = await getSupabase();

  const { searchParams } = new URL(req.url);
  const parsed = MatchListQuery.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return validationError(parsed.error.issues);
  const params = parsed.data;

  let query = supabase
    .from("matches")
    .select(
      "id, match_type, status, player1_id, player2_id, legs_player1, legs_player2, legs_target, max_throws, player1_180, player2_180, no_show_player_id, match_date, tournament_id, tournament_group_id, tournament_round_name, sort_order",
    );

  if (params.seasonId) {
    query = query.eq("season_id", params.seasonId);
  }
  if (params.playerId) {
    query = query.or(
      `player1_id.eq.${params.playerId},player2_id.eq.${params.playerId}`,
    );
  }
  if (params.matchType) {
    query = query.eq("match_type", params.matchType);
  }

  const { data: matches, error } = await query.order("match_date", {
    ascending: false,
  });

  if (error) return errorResponse(error);

  const allPlayerIds = new Set<number>();
  const allTournamentIds = new Set<number>();
  const allGroupIds = new Set<number>();
  for (const m of matches ?? []) {
    allPlayerIds.add(m.player1_id);
    allPlayerIds.add(m.player2_id);
    if (m.tournament_id) allTournamentIds.add(m.tournament_id);
    if (m.tournament_group_id) allGroupIds.add(m.tournament_group_id);
  }

  const playerIdsArr = [...allPlayerIds];
  const { data: players } = await supabase
    .from("players")
    .select("id, name, slug")
    .in("id", playerIdsArr.length ? playerIdsArr : [0]);

  const playerMap = new Map(
    (players ?? []).map((p) => [p.id, { id: p.id, name: p.name, slug: p.slug }]),
  );

  const tournamentIdsArr = [...allTournamentIds];
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, week_number, type")
    .in("id", tournamentIdsArr.length ? tournamentIdsArr : [0]);

  const tournamentMap = new Map(
    (tournaments ?? []).map((t) => [
      t.id,
      { weekNumber: t.week_number, type: t.type },
    ]),
  );

  const groupIdsArr = [...allGroupIds];
  const { data: groups } = await supabase
    .from("tournament_groups")
    .select("id, label")
    .in("id", groupIdsArr.length ? groupIdsArr : [0]);

  const groupMap = new Map((groups ?? []).map((g) => [g.id, g.label]));

  const unknownPlayer = (id: number) => ({ id, name: "Unknown", slug: "unknown" });

  let resultRows: ApiMatchRow[] = (matches ?? []).map((m) => {
    const t = m.tournament_id ? tournamentMap.get(m.tournament_id) : undefined;
    return {
      id: m.id,
      matchType: m.match_type,
      status: m.status,
      player1: playerMap.get(m.player1_id) ?? unknownPlayer(m.player1_id),
      player2: playerMap.get(m.player2_id) ?? unknownPlayer(m.player2_id),
      legsPlayer1: m.legs_player1,
      legsPlayer2: m.legs_player2,
      legsTarget: m.legs_target,
      maxThrows: m.max_throws,
      player1_180: m.player1_180,
      player2_180: m.player2_180,
      noShowPlayerId: m.no_show_player_id,
      matchDate: m.match_date,
      tournamentWeek: t?.weekNumber,
      tournamentType: t?.type,
      groupLabel: m.tournament_group_id
        ? groupMap.get(m.tournament_group_id)
        : undefined,
      roundName: m.tournament_round_name,
      sortOrder: m.sort_order,
    };
  });

  if (params.playerId && params.result) {
    const pid = params.playerId;
    resultRows = resultRows.filter((m) => {
      const isPlayer1 = m.player1.id === pid;
      const legsFor = isPlayer1 ? m.legsPlayer1 : m.legsPlayer2;
      const legsAgainst = isPlayer1 ? m.legsPlayer2 : m.legsPlayer1;
      const won = legsFor != null && legsAgainst != null && legsFor > legsAgainst;
      return params.result === "W" ? won : !won;
    });
  }

  if (params.q) {
    const lowerQ = params.q.toLowerCase();
    resultRows = resultRows.filter(
      (m) =>
        m.player1.name.toLowerCase().includes(lowerQ) ||
        m.player2.name.toLowerCase().includes(lowerQ) ||
        m.matchDate.includes(lowerQ),
    );
  }

  const total = resultRows.length;
  const page = params.page;
  const limit = params.limit;
  const paged = resultRows.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ total, page, limit, matches: paged });
}
