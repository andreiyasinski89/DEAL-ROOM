import type { Outcome, Scenario } from "../engine/types";

export type Progress = Record<string, Outcome>;

/** Cases of the previous level that must be completed (sale or partial) to unlock a level. */
export const UNLOCK_N = 3;

const RANK: Record<Outcome, number> = { lost: 0, partial: 1, sale: 2 };
const KEY = "dr_progress";

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return raw && typeof raw === "object" ? (raw as Progress) : {};
  } catch {
    return {};
  }
}

export function recordResult(p: Progress, id: string, outcome: Outcome): Progress {
  const prev = p[id];
  const next = prev && RANK[prev] >= RANK[outcome] ? p : { ...p, [id]: outcome };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  return next;
}

export function isLevelUnlocked(level: number, scenarios: Scenario[], p: Progress, free: boolean): boolean {
  if (free || level <= 1) return true;
  const prev = scenarios.filter((s) => s.level === level - 1);
  const done = prev.filter((s) => p[s.id] === "sale" || p[s.id] === "partial").length;
  return done >= Math.min(UNLOCK_N, prev.length);
}
