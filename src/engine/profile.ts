import type { GameState, Outcome, Quality, Scenario } from "./types";
import { computeScore } from "./engine";
import { T } from "../i18n";

/** One played game, as stored locally and in the cloud (`sessions` table). */
export type SessionRecord = {
  /** Client-generated id: makes cloud sync idempotent. */
  id: string;
  scenarioId: string;
  level: number;
  outcome: Outcome;
  score: number;
  turns: number;
  durationSec: number;
  hintsUsed: number;
  /** ISO timestamp. */
  at: string;
  moves: { nodeId: string; quality: Quality }[];
};

export function makeRecord(s: Scenario, state: GameState, outcome: Outcome, durationSec: number, id: string, at = new Date()): SessionRecord {
  return {
    id,
    scenarioId: s.id,
    level: s.level,
    outcome,
    score: computeScore(state, outcome).total,
    turns: state.history.length,
    durationSec,
    hintsUsed: state.hintsUsed,
    at: at.toISOString(),
    moves: state.history.map((h) => ({ nodeId: h.nodeId, quality: h.quality })),
  };
}

/* ---------------- ranks ---------------- */
export const RANKS = [
  { name: "TRAINEE", min: 0 },
  { name: "JUNIOR", min: 150 },
  { name: "CLOSER", min: 500 },
  { name: "PRO", min: 1200 },
  { name: "SHARK", min: 2500 },
  { name: "LEGEND", min: 5000 },
] as const;

export function rankFor(points: number) {
  let i = 0;
  RANKS.forEach((r, k) => {
    if (points >= r.min) i = k;
  });
  const next = RANKS[i + 1];
  return {
    name: RANKS[i].name,
    index: i,
    next: next?.name ?? null,
    toNext: next ? next.min - points : 0,
    progress: next ? (points - RANKS[i].min) / (next.min - RANKS[i].min) : 1,
  };
}

/* ---------------- dates ---------------- */
export const dayKey = (d: Date | string) => {
  const x = typeof d === "string" ? new Date(d) : d;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
};

