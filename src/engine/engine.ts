import type {
  Choice,
  ClientNode,
  ConditionalNext,
  EndingNode,
  GameState,
  Level,
  Outcome,
  Quality,
  Scenario,
  ScenarioNode,
} from "./types";

export const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

/** Auto-ending thresholds per level: harder levels lose the client sooner. */
export const LEVEL_RULES: Record<Level, { irritationMax: number; trustMin: number }> = {
  1: { irritationMax: 100, trustMin: 0 },
  2: { irritationMax: 100, trustMin: 0 },
  3: { irritationMax: 95, trustMin: 5 },
  4: { irritationMax: 90, trustMin: 10 },
  5: { irritationMax: 85, trustMin: 15 },
};

export function createState(s: Scenario): GameState {
  const { trust, interest, irritation, flags } = s.initialState;
  return {
    nodeId: s.startNodeId,
    trust,
    interest,
    irritation,
    flags: { ...flags },
    history: [],
    combo: 0,
    hintsUsed: 0,
  };
}

export function resolveNext(next: Choice["next"], flags: Record<string, boolean>): string {
  if (typeof next === "string") return next;
  const hit = next.find((c: ConditionalNext) => !c.when || Object.entries(c.when).every(([k, v]) => !!flags[k] === v));
  if (!hit) throw new Error("No matching conditional branch");
  return hit.to;
}

export function getNode(s: Scenario, id: string): ScenarioNode {
  const n = s.nodes[id];
  if (!n) throw new Error(`Unknown node ${id}`);
  return n;
}

export function currentClientNode(s: Scenario, st: GameState): ClientNode | null {
  if (st.autoEnding) return null;
  const n = getNode(s, st.nodeId);
  return n.type === "client" ? n : null;
}

export type EndingView = Pick<EndingNode, "outcome" | "text" | "reason"> & { mood: EndingNode["mood"] };

export function currentEnding(s: Scenario, st: GameState): EndingView | null {
  if (st.autoEnding) return { ...st.autoEnding, mood: st.autoEnding.outcome === "lost" ? "reset" : "warm" };
  const n = getNode(s, st.nodeId);
  return n.type === "ending" ? { outcome: n.outcome, text: n.text, reason: n.reason, mood: n.mood } : null;
}

/** Combined 0..100 "chance of a deal", derived from the three scales. */
export function dealProbability(st: Pick<GameState, "trust" | "interest" | "irritation">): number {
  return Math.round(clamp(0.45 * st.trust + 0.4 * st.interest - 0.35 * st.irritation + 15));
}

/** Pure: returns the next state after the player picks a choice. */
export function applyChoice(s: Scenario, st: GameState, choiceId: string): GameState {
  const node = getNode(s, st.nodeId);
  if (node.type !== "client") throw new Error("Cannot choose on an ending");
  const choice = node.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`Unknown choice ${choiceId}`);

  const e = choice.effects;
  const trust = clamp(st.trust + (e.trust ?? 0));
  const interest = clamp(st.interest + (e.interest ?? 0));
  const irritation = clamp(st.irritation + (e.irritation ?? 0));
  const flags = { ...st.flags, ...(e.setFlags ?? {}) };

  const good = choice.quality === "excellent" || choice.quality === "good";
  const combo = good ? st.combo + 1 : 0;

  const next: GameState = {
    ...st,
    trust,
    interest,
    irritation,
    flags,
    combo,
    nodeId: resolveNext(choice.next, flags),
    history: [
      ...st.history,
      {
        turn: st.history.length + 1,
        nodeId: node.id,
        choiceId: choice.id,
        choiceText: choice.text,
        quality: choice.quality,
        technique: choice.technique,
        mistake: choice.mistake,
        coachNote: choice.coachNote,
        delta: { trust: trust - st.trust, interest: interest - st.interest, irritation: irritation - st.irritation },
        after: { trust, interest, irritation },
      },
    ],
  };

  // Automatic endings by scale (thresholds per level come in Phase 2).
  const rules = LEVEL_RULES[s.level];
  if (irritation >= rules.irritationMax) {
    next.autoEnding = {
      outcome: "lost",
      text: "Клиент резко прерывает разговор: «Мне это не интересно. Больше не звоните». Гудки.",
      reason: "Раздражение достигло максимума — клиент бросил трубку.",
    };
  } else if (trust <= rules.trustMin) {
    next.autoEnding = {
      outcome: "lost",
      text: "«Знаете, я вам больше не верю. Всего доброго». Клиент заканчивает разговор.",
      reason: "Доверие упало до нуля — клиент перестал вам верить.",
    };
  }
  return next;
}

export const QUALITY_POINTS: Record<Quality, number> = {
  excellent: 10,
  good: 5,
  neutral: 0,
  weak: -5,
  critical_error: -15,
};

export const OUTCOME_POINTS: Record<Outcome, number> = { sale: 100, partial: 50, lost: 0 };

export function computeScore(st: GameState, outcome: Outcome) {
  const moves = st.history.reduce((a, h) => a + QUALITY_POINTS[h.quality], 0);
  const base = OUTCOME_POINTS[outcome];
  const hintPenalty = st.hintsUsed * 10;
  const hadCritical = st.history.some((h) => h.quality === "critical_error");
  return {
    base,
    moves,
    hintPenalty,
    riskyWin: outcome === "sale" && hadCritical,
    total: Math.max(0, base + moves - hintPenalty),
    max: 100 + st.history.length * 10,
  };
}
