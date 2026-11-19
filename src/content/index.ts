import type { Scenario } from "../engine/types";
import { miniCase } from "./miniCase";
import { generated, slots } from "./matrix";

/**
 * 100 cases: the hand-written mini-case takes the first level-3 slot whose niche is
 * "member_elite"; the other 99 are assembled by the builder from personas, niche vocabularies
 * and the objection bank.
 */
const miniSlot = slots().find((s) => s.level === 3 && s.vocab.key === "member_elite")?.index;

export const allScenarios: Scenario[] = [...generated(miniSlot)];
if (miniSlot !== undefined) allScenarios.splice(Math.min(miniSlot, allScenarios.length), 0, miniCase);
else allScenarios.push(miniCase);

export const scenarioById = (id: string): Scenario | undefined => allScenarios.find((s) => s.id === id);