/** Consecutive days with at least one game, counting back from today (or yesterday if today is empty). */
export function streakDays(records: SessionRecord[], now = new Date()): number {
  const days = new Set(records.map((r) => dayKey(r.at)));
  const cur = new Date(now);
  if (!days.has(dayKey(cur))) cur.setDate(cur.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(cur))) {
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

/** Deterministic "case of the day". */
export function dailyCase(scenarios: Scenario[], now = new Date()): Scenario {
  const key = dayKey(now);
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return scenarios[(h >>> 0) % scenarios.length];
}

export const dailyDone = (records: SessionRecord[], daily: Scenario, now = new Date()) =>
  records.some((r) => r.scenarioId === daily.id && dayKey(r.at) === dayKey(now));

/* ---------------- stats ---------------- */
export type TagStat = { tag: string; good: number; bad: number; attempts: number; failRate: number };

/** Per-objection results from the quality of every move made on a node tagged with it. */
export function tagStats(records: SessionRecord[], scenarios: Scenario[]): TagStat[] {
  const byId = new Map(scenarios.map((s) => [s.id, s]));
  const acc = new Map<string, { good: number; bad: number }>();
  for (const r of records) {
    const s = byId.get(r.scenarioId);
    if (!s) continue;
    for (const m of r.moves) {
      const n = s.nodes[m.nodeId];
      if (!n || n.type !== "client" || !n.tag) continue;
      const e = acc.get(n.tag) ?? { good: 0, bad: 0 };
      if (m.quality === "excellent" || m.quality === "good") e.good++;
      else if (m.quality === "weak" || m.quality === "critical_error") e.bad++;
      acc.set(n.tag, e);
    }
  }
  return [...acc.entries()]
    .map(([tag, e]) => ({ tag, ...e, attempts: e.good + e.bad, failRate: e.good + e.bad ? e.bad / (e.good + e.bad) : 0 }))
    .filter((t) => t.attempts > 0)
    .sort((a, b) => b.failRate - a.failRate || b.attempts - a.attempts);
}

export type LevelStat = { level: number; played: number; sale: number; partial: number; lost: number; winRate: number };

export function levelStats(records: SessionRecord[]): LevelStat[] {
  return [1, 2, 3, 4, 5].map((level) => {
    const rs = records.filter((r) => r.level === level);
    const sale = rs.filter((r) => r.outcome === "sale").length;
    const partial = rs.filter((r) => r.outcome === "partial").length;
    return { level, played: rs.length, sale, partial, lost: rs.length - sale - partial, winRate: rs.length ? sale / rs.length : 0 };
  });
}

export type Recommendation = { tag: string; failRate: number; cases: Scenario[] };

/** "Practise <tag> — here are cases": weakest objections first, cases you have not won yet. */
export function recommend(records: SessionRecord[], scenarios: Scenario[], opts: { minAttempts?: number; maxTags?: number; perTag?: number } = {}): Recommendation[] {
  const { minAttempts = 2, maxTags = 3, perTag = 3 } = opts;
  const won = new Set(records.filter((r) => r.outcome === "sale").map((r) => r.scenarioId));
  const maxLevel = Math.max(1, ...records.map((r) => r.level));
  const out: Recommendation[] = [];
  for (const t of tagStats(records, scenarios)) {
    if (out.length >= maxTags) break;
    if (t.attempts < minAttempts || t.failRate <= 0) continue;
    const cases = scenarios
      .filter((s) => s.objectionTags.includes(t.tag as never) && !won.has(s.id) && s.level <= maxLevel + 1)
      .sort((a, b) => a.level - b.level)
      .slice(0, perTag);
    if (cases.length) out.push({ tag: t.tag, failRate: t.failRate, cases });
  }
  return out;
}

/* ---------------- achievements ---------------- */
export type Achievement = { key: string; title: string; description: string; test: (r: SessionRecord[]) => boolean };

const wins = (r: SessionRecord[]) => r.filter((x) => x.outcome === "sale");
const clean = (x: SessionRecord) => x.moves.every((m) => m.quality !== "weak" && m.quality !== "critical_error");

export const ACHIEVEMENTS: Achievement[] = [
  { key: "first_sale", title: T("Первая продажа"), description: T("Закройте любой кейс продажей."), test: (r) => wins(r).length >= 1 },
  { key: "five_sales", title: T("Пятёрка"), description: T("Пять успешных продаж."), test: (r) => wins(r).length >= 5 },
  { key: "clean_sale", title: T("Чистая работа"), description: T("Продажа без единого слабого хода и ошибки."), test: (r) => wins(r).some(clean) },
  { key: "no_hints", title: T("Сам с усами"), description: T("Три продажи подряд без подсказок."), test: (r) => {
    let run = 0;
    for (const x of [...r].sort((a, b) => a.at.localeCompare(b.at))) {
      run = x.outcome === "sale" && x.hintsUsed === 0 ? run + 1 : 0;
      if (run >= 3) return true;
    }
    return false;
  } },
  { key: "combo_5", title: T("Комбо x5"), description: T("Пять хороших ходов подряд в одной игре."), test: (r) => r.some((x) => {
    let run = 0;
    for (const m of x.moves) {
      run = m.quality === "excellent" || m.quality === "good" ? run + 1 : 0;
      if (run >= 5) return true;
    }
    return false;
  }) },
  { key: "practitioner", title: T("Практик"), description: T("Выиграйте кейс уровня 3 или выше."), test: (r) => wins(r).some((x) => x.level >= 3) },
  { key: "shark_bite", title: T("Укус акулы"), description: T("Выиграйте кейс уровня 5."), test: (r) => wins(r).some((x) => x.level === 5) },
  { key: "all_levels", title: T("Все уровни"), description: T("Хотя бы по одной продаже на каждом из 5 уровней."), test: (r) => [1, 2, 3, 4, 5].every((l) => wins(r).some((x) => x.level === l)) },
  { key: "comeback", title: T("Камбэк"), description: T("Выиграйте кейс, который раньше проиграли."), test: (r) => {
    const sorted = [...r].sort((a, b) => a.at.localeCompare(b.at));
    const lost = new Set<string>();
    for (const x of sorted) {
      if (x.outcome === "lost") lost.add(x.scenarioId);
      else if (x.outcome === "sale" && lost.has(x.scenarioId)) return true;
    }
    return false;
  } },
  { key: "streak_3", title: T("Три дня подряд"), description: T("Играйте три дня подряд."), test: (r) => streakDays(r) >= 3 || longestStreak(r) >= 3 },
];

export function longestStreak(records: SessionRecord[]): number {
  const days = [...new Set(records.map((r) => dayKey(r.at)))].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of days) {
    const cur = new Date(`${d}T12:00:00`);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

export const unlockedAchievements = (records: SessionRecord[]) => ACHIEVEMENTS.filter((a) => a.test(records)).map((a) => a.key);

/** Merge two record lists by id (cloud wins nothing special: records are immutable). */
export function mergeRecords(a: SessionRecord[], b: SessionRecord[]): SessionRecord[] {
  const m = new Map<string, SessionRecord>();
  for (const r of [...a, ...b]) m.set(r.id, r);
  return [...m.values()].sort((x, y) => x.at.localeCompare(y.at));
}

/** Translation key of the outcome badge (translate with tr() when rendering). */
export const fmtOutcome = (o: Outcome) => (o === "sale" ? T("ПРОДАЖА") : o === "partial" ? T("ЧАСТИЧНО") : T("ПРОВАЛ"));

export const totalPoints = (records: SessionRecord[]) => records.reduce((a, r) => a + r.score, 0);
