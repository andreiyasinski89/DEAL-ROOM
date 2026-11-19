import { describe, expect, it } from "vitest";
import { allScenarios } from "../content";
import {
  ACHIEVEMENTS, dailyCase, dailyDone, dayKey, levelStats, longestStreak, makeRecord, mergeRecords, rankFor,
  recommend, streakDays, tagStats, totalPoints, unlockedAchievements, type SessionRecord,
} from "./profile";
import { applyChoice, createState } from "./engine";

const sc = allScenarios.find((s) => s.id.startsWith("member_elite-l1"))!;

const rec = (over: Partial<SessionRecord> = {}): SessionRecord => ({
  id: Math.random().toString(36).slice(2),
  scenarioId: sc.id,
  level: 1,
  outcome: "sale",
  score: 100,
  turns: 5,
  durationSec: 60,
  hintsUsed: 0,
  at: "2026-11-10T10:00:00.000Z",
  moves: [],
  ...over,
});

describe("rank", () => {
  it("maps points to the six ranks with progress", () => {
    expect(rankFor(0).name).toBe("TRAINEE");
    expect(rankFor(149).name).toBe("TRAINEE");
    expect(rankFor(150).name).toBe("JUNIOR");
    expect(rankFor(1200).name).toBe("PRO");
    expect(rankFor(9999)).toMatchObject({ name: "LEGEND", next: null, progress: 1 });
    expect(rankFor(75)).toMatchObject({ next: "JUNIOR", toNext: 75 });
    expect(rankFor(75).progress).toBeCloseTo(0.5);
  });
});

describe("makeRecord", () => {
  it("captures score, moves and timing from a finished game", () => {
    const st = applyChoice(sc, createState(sc), "a");
    const r = makeRecord(sc, st, "partial", 42, "x1", new Date("2026-11-18T09:00:00Z"));
    expect(r).toMatchObject({ id: "x1", scenarioId: sc.id, level: 1, outcome: "partial", turns: 1, durationSec: 42, hintsUsed: 0 });
    expect(r.moves).toEqual([{ nodeId: "open", quality: "excellent" }]);
    expect(r.score).toBe(60);
  });
});

describe("streaks and daily case", () => {
  const now = new Date("2026-11-18T12:00:00");
  const at = (d: string) => `${d}T12:00:00`;
  it("counts consecutive days back from today or yesterday", () => {
    expect(streakDays([], now)).toBe(0);
    expect(streakDays([rec({ at: at("2026-11-18") }), rec({ at: at("2026-11-17") }), rec({ at: at("2026-11-16") })], now)).toBe(3);
    expect(streakDays([rec({ at: at("2026-11-18") }), rec({ at: at("2026-11-16") })], now)).toBe(1);
    expect(streakDays([rec({ at: at("2026-11-17") }), rec({ at: at("2026-11-16") })], now)).toBe(2);
    expect(streakDays([rec({ at: at("2026-11-14") })], now)).toBe(0);
  });
  it("longest streak ignores gaps", () => {
    const rs = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-07", "2026-11-08"].map((d) => rec({ at: at(d) }));
    expect(longestStreak(rs)).toBe(3);
  });
  it("daily case is stable per day, varies by day, and done-check works", () => {
    const a = dailyCase(allScenarios, now);
    expect(dailyCase(allScenarios, now).id).toBe(a.id);
    const ids = new Set(Array.from({ length: 20 }, (_, i) => dailyCase(allScenarios, new Date(2026, 10, 1 + i)).id));
    expect(ids.size).toBeGreaterThan(10);
    expect(dailyDone([rec({ scenarioId: a.id, at: at("2026-11-18") })], a, now)).toBe(true);
    expect(dailyDone([rec({ scenarioId: a.id, at: at("2026-11-17") })], a, now)).toBe(false);
    expect(dayKey(now)).toBe("2026-11-18");
  });
});

describe("level stats and points", () => {
  it("aggregates per level", () => {
    const rs = [rec(), rec({ outcome: "lost", score: 10 }), rec({ level: 2, outcome: "partial", score: 50 })];
    const ls = levelStats(rs);
    expect(ls[0]).toMatchObject({ played: 2, sale: 1, lost: 1, winRate: 0.5 });
    expect(ls[1]).toMatchObject({ played: 1, partial: 1, winRate: 0 });
    expect(ls[4].played).toBe(0);
    expect(totalPoints(rs)).toBe(160);
  });
});

