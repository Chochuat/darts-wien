import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/api-utils";
import { ForgotPasswordBody } from "@/lib/validation";

/**
 * Handles POST requests to send a password reset email.
 *
 * @param req - The incoming request.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ForgotPasswordBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = await getSupabase();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/reset-password`,
    },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
