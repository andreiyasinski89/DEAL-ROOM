import type { Scenario, ScenarioNode } from "../engine/types";
import { mistakeCode } from "./data/mistakes";
import type { MiniText } from "./packs/types";

/** Adds the language-independent mistake codes to a hand-written scenario (derived from the Russian labels). */
export function withMistakeCodes(s: Scenario): Scenario {
  const nodes: Record<string, ScenarioNode> = {};
  for (const [id, n] of Object.entries(s.nodes))
    nodes[id] = n.type === "client" ? { ...n, choices: n.choices.map((c) => (c.mistake ? { ...c, mistakeCode: mistakeCode(c.mistake) } : c)) } : n;
  return { ...s, nodes };
}

/**
 * The hand-written case in another language: same graph, flags and effects, translated texts.
 * Throws if the translation misses a node, a choice, or a technique/mistake label the source has:
 * the tests rely on that to catch incomplete translations.
 */
export function localizeMini(base: Scenario, t: MiniText): Scenario {
  const nodes: Record<string, ScenarioNode> = {};
  for (const [id, n] of Object.entries(base.nodes)) {
    const tn = t.nodes[id];
    if (!tn) throw new Error(`mini-case translation lacks node "${id}"`);
    if (n.type === "client") {
      nodes[id] = {
        ...n,
        text: tn.text,
        ...(n.hint ? { hint: tn.hint ?? n.hint } : {}),
        choices: n.choices.map((c) => {
          const tc = tn.choices?.[c.id];
          if (!tc) throw new Error(`mini-case translation lacks choice "${id}/${c.id}"`);
          if (c.technique && !tc.technique) throw new Error(`mini-case translation lacks technique "${id}/${c.id}"`);
          if (c.mistake && !tc.mistake) throw new Error(`mini-case translation lacks mistake "${id}/${c.id}"`);
          return {
            ...c,
            text: tc.text,
            coachNote: tc.coachNote,
            ...(c.technique ? { technique: tc.technique } : {}),
            ...(c.mistake ? { mistake: tc.mistake, mistakeCode: mistakeCode(c.mistake) } : {}),
          };
        }),
      };
    } else {
      nodes[id] = { ...n, text: tn.text, reason: tn.reason ?? n.reason };
    }
  }
  return {
    ...base,
    title: t.title,
    persona: { ...base.persona, ...t.persona },
    briefing: t.briefing,
    hiddenContext: t.hiddenContext,
    nodes,
  };
}
