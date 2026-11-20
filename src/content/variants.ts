import type { Level } from "../engine/types";
import type { CaseSpec } from "./builder";
import { beats as ruBeats } from "./data/beats";
import { isGhostTag } from "./data/ghost";
import { CLOSER_IDS, EVENT_IDS, EVENTS, OPENER_IDS, type CloserId, type EventId, type GhostCloserId, type GhostOpenerId, type OpenerId } from "./data/moves";

/** Stable pseudo-random number in [0, 1) from a text: the same case always gets the same shape, in every language. */
export function hash01(text: string): number {
  let x = 2166136261;
  for (let i = 0; i < text.length; i++) x = Math.imul(x ^ text.charCodeAt(i), 16777619);
  x ^= x >>> 15;
  x = Math.imul(x, 2246822519);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

export type Variants = {
  /** How the conversation starts: the usual greeting, the client jumping straight into an objection, or another opener. */
  opening: "default" | "straight" | OpenerId | GhostOpenerId;
  /** How the finish looks: the usual ready client or another closing situation. */
  closing: "default" | CloserId | GhostCloserId;
  /** Events inserted after beat i (key = index of the beat they follow). */
  events: Record<number, EventId>;
  /** After a strong first answer the client opens up (a personal remark) before the next objection. */
  story: boolean;
  /** Index of the beat after which the hidden objection can surface (-1 on level 1). */
  hiddenAfter: number;
};

/** Everything that decides the SHAPE of a case besides its beats. Pure and language independent. */
export function variantsFor(spec: CaseSpec): Variants {
  const { level, id } = spec;
  const R = (k: string) => hash01(`${id}|${k}`);
  const k = spec.tags.length;
  const jTrust = spec.tags.findIndex((t) => !isGhostTag(t) && ruBeats[t].family === "trust");
  // a "diver" case has no hidden branch: its first beat IS the hidden reason
  const hiddenAfter = spec.ghost ? -1 : level >= 2 ? (jTrust >= 0 ? jTrust : 0) : -1;

  // ---- opening
  const o = R("opening");
  const opening: Variants["opening"] = spec.ghost
    ? spec.ghost.opener
    : o < 0.38 ? "default" : o < 0.55 ? (level >= 2 ? "straight" : "default") : OPENER_IDS[Math.floor(((o - 0.55) / 0.45) * OPENER_IDS.length) % OPENER_IDS.length];

  // ---- closing
  const c = R("closing");
  const closing: Variants["closing"] = spec.ghost ? spec.ghost.closer : c < 0.4 ? "default" : CLOSER_IDS[Math.floor(((c - 0.4) / 0.6) * CLOSER_IDS.length) % CLOSER_IDS.length];

  // ---- events (0-1 on levels 1-3, 1-2 on 4-5); never twice the same, never two in a row
  const count = (l: Level): number => {
    const e = R("events");
    if (l === 1) return e < 0.35 ? 1 : 0;
    if (l <= 3) return e < 0.7 ? 1 : 0;
    return e < 0.45 ? 1 : 2;
  };
  const events: Record<number, EventId> = {};
  const want = Math.min(count(level), Math.max(0, k));
  const used = new Set<EventId>();
  for (let n = 0; n < want; n++) {
    const pool = EVENT_IDS.filter((e) => {
      const ev = EVENTS[e];
      if (used.has(e)) return false;
      if (ev.channels && !ev.channels.includes(spec.channel)) return false;
      if (ev.modes && !ev.modes.includes(spec.vocab.mode)) return false;
      if (ev.minLevel && level < ev.minLevel) return false;
      return true;
    });
    if (!pool.length) break;
    const id2 = pool[Math.floor(R(`event${n}`) * pool.length)];
    // a gap after beat g (0..k-1); not next to another event
    const gaps = Array.from({ length: k }, (_, g) => g).filter((g) => !(g in events) && !((g - 1) in events) && !((g + 1) in events));
    if (!gaps.length) break;
    events[gaps[Math.floor(R(`gap${n}`) * gaps.length)]] = id2;
    used.add(id2);
  }

  // ---- the client opens up after a strong first answer (not when the hidden branch starts right there)
  const story = level >= 2 && hiddenAfter !== 0 && R("story") < (spec.ghost ? 0.6 : 0.5);

  return { opening, closing, events, story, hiddenAfter };
}
