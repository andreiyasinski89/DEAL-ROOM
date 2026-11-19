import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both variables are set. Known statically, so screens can decide what to show without waiting. */
export const cloudConfigured = Boolean(url && key);

/**
 * The client (about 100 KB) is loaded on demand, after the first screen, never on the critical path.
 * Without the variables the app runs fully offline on local history.
 * Only the public anon key is ever used in the browser; access is enforced by Row Level Security.
 *
 * `supabase` is a live binding: it is null until `ensureSupabase()` has resolved. Code that needs it
 * after a sign-in can read it directly (a signed-in user implies the client exists).
 */
export let supabase: SupabaseClient | null = null;

let pending: Promise<SupabaseClient | null> | null = null;

export function ensureSupabase(): Promise<SupabaseClient | null> {
  if (!cloudConfigured) return Promise.resolve(null);
  pending ??= import("@supabase/supabase-js").then(({ createClient }) => {
    supabase = createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    return supabase;
  });
  return pending;
}
