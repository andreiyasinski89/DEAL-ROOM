import { describe, expect, it } from "vitest";
import { allScenarios } from "./index";
import { TUTORIAL_ID, tutorialCase } from "./tutorial";
import { validateScenario } from "../engine/validate";
import { TOUR_STEPS } from "../ui/Tour";

describe("tutorial case 0", () => {
  it("is a valid, easy level-1 scenario like every other case", () => {
    const r = validateScenario(tutorialCase);
    expect(r.issues.filter((i) => i.severity === "error")).toEqual([]);
    expect(tutorialCase.level).toBe(1);
    expect(r.stats!.sale).toBeGreaterThanOrEqual(0.3);
  });
  it("is not part of the 100-case library (no progress, no points)", () => {
    expect(allScenarios.some((s) => s.id === TUTORIAL_ID)).toBe(false);
    expect(allScenarios).toHaveLength(100);
  });
  it("the tour covers every key area and ends with the goal", () => {
    const targets = TOUR_STEPS.map((s) => s.target).filter(Boolean);
    for (const t of ["dialog", "dossier", "pulse", "telemetry", "choices", "hint"]) expect(targets).toContain(t);
    expect(TOUR_STEPS[TOUR_STEPS.length - 1].target).toBeUndefined();
  });
});
