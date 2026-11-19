import { describe, expect, it } from "vitest";
import { miniCase } from "../content/miniCase";
import { bestPath, buildDebrief, fmtTime } from "./debrief";
import { applyChoice, createState, currentEnding } from "./engine";
import type { GameState } from "./types";

const play = (ids: string[]): GameState => ids.reduce((st, id) => applyChoice(miniCase, st, id), createState(miniCase));

describe("bestPath", () => {
  it("finds a sale made only of non-negative moves, and replaying it really wins", () => {
    const bp = bestPath(miniCase)!;
    expect(bp.outcome).toBe("sale");
    expect(bp.steps.every((s) => s.quality === "excellent" || s.quality === "good")).toBe(true);
    const st = bp.steps.reduce((acc, step) => applyChoice(miniCase, acc, step.choiceId), createState(miniCase));
    expect(currentEnding(miniCase, st)?.outcome).toBe("sale");
  });
  it("is the maximum: 4 excellent moves leading to n6 beat any other sale", () => {
    const bp = bestPath(miniCase)!;
    expect(bp.steps.map((s) => s.choiceId)).toEqual(["a", "a", "a", "a", "a"]);
  });
});

describe("buildDebrief", () => {
  it("summarises a partial game with good and bad moves and a key fork", () => {
    // n1 a (excellent) → n2 c (weak, oppression) → n4 a (excellent) → n5 b (neutral) → partial
    const st = play(["a", "c", "a", "b"]);
    const end = currentEnding(miniCase, st)!;
    expect(end.outcome).toBe("partial");
    const d = buildDebrief(miniCase, st, end.outcome, end.reason, 400);
    expect(d.turns).toBe(4);
    expect(d.good.length).toBeGreaterThan(0);
    expect(d.good[0]).toMatch(/^Ход 1:/);
    expect(d.bad.some((b) => b.startsWith("Ход 2:"))).toBe(true);
    expect(d.growth.join(" ")).toMatch(/следующий шаг/);
    expect(d.fork?.turn).toBe(2);
    expect(d.fork?.best.quality).toBe("excellent");
    expect(d.hidden[0]).toBe(miniCase.hiddenContext);
    expect(d.durationSec).toBe(400);
  });

  it("flags a risky win and a clean game has no fork", () => {
    const clean = play(["a", "a", "a", "a", "a"]);
    const d = buildDebrief(miniCase, clean, "sale", "ok");
    expect(d.fork).toBeNull();
    expect(d.score.riskyWin).toBe(false);
    expect(d.bad).toEqual([]);
    const risky = buildDebrief(miniCase, play(["c"]), "sale", "ok");
    expect(risky.score.riskyWin).toBe(true);
  });

  it("formats time", () => {
    expect(fmtTime(400)).toBe("6:40");
    expect(fmtTime(5)).toBe("0:05");
  });
});
