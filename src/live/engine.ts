import { LIMITS, type ClientEval, type LiveRequest, type LiveScenario, type Message, type Outcome, type Quality } from "../../supabase/functions/_shared/live.ts";
import { LEVEL_RULES, OUTCOME_POINTS, QUALITY_POINTS, clamp, dealProbability } from "../engine/engine";
import type { SessionRecord } from "../engine/profile";
import type { Mood, Scenario } from "../engine/types";

export type LiveEval = {
  quality: Quality;
  technique?: string;
  mistake?: string;
  coachNote: string;
  delta: { trust: number; interest: number; irritation: number };
};

export type LiveState = {
  trust: number;
  interest: number;
  irritation: number;
  /** Player turns played so far. */
  turn: number;
  transcript: Message[];
  evals: LiveEval[];
  ended?: { outcome: Outcome; reason: string };
};

export const LIVE_PREFIX = "live:";

/** The cloud function only needs the human-readable part of a scenario. */
export function toLiveScenario(s: Scenario): LiveScenario {
  const { persona: p } = s;
  return {
    id: s.id,
    title: s.title,
    level: s.level,
    channel: s.channel,
    persona: { name: p.name, age: p.age, profession: p.profession, psychotype: p.psychotype, pain: p.pain, hiddenMotive: p.hiddenMotive, redButton: p.redButton, goldenKey: p.goldenKey },
    briefing: s.briefing,
    hiddenContext: s.hiddenContext,
  };
}

/** First client line: the opening of the scripted case, so both modes start the same way. */
export function openingLine(s: Scenario): string {
  const n = s.nodes[s.startNodeId];
  return n && n.type === "client" ? n.text : `${s.persona.name}: слушаю вас.`;
}

export function createLive(s: Scenario): LiveState {
  return {
    trust: s.initialState.trust,
    interest: s.initialState.interest,
    irritation: s.initialState.irritation,
    turn: 0,
    transcript: [{ role: "client", text: openingLine(s) }],
    evals: [],
  };
}

export function turnRequest(s: Scenario, st: LiveState, player: string): LiveRequest {
  return {
    action: "turn",
    scenario: toLiveScenario(s),
    state: { trust: st.trust, interest: st.interest, irritation: st.irritation },
    turn: st.turn,
    transcript: st.transcript.slice(-LIMITS.transcriptMessages),
    player,
  };
}

export function debriefRequest(s: Scenario, st: LiveState): LiveRequest {
  return {
    action: "debrief",
    scenario: toLiveScenario(s),
    state: { trust: st.trust, interest: st.interest, irritation: st.irritation },
    turn: Math.min(st.turn, LIMITS.maxTurns),
    transcript: st.transcript.slice(-LIMITS.transcriptMessages),
    evals: st.evals.map((e) => ({ quality: e.quality, technique: e.technique, mistake: e.mistake })),
    outcome: st.ended?.outcome,
  };
}

/** Applies the validated evaluation of one player turn. Pure. */
export function applyLiveEval(st: LiveState, s: Scenario, player: string, ev: ClientEval): LiveState {
  const trust = clamp(st.trust + ev.trustDelta);
  const interest = clamp(st.interest + ev.interestDelta);
  const irritation = clamp(st.irritation + ev.irritationDelta);
  const turn = st.turn + 1;
  const next: LiveState = {
    trust, interest, irritation, turn,
    transcript: [...st.transcript, { role: "player", text: player }, { role: "client", text: ev.reply }],
    evals: [...st.evals, {
      quality: ev.quality, technique: ev.technique, mistake: ev.mistake, coachNote: ev.coachNote,
      delta: { trust: trust - st.trust, interest: interest - st.interest, irritation: irritation - st.irritation },
    }],
  };

  const rules = LEVEL_RULES[s.level];
  if (irritation >= rules.irritationMax) next.ended = { outcome: "lost", reason: "Раздражение достигло максимума — клиент прервал разговор." };
  else if (trust <= rules.trustMin) next.ended = { outcome: "lost", reason: "Доверие упало до нуля — клиент перестал вам верить." };
  else if (ev.isEnding && ev.outcome) {
    next.ended = {
      outcome: ev.outcome,
      reason: ev.outcome === "sale" ? "Клиент согласился." : ev.outcome === "partial" ? "Договорились о следующем шаге." : "Клиент отказался.",
    };
  } else if (turn >= LIMITS.maxTurns) {
    const ok = dealProbability(next) >= 55 && ev.quality !== "critical_error";
    next.ended = ok
      ? { outcome: "partial", reason: "Разговор затянулся, но клиент не против продолжить позже." }
      : { outcome: "lost", reason: "Разговор затянулся и не привёл к договорённости." };
  }
  return next;
}

export function liveScore(st: LiveState, outcome: Outcome) {
  const moves = st.evals.reduce((a, e) => a + QUALITY_POINTS[e.quality], 0);
  const base = OUTCOME_POINTS[outcome];
  return { base, moves, total: Math.max(0, base + moves), riskyWin: outcome === "sale" && st.evals.some((e) => e.quality === "critical_error") };
}

export function makeLiveRecord(s: Scenario, st: LiveState, durationSec: number, id: string, at = new Date()): SessionRecord {
  const outcome = st.ended?.outcome ?? "lost";
  return {
    id,
    scenarioId: `${LIVE_PREFIX}${s.id}`,
    level: s.level,
    outcome,
    score: liveScore(st, outcome).total,
    turns: st.turn,
    durationSec,
    hintsUsed: 0,
    at: at.toISOString(),
    moves: st.evals.map((e, i) => ({ nodeId: `live-${i + 1}`, quality: e.quality })),
  };
}

export function liveMood(st: Pick<LiveState, "trust" | "interest" | "irritation">): Mood {
  if (st.irritation >= 85) return "reset";
  if (st.irritation >= 60) return "irritated";
  if (st.trust >= 70) return "warm";
  if (st.interest >= 60) return "interested";
  if (st.trust < 30) return "doubtful";
  return "neutral";
}
