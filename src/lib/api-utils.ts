import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export function parseNumericParam(value: string): number | null {
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

export function requireNumericParam(
  value: string,
  label: string,
): { id: number } | NextResponse {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return NextResponse.json(
      { error: `Invalid ${label}` },
      { status: 400 },
    ) as NextResponse;
  }
  return { id: num };
}

export function errorResponse(error: unknown, status = 500) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}

export function validationError(issues: unknown) {
  return NextResponse.json(
    { error: "Validation failed", details: issues },
    { status: 400 },
  );
}
