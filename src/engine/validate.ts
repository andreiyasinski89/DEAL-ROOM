import { applyChoice, createState, currentClientNode, currentEnding } from "./engine";
import { parseScenario } from "./schema";
import type { Choice, Outcome, Scenario } from "./types";

export type Issue = { severity: "error" | "warning"; code: string; message: string };

export const REQUIREMENTS = {
  minNodes: 15,
  minWinPaths: 2,
  minChoices: 2,
  maxChoices: 4,
  /** Share of random runs that must end in SALE. */
  randomWin: { 1: { min: 0.3 }, 4: { max: 0.05 }, 5: { max: 0.05 } } as Record<number, { min?: number; max?: number }>,
} as const;

/** All node ids a choice can lead to (every conditional branch). */
export function targets(next: Choice["next"]): string[] {
  return typeof next === "string" ? [next] : next.map((c) => c.to);
}

function successors(s: Scenario, id: string): string[] {
  const n = s.nodes[id];
  if (!n || n.type !== "client") return [];
  return [...new Set(n.choices.flatMap((c) => targets(c.next)))];
}

/** Counts simple start→ending paths per outcome (over-approximation: ignores flag conditions). */
export function countPaths(s: Scenario, cap = 100_000): Record<Outcome, number> {
  const out: Record<Outcome, number> = { sale: 0, partial: 0, lost: 0 };
  let steps = 0;
  const seen = new Set<string>();
  const dfs = (id: string) => {
    if (steps++ > cap) return;
    const n = s.nodes[id];
    if (!n) return;
    if (n.type === "ending") {
      out[n.outcome]++;
      return;
    }
    if (seen.has(id)) return;
    seen.add(id);
    for (const t of successors(s, id)) dfs(t);
    seen.delete(id);
  };
  dfs(s.startNodeId);
  return out;
}

export function structuralIssues(s: Scenario): Issue[] {
  const issues: Issue[] = [];
  const err = (code: string, message: string) => issues.push({ severity: "error", code, message });
  const ids = Object.keys(s.nodes);

  if (!s.nodes[s.startNodeId]) err("start", `startNodeId "${s.startNodeId}" does not exist`);

  for (const [key, n] of Object.entries(s.nodes)) {
    if (n.id !== key) err("node-id", `node key "${key}" differs from its id "${n.id}"`);
    if (n.type !== "client") continue;
    if (n.choices.length === 0) err("dead-end", `node "${key}" has no choices and is not an ending`);
    else if (n.choices.length < REQUIREMENTS.minChoices || n.choices.length > REQUIREMENTS.maxChoices)
      err("choice-count", `node "${key}" has ${n.choices.length} choices (need ${REQUIREMENTS.minChoices}–${REQUIREMENTS.maxChoices})`);
    const choiceIds = new Set<string>();
    for (const c of n.choices) {
      if (choiceIds.has(c.id)) err("choice-id", `node "${key}": duplicate choice id "${c.id}"`);
      choiceIds.add(c.id);
      for (const t of targets(c.next))
        if (!s.nodes[t]) err("broken-next", `node "${key}", choice "${c.id}" points to missing node "${t}"`);
      if (Array.isArray(c.next) && !c.next.some((b) => !b.when))
        err("no-default", `node "${key}", choice "${c.id}": conditional next has no default branch`);
    }
  }

  // reachability
  const reach = new Set<string>();
  const stack = [s.startNodeId];
  while (stack.length) {
    const id = stack.pop()!;
    if (reach.has(id) || !s.nodes[id]) continue;
    reach.add(id);
    stack.push(...successors(s, id));
  }
  for (const id of ids) if (!reach.has(id)) err("unreachable", `node "${id}" is unreachable`);

  // every reachable node must be able to reach an ending (catches dead cycles)
  const canEnd = new Set(ids.filter((id) => s.nodes[id].type === "ending"));
  for (let changed = true; changed; ) {
    changed = false;
    for (const id of ids)
      if (!canEnd.has(id) && successors(s, id).some((t) => canEnd.has(t))) {
        canEnd.add(id);
        changed = true;
      }
  }
  for (const id of reach)
    if (!canEnd.has(id) && s.nodes[id].type === "client" && s.nodes[id].choices.length > 0)
      err("no-exit", `node "${id}" can never reach an ending (cycle without exit)`);

  // content requirements (5.4)
  if (ids.length < REQUIREMENTS.minNodes) err("min-nodes", `only ${ids.length} nodes (need ≥ ${REQUIREMENTS.minNodes})`);
  const endings = ids.map((i) => s.nodes[i]).filter((n) => n.type === "ending");
  for (const o of ["sale", "partial", "lost"] as const)
    if (!endings.some((e) => e.outcome === o)) err("endings", `no "${o}" ending`);
  const paths = countPaths(s);
  if (paths.sale < REQUIREMENTS.minWinPaths) err("win-paths", `only ${paths.sale} path(s) to a sale (need ≥ ${REQUIREMENTS.minWinPaths})`);
  if (s.level >= 4 && endings.filter((e) => e.outcome === "lost").length < 2)
    err("lost-variety", "levels 4–5 need several different GAME OVER endings");

  // flag sanity: conditions on flags nobody sets
  const setFlags = new Set(Object.keys(s.initialState.flags));
  for (const n of Object.values(s.nodes))
    if (n.type === "client") for (const c of n.choices) Object.keys(c.effects.setFlags ?? {}).forEach((f) => setFlags.add(f));
  for (const n of Object.values(s.nodes))
    if (n.type === "client")
      for (const c of n.choices)
        if (Array.isArray(c.next))
          for (const b of c.next)
            for (const f of Object.keys(b.when ?? {}))
              if (!setFlags.has(f)) err("unknown-flag", `node "${n.id}", choice "${c.id}" tests flag "${f}" that is never set`);

  return issues;
}

