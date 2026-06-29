import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, validationError, requireNumericParam } from "@/lib/api-utils";
import { RegistrationAddBody } from "@/lib/validation";

/**
 * Handles GET requests for tournament registrations.
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

  const { data: registrations, error } = await supabase
    .from("tournament_registrations")
    .select("player_id, checked_in, created_at")
    .eq("tournament_id", tournamentId);

  if (error) return errorResponse(error);

  const playerIds = (registrations ?? []).map((r) => r.player_id);
  const { data: players } = await supabase
    .from("players")
    .select("id, name, slug")
    .in("id", playerIds.length ? playerIds : [0]);

  const playerMap = new Map((players ?? []).map((p) => [p.id, p]));

  const entries = (registrations ?? []).map((r) => ({
    player: playerMap.get(r.player_id) ?? { id: r.player_id, name: "Unknown", slug: "unknown" },
    checkedIn: r.checked_in,
    createdAt: r.created_at,
  }));

  return NextResponse.json({ registrations: entries });
}

/**
 * Handles POST requests to register a player for a tournament.
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "tournament ID");
  if (param instanceof NextResponse) return param;
  const tournamentId = param.id;

  const body = await req.json();
  const parsed = RegistrationAddBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("tournament_registrations")
    .insert({ tournament_id: tournamentId, player_id: parsed.data.playerId })
    .select()
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data, { status: 201 });
}
