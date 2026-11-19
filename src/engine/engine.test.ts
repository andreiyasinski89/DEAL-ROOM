import { describe, expect, it } from "vitest";
import { miniCase } from "../content/miniCase";
import { applyChoice, clamp, computeScore, createState, currentEnding, dealProbability, resolveNext } from "./engine";
import type { ConditionalNext, Scenario } from "./types";

const clone = <T>(x: T): T => structuredClone(x);

describe("resolveNext", () => {
  it("returns plain strings as is", () => {
    expect(resolveNext("n2", {})).toBe("n2");
  });
  it("picks the first matching conditional branch, default last", () => {
    const next: ConditionalNext[] = [{ when: { a: true }, to: "x" }, { when: { b: false }, to: "y" }, { to: "z" }];
    expect(resolveNext(next, { a: true })).toBe("x");
    expect(resolveNext(next, { a: false })).toBe("y");
    expect(resolveNext(next, { a: false, b: true })).toBe("z");
  });
  it("throws if nothing matches", () => {
    expect(() => resolveNext([{ when: { a: true }, to: "x" }], {})).toThrow();
  });
});

describe("applyChoice", () => {
  it("applies effects, flags, history and moves to the next node", () => {
    const st = applyChoice(miniCase, createState(miniCase), "a"); // n1 → honest
    expect(st.nodeId).toBe("n2");
    expect(st.trust).toBe(45);
    expect(st.interest).toBe(30);
    expect(st.irritation).toBe(10);
    expect(st.flags.honest).toBe(true);
    expect(st.history).toHaveLength(1);
    expect(st.history[0].delta).toEqual({ trust: 10, interest: 5, irritation: -5 });
  });

  it("does not mutate the previous state", () => {
    const before = createState(miniCase);
    const snapshot = clone(before);
    applyChoice(miniCase, before, "a");
    expect(before).toEqual(snapshot);
  });

  it("clamps scales to 0..100", () => {
    const sc = clone(miniCase);
    sc.initialState = { trust: 95, interest: 2, irritation: 1, flags: {} };
    const n1 = sc.nodes.n1;
    if (n1.type !== "client") throw new Error();
    n1.choices[0].effects = { trust: 50, interest: -50, irritation: -50 };
    const st = applyChoice(sc, createState(sc), "a");
    expect([st.trust, st.interest, st.irritation]).toEqual([100, 0, 0]);
  });

  it("builds combo on good moves and resets on a bad one", () => {
    let st = createState(miniCase);
    st = applyChoice(miniCase, st, "a"); // excellent
    expect(st.combo).toBe(1);
    st = applyChoice(miniCase, st, "a"); // n2 a: excellent
    expect(st.combo).toBe(2);
    st = applyChoice(miniCase, st, "c"); // n3 c: neutral
    expect(st.combo).toBe(0);
  });

  it("follows conditional next by flags (n4 → n6 after bad_experience_explored)", () => {
    let st = createState(miniCase);
    for (const id of ["a", "a", "a"]) st = applyChoice(miniCase, st, id); // n1,n2,n3
    st = applyChoice(miniCase, st, "a"); // n4
    expect(st.nodeId).toBe("n6");
  });

  it("goes to n5 when the flag is missing", () => {
    let st = createState(miniCase);
    st = applyChoice(miniCase, st, "b"); // n1 → n2c
    st = applyChoice(miniCase, st, "b"); // n2c b → n4
    st = applyChoice(miniCase, st, "a"); // n4 a, no bad_experience flag
    expect(st.nodeId).toBe("n5");
  });

  it("throws on unknown choice and on ending nodes", () => {
    expect(() => applyChoice(miniCase, createState(miniCase), "zzz")).toThrow();
    const st = { ...createState(miniCase), nodeId: "end_sale_clean" };
    expect(() => applyChoice(miniCase, st, "a")).toThrow();
  });
});

describe("auto endings", () => {
  const withLevel = (level: Scenario["level"], irritation: number, trust: number): Scenario => {
    const sc = clone(miniCase);
    sc.level = level;
    sc.initialState = { trust, interest: 50, irritation, flags: {} };
    const n1 = sc.nodes.n1;
    if (n1.type !== "client") throw new Error();
    n1.choices[0].effects = { irritation: 0, trust: 0 };
    return sc;
  };

  it("irritation ≥ 100 ends the game on level 1", () => {
    const sc = withLevel(1, 99, 50);
    const n1 = sc.nodes.n1;
    if (n1.type !== "client") throw new Error();
    n1.choices[0].effects = { irritation: 5 };
    const st = applyChoice(sc, createState(sc), "a");
    expect(currentEnding(sc, st)?.outcome).toBe("lost");
    expect(st.autoEnding?.reason).toMatch(/Раздражение/);
  });

  it("thresholds are stricter on level 5", () => {
    const l1 = withLevel(1, 86, 50);
    const l5 = withLevel(5, 86, 50);
    expect(applyChoice(l1, createState(l1), "a").autoEnding).toBeUndefined();
    expect(applyChoice(l5, createState(l5), "a").autoEnding).toBeDefined();
  });

  it("trust at the floor ends the game", () => {
    const sc = withLevel(3, 10, 5);
    const st = applyChoice(sc, createState(sc), "a");
    expect(st.autoEnding?.reason).toMatch(/Доверие/);
  });
});

describe("scoring", () => {
  it("dealProbability stays within 0..100", () => {
    expect(dealProbability({ trust: 100, interest: 100, irritation: 0 })).toBe(100);
    expect(dealProbability({ trust: 0, interest: 0, irritation: 100 })).toBe(0);
    expect(clamp(150)).toBe(100);
  });

  it("adds base, move quality and subtracts hints", () => {
    let st = createState(miniCase);
    for (const id of ["a", "a", "a", "a", "a"]) st = applyChoice(miniCase, st, id); // 4 excellent + n6 a
    st = { ...st, hintsUsed: 1 };
    const s = computeScore(st, "sale");
    expect(s.base).toBe(100);
    expect(s.moves).toBe(50);
    expect(s.hintPenalty).toBe(10);
    expect(s.total).toBe(140);
    expect(s.riskyWin).toBe(false);
  });

  it("flags a sale with a critical error as risky and never goes below 0", () => {
    let st = createState(miniCase);
    st = applyChoice(miniCase, st, "c"); // lie
    expect(computeScore(st, "sale").riskyWin).toBe(true);
    expect(computeScore({ ...st, hintsUsed: 9 }, "lost").total).toBe(0);
  });
});
