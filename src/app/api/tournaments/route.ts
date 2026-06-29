import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, validationError } from "@/lib/api-utils";
import { TournamentListQuery, TournamentCreateBody } from "@/lib/validation";

/**
 * Handles GET requests for tournament listings.
 *
 * @param req - The incoming request.
 */
export async function GET(req: NextRequest) {
  const supabase = await getSupabase();

  const { searchParams } = new URL(req.url);
  const parsed = TournamentListQuery.safeParse(
    Object.fromEntries(searchParams),
  );
  if (!parsed.success) return validationError(parsed.error.issues);
  const params = parsed.data;

  let query = supabase
    .from("tournaments")
    .select(
      "id, week_number, date, type, status, winner_player_id, generation_type, num_groups, season_id",
    )
    .order("week_number");

  if (params.seasonId) {
    query = query.eq("season_id", params.seasonId);
  }

  const { data: tournaments, error } = await query;

  if (error) return errorResponse(error);

  const tournamentList = tournaments ?? [];
  const tournamentIds = tournamentList.map((t) => t.id);
  const winnerIds = tournamentList
    .map((t) => t.winner_player_id)
    .filter((id): id is number => id != null);

  const idsForIn = tournamentIds.length ? tournamentIds : [0];

  const [registrationsRes, matchesRes, winnersRes] = await Promise.all([
    supabase
      .from("tournament_registrations")
      .select("tournament_id")
      .eq("checked_in", true)
      .in("tournament_id", idsForIn),
    supabase
      .from("matches")
      .select("tournament_id, match_type, player1_180, player2_180")
      .in("tournament_id", idsForIn),
    winnerIds.length
      ? supabase
          .from("players")
          .select("id, name, slug")
          .in("id", winnerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const regCountByTournament = new Map<number, number>();
  for (const r of registrationsRes.data ?? []) {
    const tid = r.tournament_id;
    regCountByTournament.set(tid, (regCountByTournament.get(tid) ?? 0) + 1);
  }

  const groupMatchCountByTournament = new Map<number, number>();
  const playoffMatchCountByTournament = new Map<number, number>();
  const total180sByTournament = new Map<number, number>();
  for (const m of matchesRes.data ?? []) {
    const tid = m.tournament_id;
    if (m.match_type === "tournament_group") {
      groupMatchCountByTournament.set(
        tid,
        (groupMatchCountByTournament.get(tid) ?? 0) + 1,
      );
    } else if (m.match_type === "tournament_playoff") {
      playoffMatchCountByTournament.set(
        tid,
        (playoffMatchCountByTournament.get(tid) ?? 0) + 1,
      );
    }
    total180sByTournament.set(
      tid,
      (total180sByTournament.get(tid) ?? 0) +
        (m.player1_180 ?? 0) +
        (m.player2_180 ?? 0),
    );
  }

  const winnerMap = new Map(
    (winnersRes.data ?? []).map((p) => [p.id, p]),
  );

  const result = tournamentList.map((t) => ({
    id: t.id,
    weekNumber: t.week_number,
    date: t.date,
    type: t.type,
    status: t.status,
    winner: t.winner_player_id != null
      ? (winnerMap.get(t.winner_player_id) ?? null)
      : null,
    generationType: t.generation_type,
    playerCount: regCountByTournament.get(t.id) ?? 0,
    groupMatchCount: groupMatchCountByTournament.get(t.id) ?? 0,
    playoffMatchCount: playoffMatchCountByTournament.get(t.id) ?? 0,
    total180s: total180sByTournament.get(t.id) ?? 0,
  }));

  return NextResponse.json({ tournaments: result });
}

/**
 * Handles POST requests to create a new tournament.
 *
 * @param req - The incoming request.
 */
export async function POST(req: NextRequest) {
  const supabase = await getSupabase();

  const body = await req.json();
  const parsed = TournamentCreateBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);
  const b = parsed.data;

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      season_id: b.seasonId,
      week_number: b.weekNumber,
      date: b.date,
      type: b.type,
      num_groups: b.type === "grand_final" ? null : (b.numGroups ?? null),
    })
    .select()
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data, { status: 201 });
}
