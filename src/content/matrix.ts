import type { Level, Scenario } from "../engine/types";
import { buildScenarioLazy, type CaseSpec } from "./builder";
import { beats, type BeatTag } from "./data/beats";
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
    title: `${persona.name}: ${beats[tags[0]].label}`,
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
export function generated(skipIndex?: number): Scenario[] {
  const perLevel: Record<number, number> = {};
  const counters: Record<string, number> = {};
  return slots()
    .map((s) => {
      perLevel[s.level] = (perLevel[s.level] ?? 0) + 1;
      return { s, spec: specFor(s, perLevel[s.level], counters) };
    })
    .filter(({ s }) => s.index !== skipIndex)
    .map(({ spec }) => buildScenarioLazy(spec));
}
