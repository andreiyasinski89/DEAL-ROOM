import type { Scenario } from "../engine/types";
import { generated, ghostCases, slots } from "./matrix";
import { localizeMini, withMistakeCodes } from "./mini";
import { miniCase } from "./miniCase";
import type { ContentPack } from "./packs/types";
import { buildTutorial } from "./tutorial";

/**
 * 100 cases in one language: the hand-written mini-case takes the first level-3 slot whose segment is
 * "member_elite"; the other 99 are assembled by the builder from the pack (personas, segments, objection bank).
 */
export function buildLibrary(pack: ContentPack) {
  const miniSlot = slots().find((s) => s.level === 3 && s.vocab.key === "member_elite")?.index;
  const mini = { ...(pack.mini ? localizeMini(miniCase, pack.mini) : withMistakeCodes(miniCase)), autoEnd: pack.tpl.autoEnd };
  const allScenarios: Scenario[] = [...generated(miniSlot, pack)];
  if (miniSlot !== undefined) allScenarios.splice(Math.min(miniSlot, allScenarios.length), 0, mini);
  else allScenarios.push(mini);
  const ghostScenarios: Scenario[] = ghostCases(pack);
  const byId = new Map([...allScenarios, ...ghostScenarios].map((s) => [s.id, s]));
  return {
    lang: pack.lang,
    allScenarios,
    /** The "Divers" block: 50 cases of clients who vanished after the presentation. */
    ghostScenarios,
    ghostIntro: { ...pack.ghost.intro, reasons: Object.values(pack.ghost.beats).map((b) => b.label) },
    scenarioById: (id: string) => byId.get(id),
    tutorialCase: buildTutorial(pack),
    /** Localised objection names (for the weak-spot map and recommendations). */
    tagLabels: Object.fromEntries([...Object.entries(pack.beats), ...Object.entries(pack.ghost.beats)].map(([k, b]) => [k, b.label])) as Record<string, string>,
  };
}
