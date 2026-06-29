import { NextResponse } from "next/server";
import {
  requireAdmin,
  isAuthError,
  errorResponse,
  validationError,
} from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { ClubSettingsRow, ClubSettingsBody } from "@/lib/validation";

/**
 * Handles GET requests to fetch the club settings.
 */
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("club_settings")
    .select("id, tiebreaker_order, updated_at")
    .eq("id", 1)
    .single();

  if (error) return errorResponse(error);

  const parsed = ClubSettingsRow.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid club settings data" }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}

/**
 * Handles PATCH requests to update the tiebreaker order (admin only).
 *
 * @param req - The incoming request.
 */
export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const parsed = ClubSettingsBody.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("club_settings")
    .update({
      tiebreaker_order: parsed.data.tiebreakerOrder,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)
    .select("id, tiebreaker_order, updated_at")
    .single();

  if (error) return errorResponse(error);

  return NextResponse.json(data);
}
