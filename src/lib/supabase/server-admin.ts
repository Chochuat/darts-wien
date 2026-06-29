import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

/**
 * Creates a Supabase server client that uses the secret key (`sb_secret_...`)
 * and bypasses RLS via the `service_role` Postgres role. Use this ONLY in
 * Route Handlers / Server Actions for admin write operations. Never expose
 * this client to the browser (the key must not be prefixed with NEXT_PUBLIC_).
 *
 * Authorization (is the caller an admin/scorekeeper?) is enforced separately
 * via `requireAdmin` / `requireScorekeeper` in `@/lib/api-utils`, which reads
 * the user's session from the cookie store.
 *
 * @throws if `SUPABASE_SECRET_KEY` or `NEXT_PUBLIC_SUPABASE_URL` is not set.
 */
export function createAdminClient() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createSupabaseClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
