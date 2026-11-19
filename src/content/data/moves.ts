import type { Channel, Quality } from "../../engine/types";
import type { BeatTag } from "./beats";
import type { MistakeCode } from "./mistakes";

/**
 * Language-independent skeleton of the "extra" building blocks that make cases differ in SHAPE, not only in wording:
 * mid-conversation events, different openings and closings, and a "the client opens up" step.
 * The texts live in the language packs (`Extras`); everything that decides the graph lives here.
 */

/** Four answers per move, always in this order of quality. A mistake code belongs to the weak / critical ones. */
export type MoveSkeleton = { codes: [undefined, undefined, MistakeCode, MistakeCode] };
export const QUALITIES: [Quality, Quality, Quality, Quality] = ["excellent", "good", "weak", "critical_error"];

export const EVENT_IDS = [
  "interrupt", "competitor_offer", "friend_story", "quote_request", "skeptic_question",
  "silence", "third_joins", "time_check", "tired",
] as const;
export type EventId = (typeof EVENT_IDS)[number];

export type EventSkeleton = MoveSkeleton & {
  /** Channels where the event makes sense (all when absent). */
  channels?: Channel[];
  /** Only for these case modes (both when absent). */
  modes?: ("sell" | "retain")[];
  /** The objection tag the node counts for in the weak-spot map. */
  tag?: BeatTag;
  /** Lowest level where the event appears. */
  minLevel?: 1 | 2 | 3 | 4 | 5;
};

export const EVENTS: Record<EventId, EventSkeleton> = {
  interrupt: { channels: ["call", "meeting", "zoom"], codes: [undefined, undefined, "ignore", "pressure"], tag: "time" },
  competitor_offer: { codes: [undefined, undefined, "dispute", "devalue"], tag: "competitor", minLevel: 2 },
  friend_story: { codes: [undefined, undefined, "excuse", "dispute"], tag: "bad_past_experience", minLevel: 2 },
  quote_request: { codes: [undefined, undefined, "weak_position", "lie"], tag: "price" },
  skeptic_question: { codes: [undefined, undefined, "boasting", "lie"], tag: "trust", minLevel: 2 },
  silence: { channels: ["chat"], codes: [undefined, undefined, "pressure", "pressure"], tag: "stall" },
  third_joins: { channels: ["call", "meeting", "zoom"], codes: [undefined, undefined, "ignore", "pressure"], tag: "spouse_third_party", minLevel: 2 },
  time_check: { codes: [undefined, undefined, "monologue", "pressure"], tag: "time" },
  tired: { codes: [undefined, undefined, "ignore", "pressure"], minLevel: 2 },
};

export const OPENER_IDS = ["tenMinutes", "referral", "direct"] as const;
export type OpenerId = (typeof OPENER_IDS)[number];
/** The critical answer of every opener is a false pretext, so the shared "hangs up: lied from the first second" ending fits. */
export const OPENER_CODES: MoveSkeleton["codes"] = [undefined, undefined, "pressure", "lie"];

export const CLOSER_IDS = ["discount", "send", "how"] as const;
export type CloserId = (typeof CLOSER_IDS)[number];
/** The critical answer of every closer is invented urgency or scarcity, so the shared "a couple of places?" ending fits. */
export const CLOSER_CODES: Record<CloserId, MoveSkeleton["codes"]> = {
  discount: [undefined, undefined, "weak_position", "scarcity"],
  send: [undefined, undefined, "ignore", "scarcity"],
  how: [undefined, undefined, "weak_position", "scarcity"],
};

/** The "client opens up" step after a strong first answer. */
export const STORY_CODES: MoveSkeleton["codes"] = [undefined, undefined, "devalue", "pressure"];
