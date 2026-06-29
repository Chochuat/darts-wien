import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/api-utils";
import { ResetPasswordBody } from "@/lib/validation";

/**
 * Handles POST requests to set a new password after a reset email link.
 *
 * @param req - The incoming request.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ResetPasswordBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = await getSupabase();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
