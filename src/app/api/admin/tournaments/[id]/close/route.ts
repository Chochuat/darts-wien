import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  requireAdmin,
  isAuthError,
  errorResponse,
  requireNumericParam,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";

/**
 * Handles POST requests to close a tournament (manual completion).
 * Requires all matches to be completed/no_show.
 *
 * @param _req - The incoming request.
 * @param context - Route context.
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "tournament ID");
  if (param instanceof NextResponse) return param;
  const tournamentId = param.id;

  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const supabase = createAdminClient();

  const { data: pendingMatches } = await supabase
    .from("matches")
    .select("id")
    .eq("tournament_id", tournamentId)
    .eq("status", "pending");

  if (pendingMatches && pendingMatches.length > 0) {
    return NextResponse.json(
      { error: `${pendingMatches.length} match(es) still pending` },
      { status: 409 },
    );
  }

  // Determine winner from the Final match.
  const { data: finalMatch } = await supabase
    .from("matches")
    .select("player1_id, player2_id, legs_player1, legs_player2")
    .eq("tournament_id", tournamentId)
    .eq("match_type", "tournament_playoff")
    .eq("tournament_round_name", "Final")
    .single();

  let winnerPlayerId: number | null = null;
  if (finalMatch) {
    winnerPlayerId =
      (finalMatch.legs_player1 ?? 0) > (finalMatch.legs_player2 ?? 0)
        ? finalMatch.player1_id
        : finalMatch.player2_id;
  }

  const { error } = await supabase
    .from("tournaments")
    .update({
      status: "completed",
      winner_player_id: winnerPlayerId,
    })
    .eq("id", tournamentId);

  if (error) return errorResponse(error);

  return NextResponse.json({ success: true, winnerPlayerId });
}
