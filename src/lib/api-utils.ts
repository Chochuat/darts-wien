import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";


/** Creates a Supabase server client using the cookie store. */
export async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/**
 * Parses a string into a number, returning null if invalid.
 * @param value - The string to parse.
 */
export function parseNumericParam(value: string): number | null {
  
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

/**
 * Parses a numeric query param, returning an error response if invalid.
 * @param value - The string value to parse.
 * @param label - Human-readable name for error messages.
 */
export function requireNumericParam(
  value: string,
  label: string,
): { 
id: number } | NextResponse {
  
  const num = Number(value);
  if (Number.isNaN(num)) {
    return NextResponse.json(
      { error: `Invalid ${label}` },
      { status: 400 },
    ) as NextResponse;
  }
  return { id: num };
}

/**
 * Creates a JSON error response from an unknown error value.
 * @param error - The error to convert.
 * @param status - The HTTP status code (default 500).
 */
export function errorResponse(error: unknown, status = 500) {
  
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: message }, { status });
}

/**
 * Creates a 400 validation error response with the given issues.
 * @param issues - The validation issues to return.
 */
export function validationError(issues: unknown) {
  return NextResponse.json(
    { error: "Validation failed", details: issues },
    { status: 400 },
  );
}
