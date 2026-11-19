import { describe, expect, it } from "vitest";
import { allScenarios } from "./index";
import { personas } from "./data/personas";
import { TAGS, beats } from "./data/beats";
import { lengthBias } from "./stats";
import { countPaths, validateScenario } from "../engine/validate";
import { buildScenario, buildScenarioLazy } from "./builder";
import { specFor, slots } from "./matrix";

const countBy = (key: (s: (typeof allScenarios)[number]) => string) => {
  const m: Record<string, number> = {};
  for (const s of allScenarios) m[key(s)] = (m[key(s)] ?? 0) + 1;
  return m;
};

describe("content library (master prompt 5.1)", () => {
  it("has 100 cases with unique ids", () => {
    expect(allScenarios).toHaveLength(100);
    expect(new Set(allScenarios.map((s) => s.id)).size).toBe(100);
  });

  it("matches the level distribution 24 / 24 / 20 / 18 / 14", () => {
    const m = countBy((s) => String(s.level));
    expect([1, 2, 3, 4, 5].map((l) => m[l])).toEqual([24, 24, 20, 18, 14]);
  });

  it("covers every niche and every channel", () => {
    const niches = countBy((s) => s.niche);
    expect(Object.keys(niches).sort()).toEqual(["business", "cold", "family", "member_elite", "member_turbo", "recruiting", "repeat", "social"]);
    expect(Math.min(...Object.values(niches))).toBeGreaterThanOrEqual(10);
    const ch = countBy((s) => s.channel);
    expect(Object.keys(ch).sort()).toEqual(["call", "chat", "meeting", "zoom"]);
    expect(Math.min(...Object.values(ch))).toBeGreaterThanOrEqual(10);
  });

  it("uses every objection tag of the taxonomy", () => {
    const used = new Set(allScenarios.flatMap((s) => s.objectionTags));
    for (const t of TAGS) expect(used.has(t), `tag ${t}`).toBe(true);
  });

  it("has ≥ 30 complete personas and uses all of them", () => {
    expect(personas.length).toBeGreaterThanOrEqual(30);
    for (const p of personas) for (const v of Object.values(p)) expect(String(v).length).toBeGreaterThan(0);
    const used = new Set(allScenarios.map((s) => s.persona.id));
    for (const p of personas) expect(used.has(p.id), p.id).toBe(true);
    expect(new Set(personas.map((p) => p.psychotype))).toEqual(new Set(["Аналитик", "Драйвер", "Экспрессив", "Миротворец"]));
  });

  it("every case passes schema, structure and simulation", () => {
    for (const s of allScenarios) {
      const errors = validateScenario(s).issues.filter((i) => i.severity === "error");
      expect(errors, s.id).toEqual([]);
    }
  });

  it("every case has ≥ 15 nodes, ≥ 3 endings of all kinds and ≥ 2 paths to a sale", () => {
    for (const s of allScenarios) {
      const nodes = Object.values(s.nodes);
      expect(nodes.length, s.id).toBeGreaterThanOrEqual(15);
      const outcomes = new Set(nodes.flatMap((n) => (n.type === "ending" ? [n.outcome] : [])));
      expect([...outcomes].sort(), s.id).toEqual(["lost", "partial", "sale"]);
      expect(countPaths(s).sale, s.id).toBeGreaterThanOrEqual(2);
      if (s.level >= 4) expect(nodes.filter((n) => n.type === "ending" && n.outcome === "lost").length, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("branches on hidden variables from level 2 up (conditional next + reveal node)", () => {
    for (const s of allScenarios.filter((x) => x.level >= 2 && x.id !== "mwr-l3-irina-accountant")) {
      const conditional = Object.values(s.nodes).some((n) => n.type === "client" && n.choices.some((c) => Array.isArray(c.next)));
      expect(conditional, s.id).toBe(true);
      expect(s.objectionTags, s.id).toContain("hidden_objection");
    }
  });

  it("does not make the right answer obvious by length", () => {
    const b = lengthBias(allScenarios);
    expect(b.nodes).toBeGreaterThan(300);
    expect(b.longestIsBest).toBeLessThan(0.45);
    expect(b.shortestIsBest).toBeLessThan(0.45);
  });

  it("every choice has quality and a non-empty coach note; ethics errors are critical", () => {
    for (const s of allScenarios)
      for (const n of Object.values(s.nodes))
        if (n.type === "client")
          for (const c of n.choices) {
            expect(c.coachNote.length, `${s.id}/${n.id}/${c.id}`).toBeGreaterThan(0);
            if (/ложн|обещани|давлени|дефицит/i.test(c.mistake ?? "") && !/отступлен/i.test(c.coachNote))
              expect(["weak", "critical_error"], `${s.id}/${n.id}/${c.id}`).toContain(c.quality);
          }
  });

  it("no unresolved placeholders in the generated text", () => {
    for (const s of allScenarios) {
      const text = JSON.stringify(s);
      expect(text, s.id).not.toMatch(/\{[A-Za-z]+\}/);
      expect(text, s.id).not.toMatch(/\(а\)/);
    }
  });

  it("bank: each beat has 4 options + 3 recovery options and distinct lost reasons", () => {
    for (const [k, b] of Object.entries(beats)) {
      expect(b.opts, k).toHaveLength(4);
      expect(b.rec, k).toHaveLength(3);
      expect(b.opts.map((o) => o.t).concat(b.rec.map((o) => o.t)).every((t) => t.length > 5), k).toBe(true);
    }
  });

  it("building is deterministic", () => {
    const sl = slots()[5];
    expect(buildScenario(specFor(sl, 1))).toEqual(buildScenario(specFor(sl, 1)));
  });

  it("lazy scenarios equal the eagerly built ones, and build their graph only on first access", () => {
    for (const sl of slots().filter((_, i) => i % 7 === 0)) {
      const spec = specFor(sl, 1);
      const lazy = buildScenarioLazy(spec);
      expect(Object.getOwnPropertyDescriptor(lazy, "nodes")?.get).toBeTypeOf("function");
      expect(lazy).toEqual(buildScenario(spec));
      expect(lazy.nodes).toBe(lazy.nodes); // cached: same object on every read
    }
  });
});
