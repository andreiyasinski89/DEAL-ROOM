import type { Scenario } from "../engine/types";

/** How often the longest / shortest answer in a client node is the excellent one. */
export function lengthBias(scenarios: Scenario[]): { nodes: number; longestIsBest: number; shortestIsBest: number } {
  let nodes = 0;
  let longest = 0;
  let shortest = 0;
  for (const s of scenarios)
    for (const n of Object.values(s.nodes)) {
      if (n.type !== "client" || n.choices.length < 3) continue;
      const best = n.choices.filter((c) => c.quality === "excellent");
      if (best.length !== 1) continue;
      nodes++;
      const lens = n.choices.map((c) => c.text.length);
      if (best[0].text.length === Math.max(...lens)) longest++;
      if (best[0].text.length === Math.min(...lens)) shortest++;
    }
  return { nodes, longestIsBest: longest / Math.max(1, nodes), shortestIsBest: shortest / Math.max(1, nodes) };
}
