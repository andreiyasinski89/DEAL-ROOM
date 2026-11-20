import { describe, expect, it } from "vitest";
import { validateScenario } from "../engine/validate";
import { GHOST_TAGS } from "./data/ghost";
import { GHOST_CLOSER_IDS, GHOST_OPENER_IDS } from "./data/moves";
import { buildLibrary } from "./library";
import { ghostSpecs } from "./matrix";
import { ruPack } from "./packs/ru";
import { variantsFor } from "./variants";

const lib = buildLibrary(ruPack);
const specs = ghostSpecs();

describe('the "Divers" block (clients who vanished after the presentation)', () => {
  it("has 50 valid cases with unique ids, all separate from the 100-case library", () => {
    expect(lib.ghostScenarios).toHaveLength(50);
    expect(new Set(lib.ghostScenarios.map((s) => s.id)).size).toBe(50);
    expect(lib.allScenarios).toHaveLength(100);
    const bad: string[] = [];
    for (const s of lib.ghostScenarios) {
      const errs = validateScenario(s).issues.filter((i) => i.severity === "error");
      if (errs.length) bad.push(`${s.id}: ${errs.map((e) => e.message).join("; ")}`);
    }
    expect(bad).toEqual([]);
    for (const s of lib.ghostScenarios) expect(lib.scenarioById(s.id)).toBe(s);
  });

  it("every client starts a little irritated and sceptical (about 45 of 100 irritation, low trust)", () => {
    for (const s of lib.ghostScenarios) {
      expect(s.initialState.irritation, s.id).toBeGreaterThanOrEqual(38);
      expect(s.initialState.irritation, s.id).toBeLessThanOrEqual(55);
      expect(s.initialState.trust, s.id).toBeLessThanOrEqual(35);
      expect(s.niche).toBe("ghost");
      expect(s.startNodeId).toBe("open");
    }
  });

  it("covers every reason of the silence, every opener and every closer", () => {
    const reasons = new Set(specs.map((s) => s.tags[0]));
    expect([...reasons].sort()).toEqual([...GHOST_TAGS].sort());
    for (const r of GHOST_TAGS) expect(specs.filter((s) => s.tags[0] === r).length, r).toBeGreaterThanOrEqual(4);
    expect(new Set(specs.map((s) => s.ghost!.opener))).toEqual(new Set(GHOST_OPENER_IDS));
    const closers = new Set(specs.map((s) => s.ghost!.closer));
    for (const c of GHOST_CLOSER_IDS) expect(closers.has(c), c).toBe(true);
    expect(closers.size).toBeGreaterThanOrEqual(6);
  });

  it("the cases differ: shape, persona, segment, channel, level, what was promised and how long ago", () => {
    const shapes = new Set(specs.map((s) => JSON.stringify([s.tags, s.ghost, s.channel, variantsFor(s).events, variantsFor(s).story])));
    expect(shapes.size).toBe(50);
    expect(new Set(specs.map((s) => s.persona.id)).size).toBeGreaterThanOrEqual(28);
    expect(new Set(specs.map((s) => s.vocab.key)).size).toBe(6);
    expect(new Set(specs.map((s) => s.channel))).toEqual(new Set(["call", "chat", "zoom"]));
    expect(new Set(specs.map((s) => s.ghost!.promise)).size).toBe(6);
    expect(new Set(specs.map((s) => s.ghost!.days)).size).toBe(3);
    expect(new Set(specs.map((s) => s.ghost!.tries)).size).toBe(3);
    expect(new Set(lib.ghostScenarios.map((s) => s.briefing)).size).toBeGreaterThanOrEqual(45);
    const levels = lib.ghostScenarios.map((s) => s.level);
    for (const l of [2, 3, 4, 5]) expect(levels.filter((x) => x === l).length).toBeGreaterThanOrEqual(10);
    expect(levels.includes(1 as never)).toBe(false);
  });

  it("some cases have events and the client opening up, some do not", () => {
    const v = specs.map(variantsFor);
    expect(v.filter((x) => Object.keys(x.events).length).length).toBeGreaterThanOrEqual(20);
    expect(v.filter((x) => x.story).length).toBeGreaterThanOrEqual(15);
    expect(v.every((x) => x.hiddenAfter === -1)).toBe(true);
  });

  it("the briefing says when the presentation was, what the client said and how many attempts failed", () => {
    for (const s of lib.ghostScenarios) {
      expect(s.briefing, s.id).toMatch(/назад вы провели презентацию/);
      expect(s.briefing, s.id).toMatch(/«[^»]+»/);
      expect(s.briefing, s.id).toMatch(/С тех пор|Отсюда|Отт/i);
    }
  });

  it("the first beat is the real reason: a strong first answer leads somewhere, a pressuring one loses ground", () => {
    for (const s of lib.ghostScenarios.slice(0, 20)) {
      const b1 = s.nodes.b1;
      expect(b1.type).toBe("client");
      if (b1.type !== "client") continue;
      const q = Object.fromEntries(b1.choices.map((c) => [c.id, c]));
      expect(q.a.effects.trust ?? 0).toBeGreaterThan(0);
      expect(q.d.effects.irritation ?? 0).toBeGreaterThan(0);
    }
  });
});
