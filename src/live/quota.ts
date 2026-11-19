import { LIMITS } from "../../supabase/functions/_shared/limits.ts";
import { ensureSupabase } from "../features/account/supabase";

export type Quota = { sessionsLeft: number; sessionsMax: number; turnsLeft: number; turnsMax: number };

type Raw = { ok?: boolean; sessions_left?: number; turns_left?: number };

/** Turns the database answer into a Quota; anything unexpected gives null (no badge, no error shown). */
export function parseQuota(raw: unknown): Quota | null {
  const r = raw as Raw | null;
  if (!r || r.ok !== true || typeof r.sessions_left !== "number" || typeof r.turns_left !== "number") return null;
  return {
    sessionsLeft: Math.max(0, Math.min(LIMITS.sessionsPerDay, r.sessions_left)),
    sessionsMax: LIMITS.sessionsPerDay,
    turnsLeft: Math.max(0, r.turns_left),
    turnsMax: LIMITS.turnsPerDay,
  };
}

/**
 * Remaining live games today. Never throws: if the cloud is off, the user is signed out, or the
 * migration 005_ai_status.sql has not been run yet, it returns null and the badge simply stays hidden.
 */
export async function fetchQuota(): Promise<Quota | null> {
  try {
    const client = await ensureSupabase();
    if (!client) return null;
    const { data, error } = await client.rpc("ai_status", { p_max_sessions: LIMITS.sessionsPerDay, p_max_turns: LIMITS.turnsPerDay });
    return error ? null : parseQuota(data);
  } catch {
    return null;
  }
}

export type QuotaTone = "ok" | "low" | "empty";

/** How the badge looks: normal, "running low" (3 or fewer games, or under a quarter of the turns), or empty. */
export function quotaTone(q: Quota): QuotaTone {
  if (q.sessionsLeft === 0 || q.turnsLeft === 0) return "empty";
  if (q.sessionsLeft <= 3 || q.turnsLeft < q.turnsMax / 4) return "low";
  return "ok";
}

/** When the counters reset: the next UTC midnight (the database day), as a local time of day. */
export function nextResetLocal(now = new Date(), locale?: string): string {
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return next.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}
