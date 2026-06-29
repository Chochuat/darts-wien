import { NextResponse } from "next/server";
import { getSupabase, getSessionProfile } from "@/lib/api-utils";
import { AdminSessionResponse } from "@/lib/validation";

/** Handles GET requests to return the current user's session + profile. */
export async function GET() {
  const session = await getSessionProfile();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const response = {
    userId: session.userId,
    role: session.role,
    playerId: session.playerId,
    displayName: session.displayName,
  };

  const parsed = AdminSessionResponse.safeParse(response);
  if (!parsed.success) {
    return NextResponse.json({ error: "Session data invalid" }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
