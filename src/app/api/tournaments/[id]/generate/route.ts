import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase, errorResponse, validationError, requireNumericParam } from "@/lib/api-utils";
import { TournamentGenerateBody } from "@/lib/validation";

/**
 * Handles POST requests to generate tournament groups and matches.
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
  const parsed = TournamentGenerateBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = await getSupabase();

  const { error } = await supabase
    .from("tournaments")
    .update({
      status: "ready",
      generation_type: parsed.data.generationType,
    })
    .eq("id", tournamentId);

  if (error) return errorResponse(error);

  return NextResponse.json({ success: true });
}
