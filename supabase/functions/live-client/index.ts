// Supabase Edge Function (Deno): "Live client" mode.
// Secrets (set with `supabase secrets set`, never in the app): ANTHROPIC_API_KEY, optional CLAUDE_MODEL.
// SUPABASE_URL and SUPABASE_ANON_KEY are provided by the platform.
import { createClient } from "npm:@supabase/supabase-js@2";
import { handleLive } from "../_shared/handler.ts";
import { LIMITS } from "../_shared/live.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const anon = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve((req) =>
  handleLive(req, {
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    model: Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-5-5",
    fetchFn: fetch,
    // verify the user's token ourselves (works with legacy and new signing keys)
    getUser: async (jwt) => {
      const { data, error } = await createClient(url, anon).auth.getUser(jwt);
      return error || !data.user ? null : { id: data.user.id };
    },
    // daily quota is enforced in the database with the caller's own identity (RLS-style, no service key)
    consume: async (jwt, newSession) => {
      const db = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
      const { data, error } = await db.rpc("ai_consume", {
        p_new_session: newSession,
        // the limits live in one place (LIMITS) and are passed explicitly, so changing them needs only a redeploy
        p_max_sessions: LIMITS.sessionsPerDay,
        p_max_turns: LIMITS.turnsPerDay,
      });
      if (error || !data) return { allowed: false, reason: "quota_check_failed" };
      return { allowed: !!data.allowed, reason: data.reason ?? undefined, sessionsLeft: data.sessions_left ?? undefined };
    },
  }),
);
