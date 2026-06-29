import { NextResponse } from "next/server";
import { requireAdmin, isAuthError, errorResponse } from "@/lib/api-utils";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { ProfileRow } from "@/lib/validation";

/** Handles GET requests to list all profiles (admin only). */
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, role, player_id, display_name, created_at")
    .order("created_at", { ascending: false });

  if (error) return errorResponse(error);

  const profiles = (data ?? []).map((p) => ProfileRow.parse(p));
  return NextResponse.json({ profiles });
}
