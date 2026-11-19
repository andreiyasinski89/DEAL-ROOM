import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeRecords, type SessionRecord } from "../../engine/profile";

const KEY = "dr_sessions";

export function loadLocal(): SessionRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocal(records: SessionRecord[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records));
  } catch {
    /* private mode or quota */
  }
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

type Row = {
  client_id: string;
  scenario_id: string;
  level: number;
  outcome: SessionRecord["outcome"];
  score: number;
  turns: number;
  duration_sec: number;
  hints_used: number;
  moves: SessionRecord["moves"];
  played_at: string;
};

const toRow = (userId: string, r: SessionRecord) => ({
  client_id: r.id,
  user_id: userId,
  scenario_id: r.scenarioId,
  level: r.level,
  outcome: r.outcome,
  score: r.score,
  turns: r.turns,
  duration_sec: r.durationSec,
  hints_used: r.hintsUsed,
  moves: r.moves,
  played_at: r.at,
});

const fromRow = (r: Row): SessionRecord => ({
  id: r.client_id,
  scenarioId: r.scenario_id,
  level: r.level,
  outcome: r.outcome,
  score: r.score,
  turns: r.turns,
  durationSec: r.duration_sec,
  hintsUsed: r.hints_used,
  at: r.played_at,
  moves: r.moves ?? [],
});

export type SyncResult = { records: SessionRecord[]; uploaded: number; error?: string };

/**
 * Two-way sync: uploads local games the cloud does not have (idempotent on client_id),
 * then returns the merged list. Never throws: on any error the local list is returned.
 */
export async function syncSessions(client: SupabaseClient, userId: string, local: SessionRecord[]): Promise<SyncResult> {
  try {
    const { data, error } = await client.from("sessions").select("*").eq("user_id", userId).order("played_at", { ascending: true });
    if (error) throw error;
    const remote = (data as Row[]).map(fromRow);
    const have = new Set(remote.map((r) => r.id));
    const missing = local.filter((r) => !have.has(r.id));
    if (missing.length) {
      const { error: upErr } = await client.from("sessions").upsert(missing.map((r) => toRow(userId, r)), { onConflict: "user_id,client_id", ignoreDuplicates: true });
      if (upErr) throw upErr;
    }
    return { records: mergeRecords(local, remote), uploaded: missing.length };
  } catch (e) {
    return { records: local, uploaded: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function uploadSession(client: SupabaseClient, userId: string, r: SessionRecord): Promise<string | undefined> {
  const { error } = await client.from("sessions").upsert(toRow(userId, r), { onConflict: "user_id,client_id", ignoreDuplicates: true });
  return error?.message;
}

export async function uploadAchievements(client: SupabaseClient, userId: string, keys: string[]): Promise<string | undefined> {
  if (!keys.length) return undefined;
  const { error } = await client
    .from("achievements")
    .upsert(keys.map((key) => ({ user_id: userId, key })), { onConflict: "user_id,key", ignoreDuplicates: true });
  return error?.message;
}
