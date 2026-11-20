import type { Level, Scenario } from "../engine/types";
import { buildScenarioLazy, type CaseSpec } from "./builder";
import { ruPack } from "./packs/ru";
import type { ContentPack } from "./packs/types";
import type { BeatTag } from "./data/beats";
import { personas } from "./data/personas";
import { vocabs, type Vocab } from "./data/vocab";

/** Cases per level: 24 / 24 / 20 / 18 / 14 = 100. */
export const LEVEL_COUNTS: Record<Level, number> = { 1: 24, 2: 24, 3: 20, 4: 18, 5: 14 };

/** Cases per market segment (sum = 100). */
export const VOCAB_WEIGHTS: Record<string, number> = {
  member_elite: 16, member_turbo: 12, recruiting: 16, cold: 12, repeat: 12, family: 10, business: 12, social: 10,
};

const EASY: BeatTag[] = ["price", "subscription", "points_value", "time", "think_about_it", "need", "no_money", "competitor"];
const MID: BeatTag[] = ["smokescreen", "proof_request", "stall", "trust", "spouse_third_party", "bad_past_experience", "mlm_stigma", "no_network", "not_salesperson", "tier_choice", "refund_cancel"];
const HARD: BeatTag[] = ["income_question", "aggression", "manipulation", "network_realism"];

/** Beats that carry MWR-specific facts; every case must contain at least one. */
export const MWR_CORE: BeatTag[] = ["price", "subscription", "points_value", "refund_cancel", "tier_choice", "network_realism", "income_question"];

/** Beats per level: [easy, mid, hard]. */
const SHAPE: Record<Level, [number, number, number]> = { 1: [3, 0, 0], 2: [3, 1, 0], 3: [1, 3, 0], 4: [1, 2, 2], 5: [1, 2, 3] };

const BUILDER_ONLY = new Set(["no_network", "not_salesperson"]);
const TEAM_SEGMENTS = new Set(["recruiting", "business", "social"]);

/** Which objections make sense for which segment. */
export function allowed(v: Vocab, t: BeatTag): boolean {
  if (BUILDER_ONLY.has(t)) return TEAM_SEGMENTS.has(v.key);
  if (t === "network_realism") return TEAM_SEGMENTS.has(v.key) || v.key === "member_turbo";
  if (t === "income_question") return TEAM_SEGMENTS.has(v.key) || v.key === "member_turbo" || v.key === "repeat";
  if (t === "tier_choice") return v.mode === "sell" && v.key !== "cold";
  if (t === "bad_past_experience" && v.key === "cold") return false;
  // an existing client has already paid the entry fee
  if (v.mode === "retain" && ["price", "no_money", "smokescreen"].includes(t)) return false;
  return true;
}

function pick(pool: BeatTag[], n: number, offset: number, taken: Set<BeatTag>): BeatTag[] {
  const out: BeatTag[] = [];
  for (let i = 0; i < pool.length && out.length < n; i++) {
    const t = pool[(offset + i) % pool.length];
    if (!taken.has(t)) {
      out.push(t);
      taken.add(t);
    }
  }
  return out;
}

const HIDDEN: BeatTag[] = ["spouse_third_party", "bad_past_experience", "no_money", "subscription", "refund_cancel", "mlm_stigma", "points_value", "not_salesperson", "no_network"];

/** Personas that fit a segment best (others are used as fillers). */
const AFFINITY: Record<string, string[]> = {
  business: ["maxim", "dmitry", "viktor", "roman", "igor", "alla", "timur", "stanislav"],
  family: ["svetlana", "elena", "marina", "alexey", "vera", "larisa", "zoya", "anatoly"],
  social: ["artem", "yulia", "anna", "kirill", "natalia", "polina"],
};

/** Interleaves segments so every level gets a mix. */
function nicheSequence(): Vocab[] {
  const left = { ...VOCAB_WEIGHTS };
  const out: Vocab[] = [];
  const total = Object.values(VOCAB_WEIGHTS).reduce((a, b) => a + b, 0);
  while (out.length < total) {
    for (const v of vocabs)
      if (left[v.key] > 0) {
        out.push(v);
        left[v.key]--;
      }
  }
  return out;
}

export type Slot = { index: number; level: Level; vocab: Vocab };

export function slots(): Slot[] {
  const seq = nicheSequence();
  const levels: Level[] = [];
  for (const l of [1, 2, 3, 4, 5] as Level[]) for (let i = 0; i < LEVEL_COUNTS[l]; i++) levels.push(l);
  return levels.map((level, index) => ({ index, level, vocab: seq[index] }));
}

/** Persona choice is deterministic: affinity list per segment, round-robin over all personas otherwise. */
function personaFor(v: Vocab, counters: Record<string, number>, index: number) {
  const aff = AFFINITY[v.key];
  const n = (counters[v.key] = (counters[v.key] ?? 0) + 1) - 1;
  if (aff) return personas.find((p) => p.id === aff[n % aff.length])!;
  return personas[(index * 7 + n) % personas.length];
}