/* ---------------- simulation ---------------- */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SimStats = { runs: number; sale: number; partial: number; lost: number; avgTurns: number };

export function simulate(s: Scenario, runs = 1000, seed = 1): SimStats {
  const rand = rng(seed);
  const tally = { sale: 0, partial: 0, lost: 0 };
  let turns = 0;
  for (let r = 0; r < runs; r++) {
    let st = createState(s);
    for (let guard = 0; guard < 200; guard++) {
      const node = currentClientNode(s, st);
      if (!node) break;
      const c = node.choices[Math.floor(rand() * node.choices.length)];
      st = applyChoice(s, st, c.id);
    }
    const end = currentEnding(s, st);
    tally[end ? end.outcome : "lost"]++;
    turns += st.history.length;
  }
  return { runs, sale: tally.sale / runs, partial: tally.partial / runs, lost: tally.lost / runs, avgTurns: turns / runs };
}

export type ValidationReport = { id: string; issues: Issue[]; stats?: SimStats; paths?: Record<Outcome, number> };

/** Full check of raw data: schema → structure → simulation. */
export function validateScenario(data: unknown, opts: { runs?: number } = {}): ValidationReport {
  const parsed = parseScenario(data);
  const id = (data as { id?: string })?.id ?? "(unknown)";
  if (!parsed.ok) return { id, issues: parsed.errors.map((message) => ({ severity: "error", code: "schema", message })) };

  const s = parsed.scenario;
  const issues = structuralIssues(s);
  if (issues.some((i) => i.severity === "error")) return { id, issues };

  const stats = simulate(s, opts.runs ?? 1000);
  const rule = REQUIREMENTS.randomWin[s.level];
  if (rule?.min !== undefined && stats.sale < rule.min)
    issues.push({ severity: "error", code: "sim-too-hard", message: `random player wins ${(stats.sale * 100).toFixed(1)}% (level ${s.level} needs ≥ ${rule.min * 100}%)` });
  if (rule?.max !== undefined && stats.sale > rule.max)
    issues.push({ severity: "error", code: "sim-too-easy", message: `random player wins ${(stats.sale * 100).toFixed(1)}% (level ${s.level} allows ≤ ${rule.max * 100}%)` });
  return { id, issues, stats, paths: countPaths(s) };
}
