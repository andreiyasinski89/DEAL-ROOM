import type { Scenario } from "../engine/types";
import { buildScenario } from "./builder";
import { personaById } from "./data/personas";
import { vocabByKey } from "./data/vocab";
import { TUTORIAL_ID } from "./ids";
import { ruPack } from "./packs/ru";
import type { ContentPack } from "./packs/types";

export { TUTORIAL_ID };

/**
 * "Case 0": a friendly level-1 call used by the guided tour. It is built like every other
 * case (so it is validated the same way) but is NOT part of the 100-case library, is not
 * counted in progress and does not give points.
 */
export function buildTutorial(pack: ContentPack = ruPack): Scenario {
  const s = buildScenario(
    {
      id: TUTORIAL_ID,
      level: 1,
      vocab: vocabByKey("member_elite"),
      tier: "Elite",
      channel: "call",
      persona: personaById("svetlana"),
      tags: ["time", "subscription", "think_about_it"],
      seed: 0,
    },
    pack,
  );
  return { ...s, title: pack.tpl.tutorialTitle };
}

export const tutorialCase: Scenario = buildTutorial(ruPack);
