import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  requireAdmin,
  isAuthError,
  errorResponse,
  validationError,
  requireNumericParam,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { TournamentFormatBody, TournamentFormatRow } from "@/lib/validation";

/**
 * Handles GET requests to fetch the tournament format config.
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

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tournament_format")
    .select("tournament_id, phase, legs_target, starting_score, max_throws")
    .eq("tournament_id", tournamentId);

  if (error) return errorResponse(error);

  const rows = (data ?? []).map((r) => TournamentFormatRow.parse(r));
  return NextResponse.json({ formats: rows });
}

/**
 * Handles PUT requests to set the tournament format config (replaces all entries).
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "tournament ID");
  if (param instanceof NextResponse) return param;
  const tournamentId = param.id;

  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = TournamentFormatBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = createAdminClient();

  // Delete existing entries, then insert new ones.
  await supabase
    .from("tournament_format")
    .delete()
    .eq("tournament_id", tournamentId);

  const inserts = parsed.data.entries.map((e) => ({
    tournament_id: tournamentId,
    phase: e.phase,
    legs_target: e.legsTarget,
    starting_score: e.startingScore,
    max_throws: e.maxThrows,
  }));

  const { data, error } = await supabase
    .from("tournament_format")
    .insert(inserts)
    .select("tournament_id, phase, legs_target, starting_score, max_throws");

  if (error) return errorResponse(error);

  const rows = (data ?? []).map((r) => TournamentFormatRow.parse(r));
  return NextResponse.json({ formats: rows });
}