describe("weak spots and recommendations", () => {
  const nodeWithTag = Object.values(sc.nodes).find((n) => n.type === "client" && n.tag && !n.id.endsWith("_r"))!;
  const tag = (nodeWithTag as { tag: string }).tag;
  const bad = rec({ outcome: "lost", moves: [{ nodeId: nodeWithTag.id, quality: "critical_error" }, { nodeId: nodeWithTag.id, quality: "weak" }] });
  const good = rec({ moves: [{ nodeId: nodeWithTag.id, quality: "excellent" }] });

  it("computes the failure rate per objection tag", () => {
    const ts = tagStats([bad, good], allScenarios);
    expect(ts[0]).toMatchObject({ tag, good: 1, bad: 2, attempts: 3 });
    expect(ts[0].failRate).toBeCloseTo(2 / 3);
  });

  it("ignores moves on untagged nodes and unknown scenarios", () => {
    expect(tagStats([rec({ scenarioId: "nope", moves: [{ nodeId: "x", quality: "weak" }] })], allScenarios)).toEqual([]);
    expect(tagStats([rec({ moves: [{ nodeId: "close", quality: "weak" }] })], allScenarios)).toEqual([]);
  });

  it("recommends unwon cases that contain the weakest tag", () => {
    const rs = recommend([bad], allScenarios);
    expect(rs.length).toBeGreaterThan(0);
    expect(rs[0].tag).toBe(tag);
    for (const c of rs[0].cases) expect(c.objectionTags).toContain(tag);
    expect(rs[0].cases.length).toBeLessThanOrEqual(3);
  });

  it("recommends nothing without enough data or without failures", () => {
    expect(recommend([good], allScenarios)).toEqual([]);
    expect(recommend([], allScenarios)).toEqual([]);
  });

  it("skips cases the player already won", () => {
    const wonIds = new Set(recommend([bad], allScenarios)[0].cases.map((c) => c.id));
    const wins = [...wonIds].map((id) => rec({ scenarioId: id, outcome: "sale" }));
    const after = recommend([bad, ...wins], allScenarios);
    for (const r of after) for (const c of r.cases) expect(wonIds.has(c.id)).toBe(false);
  });
});

describe("achievements", () => {
  it("has unique keys", () => {
    expect(new Set(ACHIEVEMENTS.map((a) => a.key)).size).toBe(ACHIEVEMENTS.length);
  });
  it("unlocks by conditions", () => {
    expect(unlockedAchievements([])).toEqual([]);
    const one = unlockedAchievements([rec({ moves: [{ nodeId: "a", quality: "good" }] })]);
    expect(one).toContain("first_sale");
    expect(one).toContain("clean_sale");
    expect(unlockedAchievements([rec({ moves: [{ nodeId: "a", quality: "weak" }] })])).not.toContain("clean_sale");
    expect(unlockedAchievements([rec({ level: 5 })])).toEqual(expect.arrayContaining(["practitioner", "shark_bite"]));
    const five = Array.from({ length: 5 }, (_, i) => rec({ at: `2026-11-0${i + 1}T10:00:00.000Z` }));
    expect(unlockedAchievements(five)).toEqual(expect.arrayContaining(["five_sales", "no_hints"]));
  });
  it("combo_5 needs five good moves in a row", () => {
    const g = (n: number) => Array.from({ length: n }, () => ({ nodeId: "a", quality: "good" as const }));
    expect(unlockedAchievements([rec({ moves: g(5) })])).toContain("combo_5");
    expect(unlockedAchievements([rec({ moves: [...g(4), { nodeId: "a", quality: "weak" }, ...g(4)] })])).not.toContain("combo_5");
  });
  it("comeback: win after losing the same case", () => {
    const lost = rec({ outcome: "lost", at: "2026-11-01T10:00:00.000Z" });
    const won = rec({ at: "2026-11-02T10:00:00.000Z" });
    expect(unlockedAchievements([lost, won])).toContain("comeback");
    expect(unlockedAchievements([won, rec({ outcome: "lost", at: "2026-11-03T10:00:00.000Z" })])).not.toContain("comeback");
  });
  it("all_levels needs a sale on each level", () => {
    const rs = [1, 2, 3, 4, 5].map((level) => rec({ level }));
    expect(unlockedAchievements(rs)).toContain("all_levels");
    expect(unlockedAchievements(rs.slice(0, 4))).not.toContain("all_levels");
  });
});

describe("mergeRecords", () => {
  it("dedupes by id and sorts by time", () => {
    const a = rec({ id: "1", at: "2026-11-02T00:00:00.000Z" });
    const b = rec({ id: "2", at: "2026-11-01T00:00:00.000Z" });
    const merged = mergeRecords([a], [a, b]);
    expect(merged.map((r) => r.id)).toEqual(["2", "1"]);
  });
});
