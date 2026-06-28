import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;


/** Creates a Supabase browser client for client-side usage. */
export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );