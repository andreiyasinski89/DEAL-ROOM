import type { Channel } from "../../engine/types";
import type { Lang } from "../../i18n";
import type { Beat, BeatTag, Opt } from "../data/beats";
import type { GhostTag } from "../data/ghost";
import type { CloserId, EventId, GhostCloserId, GhostOpenerId, OpenerId } from "../data/moves";
import type { Vocab } from "../data/vocab";

/**
 * A language pack holds EVERY piece of scenario text for one language. Russian is assembled from the
 * original data modules; the other languages are full translations with exactly the same shape, so
 * TypeScript refuses an incomplete pack and the tests check placeholders and facts.
 *
 * Placeholders in text: {name} {product} {productAcc} {next} {proof} {third} {thirdWho}
 *                       {tier} {tierPrice} {tierPoints} {renewPoints} {terms} {renew} {fee} {sub}
 * Gender (the speaker is the client): Russian uses «сказал(а)»; every language may use {male|female}.
 */
export type VocabText = Pick<Vocab, "label" | "product" | "productAcc" | "next" | "proof" | "third" | "thirdWho" | "brief" | "open">;

export type PersonaText = {
  name: string;
  profession: string;
  psychotype: string;
  pain: string;
  hiddenMotive: string;
  redButton: string;
  goldenKey: string;
  /** Vocative of the name for greetings ("Dzień dobry, Olgo!"); defaults to the name. */
  voc?: string;
};

export type Psy = "analyst" | "driver" | "expressive" | "peacemaker";

type Move = { t: string; mistake: string; note: string };
type Tech = { sell: string; retain: string; tech: string; note: string };
type End = { text: string; reason: string };

export type Tpl = {
  /** Opening and closing quotation marks used around a spoken line. */
  quote: [string, string];
  /** "{name}: {label}", the case title. */
  title: string;
  /** Points with a unit: "{n} баллов", "{n} points" (always 120, 240 or 490: no plural problems). */
  points: string;
  /** The registration terms as one clause: {fee} {tierPoints}. Placeholder {terms}. */
  terms: string;
  /** Added to {terms} for Elite only: the company facts do not say where the rest of the price goes. */
  termsRest: string;
  /** What a subscription renewal gives: {renewPoints}. Placeholder {renew}. */
  renew: string;
  /** "per month" after the subscription amount: "{sub}" = "$120 " + this. */
  perMonth: string;
  /** Title of the tutorial case ("Case 0"). */
  tutorialTitle: string;
  channel: Record<Channel, string>;
  /** Each psychotype colours some client lines: 4 variants of a prefix and of a suffix. */
  voice: Record<Psy, { pre: string[]; post: string[] }>;
  hint: { trust: string; value: string; other: string; rec: string; open: string; close: string };
  /** Prefix of a hidden objection when the client finally says it. */
  reveal: string;
  open: { a: Tech; b: Tech; c: Move; d: Move; lostText: string; lostReason: string };
  close: { soft: string; hard: string; a: Tech; b: Tech; c: Move; d: Move };
  endings: {
    saleClean: { sell: End; retain: End };
    saleSoft: { sell: End; retain: End };
    partialNext: { sell: End; retain: End };
    partialVague: End;
    lostClose: End;
  };
  /** "{name}: «{bye}»" and "GAME OVER: {why}" with the right quotes. */
  /** Automatic endings when irritation maxes out / trust hits zero. */
  autoEnd: { irritation: { text: string; reason: string }; trust: { text: string; reason: string } };
  lostBye: string;
  gameOver: string;
  briefing: { channelWord: string; firstStep: string; goal: string; known: string };
  hidden: { objection: string; red: string; gold: string; facts: string; level5: string };
};

/** Hand-written level-3 case "Skeptic accountant": its texts per language (the graph is shared). */
export type MiniText = {
  title: string;
  persona: PersonaText;
  briefing: string;
  hiddenContext: string;
  nodes: Record<
    string,
    {
      text: string;
      hint?: string;
      /** Ending reason (for ending nodes). */
      reason?: string;
      choices?: Record<string, { text: string; technique?: string; mistake?: string; coachNote: string }>;
    }
  >;
};

/** One answer of an extra move: the line, the technique (strong answers) or mistake (weak ones) and the coach note. */
export type Mv = { t: string; label: string; note: string };
export type Mv4 = [Mv, Mv, Mv, Mv];

/**
 * Texts of the building blocks that change the SHAPE of a case (see data/moves.ts for the skeleton):
 * events in the middle of the talk, other ways to open and to close, the "client opens up" step,
 * and the extra wording variants of every objection beat.
 */
export type Extras = {
  events: Record<EventId, { line: string; opts: Mv4; bye: string; why: string }>;
  openers: Record<OpenerId, { line: string; opts: Mv4 }>;
  closers: Record<CloserId, { line: string; opts: Mv4 }>;
  story: { hint: string; opts: Mv4; bye: string; why: string };
  /** First-person remark of each persona about their situation (the client "opens up"). */
  stories: Record<string, string>;
  /** One more wording of the client line (soft/hard), of the pushback and of every answer, per beat. */
  beatsAlt: Record<BeatTag, { soft: string; hard: string; push: string; alt: [Opt, Opt, Opt, Opt] }>;
};

/**
 * "Divers" (Водолазы): clients who vanished after the presentation. The first beat of every case is the real reason
 * of the silence (`beats`), the rest of the wording describes the situation and how the client reacts to being contacted.
 */
export type GhostPack = {
  beats: Record<GhostTag, Beat>;
  /** What the client says when the seller reaches out (+ the answers, + the ending if the answer is a false pretext). */
  openers: Record<GhostOpenerId, { line: string; opts: Mv4; bye: string; why: string }>;
  closers: Record<GhostCloserId, { line: string; opts: Mv4 }>;
  /** Template with {days} {promise} {tries}; the usual placeholders work too. */
  briefing: string;
  hint: string;
  days: [string, string, string];
  promises: [string, string, string, string, string, string];
  tries: [string, string, string];
  /** What really happened (shown after the game), one sentence per reason. */
  hidden: Record<GhostTag, string>;
  /** Title of the block and its description (menu). */
  intro: { title: string; text: string };
};

export type ContentPack = {
  lang: Lang;
  beats: Record<BeatTag, Beat>;
  vocab: Record<string, VocabText>;
  personas: Record<string, PersonaText>;
  tpl: Tpl;
  /** null for Russian: the mini-case source IS Russian. */
  mini: MiniText | null;
  extras: Extras;
  ghost: GhostPack;
};
