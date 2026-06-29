import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  requireAdmin,
  isAuthError,
  errorResponse,
  validationError,
  requireNumericParam,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { nonEmptyName } from "@/lib/validation";

const PlayerUpdateBody = z.object({ name: nonEmptyName });

/**
 * Handles PATCH requests to update a player's name (admin only).
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "player ID");
  if (param instanceof NextResponse) return param;
  const playerId = param.id;

  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = PlayerUpdateBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("players")
    .update({ name: parsed.data.name })
    .eq("id", playerId)
    .select("id, name, slug")
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data);
}

/**
 * Handles DELETE requests to remove a player (admin only).
 *
 * @param _req - The incoming request.
 * @param context - Route context.
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const param = requireNumericParam(id, "player ID");
  if (param instanceof NextResponse) return param;
  const playerId = param.id;

  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId);

  if (error) return errorResponse(error);

  return new NextResponse(null, { status: 204 });
}
