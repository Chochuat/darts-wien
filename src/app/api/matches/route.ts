import { NextRequest, NextResponse } from "next/server";
import { getSupabase, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const supabase = await getSupabase();

  const { searchParams } = new URL(req.url);
  const seasonId = searchParams.get("seasonId");
  const playerId = searchParams.get("playerId");
  const matchType = searchParams.get("matchType");
  const result = searchParams.get("result");
  const q = searchParams.get("q");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(5000, Math.max(1, Number(searchParams.get("limit")) || 20));

  let query = supabase
    .from("matches")
    .select(
      "id, match_type, status, player1_id, player2_id, legs_player1, legs_player2, legs_target, max_throws, player1_180, player2_180, no_show_player_id, match_date, tournament_id, tournament_group_id, tournament_round_name, sort_order",
      { count: "exact" },
    );

  if (seasonId) {
    query = query.eq("season_id", Number(seasonId));
  }
  if (playerId) {
    query = query.or(
      `player1_id.eq.${Number(playerId)},player2_id.eq.${Number(playerId)}`,
    );
  }
  if (matchType) {
    query = query.eq("match_type", matchType);
  }

  const { data: matches, count, error } = await query
    .order("match_date", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return errorResponse(error);

  const allPlayerIds = new Set<number>();
  for (const m of matches ?? []) {
    allPlayerIds.add(m.player1_id);
    allPlayerIds.add(m.player2_id);
  }

  const { data: players } = await supabase
    .from("players")
    .select("id, name, slug");

  const playerMap = new Map(
    (players ?? []).map((p) => [p.id, { id: p.id, name: p.name, slug: p.slug }]),
  );

  let resultRows = (matches ?? []).map((m) => ({
    id: m.id,
    matchType: m.match_type,
    status: m.status,
    player1: playerMap.get(m.player1_id) ?? { id: m.player1_id, name: "Unknown", slug: "unknown" },
    player2: playerMap.get(m.player2_id) ?? { id: m.player2_id, name: "Unknown", slug: "unknown" },
    legsPlayer1: m.legs_player1,
    legsPlayer2: m.legs_player2,
    legsTarget: m.legs_target,
    maxThrows: m.max_throws,
    player1_180: m.player1_180,
    player2_180: m.player2_180,
    noShowPlayerId: m.no_show_player_id,
    matchDate: m.match_date,
    tournamentWeek: undefined as number | undefined,
    tournamentType: undefined as string | undefined,
    groupLabel: undefined as string | undefined,
    roundName: m.tournament_round_name,
    sortOrder: m.sort_order,
  }));

  if (playerId && result) {
    const pid = Number(playerId);
    resultRows = resultRows.filter((m) => {
      const isPlayer1 = m.player1.id === pid;
      const legsFor = isPlayer1 ? m.legsPlayer1 : m.legsPlayer2;
      const legsAgainst = isPlayer1 ? m.legsPlayer2 : m.legsPlayer1;
      const won = legsFor != null && legsAgainst != null && legsFor > legsAgainst;
      return result === "W" ? won : !won;
    });
  }

  if (q) {
    const lowerQ = q.toLowerCase();
    resultRows = resultRows.filter(
      (m) =>
        m.player1.name.toLowerCase().includes(lowerQ) ||
        m.player2.name.toLowerCase().includes(lowerQ) ||
        m.matchDate.includes(lowerQ),
    );
  }

  return NextResponse.json({
    total: count ?? resultRows.length,
    page,
    limit,
    matches: resultRows,
  });
}