export function specFor(s: Slot, levelIdx: number, counters: Record<string, number> = {}): CaseSpec {
  const { vocab, level, index } = s;
  const persona = personaFor(vocab, counters, index);
  const [ne, nm, nh] = SHAPE[level];
  const taken = new Set<BeatTag>();
  const tags: BeatTag[] = [
    ...pick(EASY.filter((t) => allowed(vocab, t)), ne, levelIdx, taken),
    ...pick(MID.filter((t) => allowed(vocab, t)), nm, levelIdx + index, taken),
    ...pick(HARD.filter((t) => allowed(vocab, t)), nh, levelIdx, taken),
  ];
  // make sure the MWR-specific facts are always in play
  if (!tags.some((t) => MWR_CORE.includes(t))) {
    const core = MWR_CORE.find((t) => allowed(vocab, t) && !taken.has(t))!;
    tags[0] = core;
    taken.add(core);
  }
  const hidden = level >= 2 ? pick(HIDDEN.filter((t) => allowed(vocab, t)), 1, levelIdx + index, taken)[0] : undefined;
  const tier = vocab.tiers[index % vocab.tiers.length];
  return {
    id: `${vocab.key}-l${level}-${persona.id}-${index + 1}`,
    level,
    vocab,
    tier,
    channel: vocab.channels[index % vocab.channels.length],
    persona,
    tags,
    hidden,
    seed: index,
  };
}

/** All generated cases except the slot taken by the hand-written mini-case. */
export function generated(skipIndex?: number, pack: ContentPack = ruPack): Scenario[] {
  const perLevel: Record<number, number> = {};
  const counters: Record<string, number> = {};
  return slots()
    .map((s) => {
      perLevel[s.level] = (perLevel[s.level] ?? 0) + 1;
      return { s, spec: specFor(s, perLevel[s.level], counters) };
    })
    .filter(({ s }) => s.index !== skipIndex)
    .map(({ spec }) => buildScenarioLazy(spec, pack));
}

/* ------------------------------------------------------------------ "Divers": 50 cases of clients who vanished after the presentation */

import { GHOST_TAGS } from "./data/ghost";
import { CLOSER_IDS, GHOST_CLOSER_IDS, GHOST_OPENER_IDS } from "./data/moves";
import { vocabByKey } from "./data/vocab";

/** Cases per level of the "Divers" block (all levels 2-5: these clients are never easy). */
export const GHOST_LEVELS: Level[] = [...Array(10).fill(2), ...Array(16).fill(3), ...Array(14).fill(4), ...Array(10).fill(5)] as Level[];
/** Segments that had a presentation (no cold contacts, no existing clients). */
const GHOST_SEGMENTS = ["member_elite", "member_turbo", "recruiting", "family", "business", "social"];
/** What else can come up once the real reason is on the table. */
const GHOST_EXTRA: BeatTag[] = ["price", "subscription", "points_value", "mlm_stigma", "trust", "think_about_it", "spouse_third_party", "bad_past_experience", "no_money", "competitor", "refund_cancel", "proof_request", "income_question", "need", "smokescreen", "network_realism"];
const GHOST_CLOSERS: ("default" | (typeof CLOSER_IDS)[number] | (typeof GHOST_CLOSER_IDS)[number])[] = ["default", "discount", "send", "how", "pause", "proof", "again"];
/** Objections that would repeat the reason itself. */
const GHOST_CONFLICT: Partial<Record<(typeof GHOST_TAGS)[number], BeatTag[]>> = {
  g_money_shame: ["no_money", "price", "smokescreen"],
  g_spouse_no: ["spouse_third_party"],
  g_googled: ["mlm_stigma", "proof_request"],
  g_friend_warned: ["mlm_stigma"],
  g_competitor: ["competitor"],
  g_cooled: ["need", "think_about_it"],
  g_pressured: ["think_about_it"],
};
/** How many other objections follow the reason, per level. */
const GHOST_EXTRA_COUNT: Record<number, number> = { 2: 2, 3: 2, 4: 3, 5: 3 };

export function ghostSpecs(): CaseSpec[] {
  return GHOST_LEVELS.map((level, i) => {
    const vocab = vocabByKey(GHOST_SEGMENTS[(i * 5 + Math.floor(i / 6)) % GHOST_SEGMENTS.length]);
    const persona = personas[i < 30 ? (i * 7) % 30 : ((i - 30) * 7 + 15) % 30];
    const reason = GHOST_TAGS[(i * 3 + Math.floor(i / 10)) % GHOST_TAGS.length];
    const n = GHOST_EXTRA_COUNT[level] + (level === 3 && i % 3 === 0 ? 1 : 0) + (level === 5 && i % 2 === 0 ? 1 : 0);
    const pool = GHOST_EXTRA.filter((t) => allowed(vocab, t) && !(GHOST_CONFLICT[reason] ?? []).includes(t));
    const taken = new Set<BeatTag>();
    const tags = [reason, ...pick(pool, n, i * 3, taken)];
    return {
      id: `ghost-l${level}-${persona.id}-${i + 1}`,
      level,
      vocab,
      tier: vocab.tiers[i % vocab.tiers.length],
      channel: i % 5 === 4 ? "zoom" : i % 2 === 0 ? "call" : "chat",
      persona,
      tags,
      seed: 500 + i,
      ghost: {
        opener: GHOST_OPENER_IDS[(i * 5 + Math.floor(i / 6)) % GHOST_OPENER_IDS.length],
        closer: GHOST_CLOSERS[(i * 3 + 1 + Math.floor(i / 7)) % GHOST_CLOSERS.length],
        days: ((i * 2 + Math.floor(i / 3)) % 3) as 0 | 1 | 2,
        promise: (i * 5 + Math.floor(i / 4)) % 6,
        tries: ((i + Math.floor(i / 5)) % 3) as 0 | 1 | 2,
      },
    };
  });
}

/** The 50 "Divers" cases in the language of the pack (node graphs are built lazily, like in the main library). */
export function ghostCases(pack: ContentPack = ruPack): Scenario[] {
  return ghostSpecs().map((spec) => buildScenarioLazy(spec, pack));
}
