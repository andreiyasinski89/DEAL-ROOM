import { describe, expect, it } from "vitest";
import { allScenarios } from "./index";
import { slots, specFor } from "./matrix";
import { EVENT_IDS } from "./data/moves";
import { personas } from "./data/personas";
import { ruPack } from "./packs/ru";
import { variantsFor } from "./variants";

const all = (() => {
  const per: Record<number, number> = {};
  const counters: Record<string, number> = {};
  return slots().map((s) => {
    per[s.level] = (per[s.level] ?? 0) + 1;
    const spec = specFor(s, per[s.level], counters);
    return { spec, v: variantsFor(spec) };
  });
})();

describe("variety of the cases (shape, not only wording)", () => {
  it("the shape of a case is deterministic", () => {
    for (const { spec, v } of all.slice(0, 20)) expect(variantsFor(spec)).toEqual(v);
  });

  it("uses every kind of opening and closing", () => {
    const openings = new Set(all.map((x) => x.v.opening));
    expect([...openings].sort()).toEqual(["default", "direct", "referral", "straight", "tenMinutes"]);
    const closings = new Set(all.map((x) => x.v.closing));
    expect([...closings].sort()).toEqual(["default", "discount", "how", "send"]);
  });

  it("no opening or closing takes more than half of the library", () => {
    for (const key of ["opening", "closing"] as const) {
      const n: Record<string, number> = {};
      for (const x of all) n[x.v[key]] = (n[x.v[key]] ?? 0) + 1;
      expect(Math.max(...Object.values(n)), key).toBeLessThanOrEqual(50);
    }
  });

  it("uses most kinds of events, in a good share of the cases, and never the same event twice in a case", () => {
    const kinds = new Set<string>();
    let withEvents = 0;
    for (const { v } of all) {
      const ev = Object.values(v.events);
      if (ev.length) withEvents++;
      for (const e of ev) kinds.add(e);
      expect(new Set(ev).size).toBe(ev.length);
    }
    expect(kinds.size).toBeGreaterThanOrEqual(EVENT_IDS.length - 1);
    expect(withEvents).toBeGreaterThanOrEqual(55);
  });

  it("some cases have the client open up, and some do not", () => {
    const n = all.filter((x) => x.v.story).length;
    expect(n).toBeGreaterThanOrEqual(15);
    expect(n).toBeLessThanOrEqual(60);
  });

  it("almost every case has a different overall shape", () => {
    const shapes = new Set(all.map(({ spec, v }) => JSON.stringify([v.opening, v.closing, v.story, v.events, spec.tags])));
    expect(shapes.size).toBeGreaterThanOrEqual(95);
  });

  it("the cases differ in length: the number of nodes is spread out", () => {
    const sizes = allScenarios.map((s) => Object.keys(s.nodes).length);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeGreaterThanOrEqual(10);
  });

  it("the second wording of every objection is really used somewhere", () => {
    const texts = allScenarios.flatMap((s) => Object.values(s.nodes).flatMap((n) => (n.type === "client" ? [n.text, ...n.choices.map((c) => c.text)] : [])));
    const blob = texts.join("\n");
    let missing = 0;
    for (const [tag, a] of Object.entries(ruPack.extras.beatsAlt)) {
      const probe = a.alt[0].t.split("{")[0].slice(0, 25);
      if (!blob.includes(probe)) missing++;
      expect(a.soft.length, tag).toBeGreaterThan(5);
    }
    expect(missing).toBeLessThanOrEqual(2);
  });

  it("every persona has a personal remark for the moment the client opens up", () => {
    for (const p of personas) expect(ruPack.extras.stories[p.id]?.length, p.id).toBeGreaterThan(20);
  });

  it("events and the other moves exist in every shape the skeleton needs", () => {
    for (const e of EVENT_IDS) expect(ruPack.extras.events[e].opts).toHaveLength(4);
  });
});
