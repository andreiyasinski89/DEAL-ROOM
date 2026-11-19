import type { Scenario } from "../engine/types";
import { buildScenario } from "./builder";
import { personaById } from "./data/personas";
import { vocabByKey } from "./data/vocab";
import { TUTORIAL_ID } from "./ids";

export { TUTORIAL_ID };

/**
 * "Case 0": a friendly level-1 call used by the guided tour. It is built like every other
 * case (so it is validated the same way) but is NOT part of the 100-case library, is not
 * counted in progress and does not give points.
 */
export const tutorialCase: Scenario = {
  ...buildScenario({
    id: TUTORIAL_ID,
    title: "Кейс 0: Как играть",
    level: 1,
    vocab: vocabByKey("member_elite"),
    tier: "Elite",
    channel: "call",
    persona: personaById("svetlana"),
    tags: ["time", "subscription", "think_about_it"],
    seed: 0,
  }),
};
