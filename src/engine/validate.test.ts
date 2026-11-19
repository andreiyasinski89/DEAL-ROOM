import { describe, expect, it } from "vitest";
import { miniCase } from "../content/miniCase";
import { parseScenario } from "./schema";
import { countPaths, simulate, structuralIssues, validateScenario } from "./validate";
import type { Choice, Scenario } from "./types";

const clone = <T>(x: T): T => structuredClone(x);
const codes = (s: Scenario) => structuralIssues(s).map((i) => i.code);
const client = (s: Scenario, id: string) => {
  const n = s.nodes[id];
  if (n.type !== "client") throw new Error(id);
  return n;
};

/** A forgiving synthetic scenario: 13 chained nodes (~33% random sale), 2 sales, 1 partial, 2 lost. */
function easyScenario(level: Scenario["level"]): Scenario {
  const ch = (id: string, next: string, quality: Choice["quality"] = "good"): Choice => ({
    id,
    text: `answer ${id}`,
    next,
    effects: {},
    quality,
    coachNote: "ok",
  });
  const nodes: Scenario["nodes"] = {};
  for (let i = 1; i <= 13; i++) {
    const next = i === 13 ? "last" : `c${i + 1}`;
    nodes[`c${i}`] = { type: "client", id: `c${i}`, text: `client ${i}`, choices: [ch("a", next), ch("b", next)] };
  }
  nodes.last = {
    type: "client",
    id: "last",
    text: "final",
    choices: [ch("a", "sale1"), ch("b", "sale2"), ch("c", "lose", "weak"), ch("d", "lose2", "weak")],
  };
  const c13 = nodes.c13;
  if (c13.type === "client") c13.choices.push(ch("c", "part", "neutral"));
  for (const [id, outcome] of [["sale1", "sale"], ["sale2", "sale"], ["part", "partial"], ["lose", "lost"], ["lose2", "lost"]] as const)
    nodes[id] = { type: "ending", id, outcome, text: id, reason: id };
  return {
    ...clone(miniCase),
    id: `easy-l${level}`,
    level,
    initialState: { trust: 50, interest: 50, irritation: 10, flags: {} },
    startNodeId: "c1",
    nodes,
  };
}

describe("miniCase", () => {
  it("passes the schema, the structure checks and the simulation", () => {
    const r = validateScenario(miniCase);
    expect(r.issues.filter((i) => i.severity === "error")).toEqual([]);
    expect(r.stats?.runs).toBe(1000);
  });
  it("meets content requirements (≥15 nodes, ≥3 endings, ≥2 sale paths)", () => {
    expect(Object.keys(miniCase.nodes).length).toBeGreaterThanOrEqual(15);
    const paths = countPaths(miniCase);
    expect(paths.sale).toBeGreaterThanOrEqual(2);
    expect(paths.partial).toBeGreaterThan(0);
    expect(paths.lost).toBeGreaterThan(0);
  });
  it("simulation is deterministic for a given seed", () => {
    expect(simulate(miniCase, 200, 7)).toEqual(simulate(miniCase, 200, 7));
  });
});

describe("validator catches intentionally broken scenarios", () => {
  it("broken next pointer", () => {
    const s = clone(miniCase);
    client(s, "n1").choices[0].next = "does_not_exist";
    expect(codes(s)).toContain("broken-next");
  });

  it("missing start node", () => {
    const s = clone(miniCase);
    s.startNodeId = "nope";
    expect(codes(s)).toContain("start");
  });

  it("unreachable node", () => {
    const s = clone(miniCase);
    s.nodes.orphan = { type: "ending", id: "orphan", outcome: "lost", text: "x", reason: "x" };
    expect(codes(s)).toContain("unreachable");
  });

  it("dead end: client node without choices", () => {
    const s = clone(miniCase);
    client(s, "n3b").choices = [];
    expect(codes(s)).toContain("dead-end");
  });

  it("cycle without exit", () => {
    const s = clone(miniCase);
    client(s, "n3b").choices.forEach((c) => (c.next = "n3b"));
    expect(codes(s)).toContain("no-exit");
  });

  it("too few choices / too many choices", () => {
    const s = clone(miniCase);
    client(s, "n3b").choices.pop();
    expect(codes(s)).toContain("choice-count");
    const t = clone(miniCase);
    const n = client(t, "n1");
    n.choices.push({ ...n.choices[0], id: "e" }, { ...n.choices[0], id: "f" });
    expect(codes(t)).toContain("choice-count");
  });

  it("missing outcome type and single win path", () => {
    const s = clone(miniCase);
    for (const n of Object.values(s.nodes)) if (n.type === "ending" && n.outcome === "sale") n.outcome = "partial";
    const c = codes(s);
    expect(c).toContain("endings");
    expect(c).toContain("win-paths");
  });

  it("too few nodes", () => {
    const s = easyScenario(2);
    for (let i = 3; i <= 13; i++) delete s.nodes[`c${i}`];
    client(s, "c2").choices.forEach((c) => (c.next = "last"));
    expect(codes(s)).toContain("min-nodes");
  });

  it("conditional next without a default and with an unknown flag", () => {
    const s = clone(miniCase);
    client(s, "n4").choices[0].next = [{ when: { ghost: true }, to: "n6" }];
    const c = codes(s);
    expect(c).toContain("no-default");
    expect(c).toContain("unknown-flag");
  });

  it("empty coachNote is a schema error", () => {
    const s = clone(miniCase);
    client(s, "n1").choices[0].coachNote = "";
    const r = validateScenario(s);
    expect(r.issues.some((i) => i.code === "schema" && /coachNote/.test(i.message))).toBe(true);
  });

  it("missing quality is a schema error", () => {
    const s = clone(miniCase) as unknown as { nodes: Record<string, { choices: Record<string, unknown>[] }> };
    delete s.nodes.n1.choices[0].quality;
    expect(parseScenario(s).ok).toBe(false);
  });

  it("validateScenario stops at schema errors", () => {
    const r = validateScenario({ id: "garbage" });
    expect(r.issues.length).toBeGreaterThan(0);
    expect(r.issues.every((i) => i.code === "schema")).toBe(true);
    expect(r.stats).toBeUndefined();
  });
});

describe("simulation rules", () => {
  it("accepts an easy level-1 scenario (random player wins ≥ 30%)", () => {
    const r = validateScenario(easyScenario(1));
    expect(r.issues.filter((i) => i.severity === "error")).toEqual([]);
    expect(r.stats!.sale).toBeGreaterThanOrEqual(0.3);
  });

  it("rejects a level-1 scenario that is too hard", () => {
    const hard = clone(miniCase);
    hard.level = 1;
    expect(validateScenario(hard).issues.map((i) => i.code)).toContain("sim-too-hard");
  });

  it("rejects a level-4 scenario that a random player wins too often", () => {
    expect(validateScenario(easyScenario(4)).issues.map((i) => i.code)).toContain("sim-too-easy");
  });
});
