import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  requireAdmin,
  isAuthError,
  errorResponse,
  validationError,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { ProfileUpdateBody } from "@/lib/validation";

/**
 * Handles PATCH requests to update a profile (promote/demote, link player).
 *
 * @param req - The incoming request.
 * @param context - Route context.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params;
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = ProfileUpdateBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const updates: Record<string, unknown> = {};
  if (parsed.data.role !== undefined) updates.role = parsed.data.role;
  if (parsed.data.playerId !== undefined) updates.player_id = parsed.data.playerId;
  if (parsed.data.displayName !== undefined) updates.display_name = parsed.data.displayName;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId)
    .select("user_id, role, player_id, display_name, created_at")
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data);
}
