import { describe, expect, it } from "vitest";
import { completion, dueLabel, formatCode, groupAssignments, isValidCode, normalizeCode, pendingFor, rankRows, type LeaderRow, type StatusRow } from "./teams";

const row = (name: string, points: number, games = 1): LeaderRow => ({
  user_id: name, display_name: name, role: "member", points, games, wins: 0, last_played: null,
});

describe("invite codes", () => {
  it("normalises pasted codes", () => {
    expect(normalizeCode(" A1B2C-3d4e5 ")).toBe("a1b2c3d4e5");
    expect(isValidCode("A1B2C-3D4E5")).toBe(true);
    expect(isValidCode("a1b2c3d4e")).toBe(false); // 9 chars
    expect(isValidCode("zzzzzzzzzz")).toBe(false);
    expect(isValidCode("")).toBe(false);
    expect(formatCode("a1b2c3d4e5")).toBe("a1b2c-3d4e5");
    expect(formatCode("short")).toBe("short");
  });
});

describe("rankRows", () => {
  it("sorts by points, shares places on equal points, breaks ties by games then name", () => {
    const r = rankRows([row("Борис", 100, 3), row("Анна", 130), row("Вера", 100, 1), row("Глеб", 20)]);
    expect(r.map((x) => [x.display_name, x.rank])).toEqual([["Анна", 1], ["Вера", 2], ["Борис", 2], ["Глеб", 4]]);
  });
  it("handles empty and single rows and does not mutate the input", () => {
    expect(rankRows([])).toEqual([]);
    const input = [row("A", 1), row("B", 2)];
    rankRows(input);
    expect(input.map((x) => x.display_name)).toEqual(["A", "B"]);
    expect(rankRows([row("Solo", 0)])[0].rank).toBe(1);
  });
});

const s = (a: string, user: string, done: boolean, created = "2026-11-10T10:00:00Z", due: string | null = null): StatusRow => ({
  assignment_id: a, scenario_id: `case-${a}`, due_date: due, created_at: created, user_id: user, display_name: user, done,
  best_outcome: done ? "sale" : null,
});

describe("assignments", () => {
  const rows = [s("1", "u1", true), s("1", "u2", false), s("2", "u1", false, "2026-11-12T10:00:00Z"), s("2", "u2", false, "2026-11-12T10:00:00Z")];
  it("groups rows by assignment, newest first, with progress", () => {
    const v = groupAssignments(rows);
    expect(v.map((x) => x.id)).toEqual(["2", "1"]);
    expect(v[1]).toMatchObject({ scenarioId: "case-1", doneCount: 1, total: 2 });
    expect(completion(v[1])).toBe(0.5);
    expect(completion(v[0])).toBe(0);
    expect(completion({ ...v[0], total: 0 })).toBe(0);
  });
  it("lists what a player still has to do", () => {
    const v = groupAssignments(rows);
    expect(pendingFor("u1", v).map((x) => x.id)).toEqual(["2"]);
    expect(pendingFor("u2", v).map((x) => x.id)).toEqual(["2", "1"]);
    expect(pendingFor("nobody", v)).toHaveLength(2);
  });
});

describe("dueLabel", () => {
  const now = new Date(2026, 10, 18, 15, 30); // 18 Nov 2026, afternoon
  it("describes deadlines relative to today", () => {
    expect(dueLabel(null, now)).toEqual({ text: "без срока", overdue: false });
    expect(dueLabel("2026-11-18", now)).toEqual({ text: "сегодня", overdue: false });
    expect(dueLabel("2026-11-19", now)).toEqual({ text: "завтра", overdue: false });
    expect(dueLabel("2026-11-25", now)).toEqual({ text: "через 7 дн.", overdue: false });
    expect(dueLabel("2026-11-16", now)).toEqual({ text: "просрочено на 2 дн.", overdue: true });
  });
});
