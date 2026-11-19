import type {
  Channel,
  Choice,
  ConditionalNext,
  Effects,
  Level,
  Mood,
  Persona,
  Quality,
  Scenario,
  ScenarioNode,
} from "../engine/types";
import { beats as ruBeats, type BeatTag, type Opt, type Beat, type Tag } from "./data/beats";
import { mistakeCode } from "./data/mistakes";
import { tierFacts, type Tier } from "./data/mwr";
import type { Vocab } from "./data/vocab";
import { ruPack } from "./packs/ru";
import type { ContentPack, Psy, VocabText } from "./packs/types";

export type CaseSpec = {
  id: string;
  level: Level;
  vocab: Vocab;
  tier: Tier;
  channel: Channel;
  persona: Persona;
  /** Ordered objection beats (without the hidden one). */
  tags: BeatTag[];
  /** Hidden objection revealed only if the player earned trust (levels 2–5). */
  hidden?: BeatTag;
  /** Index used to vary phrasing deterministically. */
  seed: number;
};

const START: Record<Level, { trust: number; interest: number; irritation: number }> = {
  1: { trust: 50, interest: 40, irritation: 5 },
  2: { trust: 45, interest: 35, irritation: 10 },
  3: { trust: 35, interest: 25, irritation: 15 },
  4: { trust: 30, interest: 25, irritation: 20 },
  5: { trust: 25, interest: 20, irritation: 25 },
};
/** Negative effects are scaled by level: forgiving at level 1, harsh at level 5. */
const NEG: Record<Level, number> = { 1: 0.7, 2: 0.85, 3: 1, 4: 1.15, 5: 1.3 };

/** Gender of the client (language independent: by persona id). */
const FEMALE_IDS = new Set(["irina", "svetlana", "olga", "natalia", "elena", "anna", "marina", "yulia", "tatyana", "vera", "ksenia", "polina", "larisa", "alla", "zoya"]);

/** Psychotype code from the Russian source label. */
const PSY: Record<string, Psy> = { "Аналитик": "analyst", "Драйвер": "driver", "Экспрессив": "expressive", "Миротворец": "peacemaker" };

type Ctx = { name: string; nameVoc: string; vocab: VocabText; female: boolean; tier: Tier; perMonth: string };

/**
 * Fills placeholders (two passes, because vocab strings contain placeholders too) and gendered forms:
 * Russian «сказал(а)» and the generic {male|female} used by the other languages.
 */
export function fillText(text: string, c: Ctx): string {
  const facts = tierFacts(c.tier, c.perMonth);
  const map: Record<string, string> = {
    name: c.name,
    nameVoc: c.nameVoc,
    product: c.vocab.product,
    productAcc: c.vocab.productAcc,
    next: c.vocab.next,
    proof: c.vocab.proof,
    third: c.vocab.third,
    thirdWho: c.vocab.thirdWho,
    tier: facts.tier,
    tierPrice: facts.tierPrice,
    tierPoints: facts.tierPoints,
    fee: facts.fee,
    sub: facts.sub,
  };
  let s = text;
  for (let pass = 0; pass < 2; pass++) s = s.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in map ? map[k] : m));
  s = s.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m: string, f: string) => (c.female ? f : m));
  return s.replace(/(\p{L}+)\(а\)/gu, (_, stem: string) => (c.female ? `${stem}а` : stem));
}

/** Lower-cases the first letter only (keeps names such as "Booking" intact). */
const lcFirst = (s: string) => (s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s);

const baseEffects = (q: Quality, level: Level, recovery = false): Effects => {
  const k = NEG[level];
  const r = (n: number) => Math.round(n);
  switch (q) {
    case "excellent": return { trust: 10, interest: 8, irritation: -5 };
    case "good": return recovery ? { trust: 6, interest: 3, irritation: -6 } : { trust: 5, interest: 4, irritation: -2 };
    case "neutral": return { trust: 1, interest: 0, irritation: 0 };
    case "weak": return { trust: r(-6 * k), interest: r(-3 * k), irritation: r(10 * k) };
    default: return { trust: r(-18 * k), interest: r(-8 * k), irritation: r(20 * k) };
  }
};

const withFlags = (e: Effects, flags: Record<string, boolean>): Effects => (Object.keys(flags).length ? { ...e, setFlags: flags } : e);

/** The persona and vocabulary of a case in the language of the pack. */
function localised(spec: CaseSpec, pack: ContentPack) {
  const { voc, ...text } = pack.personas[spec.persona.id];
  const persona: Persona = { ...spec.persona, ...text };
  const vocab = { ...spec.vocab, ...pack.vocab[spec.vocab.key] };
  return { persona, vocab, female: FEMALE_IDS.has(spec.persona.id), nameVoc: voc ?? persona.name };
}

export function buildScenario(spec: CaseSpec, pack: ContentPack = ruPack): Scenario {
  const { level, tier } = spec;
  const { persona, vocab, female, nameVoc } = localised(spec, pack);
  const { tpl } = pack;
  const ctx: Ctx = { name: persona.name, nameVoc, vocab, female, tier, perMonth: tpl.perMonth };
  const f = (s: string) => fillText(s, ctx);
  const retain = vocab.mode === "retain";
  const hard = level >= 4;
  const psy: Psy = PSY[spec.persona.psychotype] ?? "peacemaker";
  const nodes: Record<string, ScenarioNode> = {};
  const endings: Record<string, ScenarioNode> = {};

  /** Voice of the persona: a prefix or suffix chosen deterministically. */
  const voice = (seed: number) => {
    const v = (seed >> 1) % 4;
    const set = tpl.voice[psy];
    return { pre: set.pre[v] ?? "", post: set.post[v] ?? "" };
  };

  const choice = (id: string, o: Opt, ru: Opt, quality: Quality, next: string | ConditionalNext[], effects: Effects): Choice => ({
    id,
    text: f(o.t),
    next,
    effects,
    quality,
    ...(o.tech ? { technique: o.tech } : {}),
    ...(o.mistake ? { mistake: o.mistake, mistakeCode: mistakeCode(ru.mistake) } : {}),
    coachNote: o.note,
  });

  const end = (id: string, outcome: "sale" | "partial" | "lost", text: string, reason: string, mood: Mood) => {
    endings[id] = { type: "ending", id, outcome, text: f(text), reason: f(reason), mood };
  };

  /** One objection beat: client node, pushback node and its own GAME OVER ending. */
  const addBeat = (id: string, tag: BeatTag, progress: string | ConditionalNext[], seed: number, reveal = false) => {
    const b: Beat = pack.beats[tag];
    const r: Beat = ruBeats[tag];
    // the persona's voice colours every other line, not all of them
    const v = seed % 2 === 0 ? voice(seed) : { pre: "", post: "" };
    const lines = hard ? b.hard : b.soft;
    const say = lines[seed % lines.length];
    const lostId = `lost_${id}`;
    const trust = b.family === "trust";
    const value = b.family === "value";
    const good: Record<string, boolean> = trust ? { trusted: true } : value ? { value: true } : {};
    const bad: Record<string, boolean> = trust ? { trusted: false } : {};
    const badCrit: Record<string, boolean> = trust ? { trusted: false } : value ? { value: false } : {};

    const critNext = level <= 2 ? `${id}_r` : lostId;
    nodes[id] = {
      type: "client",
      id,
      mood: tag === "aggression" ? "irritated" : hard ? "doubtful" : "neutral",
      text: f(`${reveal ? tpl.reveal : ""}${v.pre}${say}${v.post}`),
      hint: tpl.hint[b.family],
      tag,
      choices: [
        choice("a", b.opts[0], r.opts[0], "excellent", progress, withFlags(baseEffects("excellent", level), good)),
        choice("b", b.opts[1], r.opts[1], "good", progress, withFlags(baseEffects("good", level), trust || value ? good : {})),
        // level 1 forgives a weak answer (the client just reacts), higher levels send it to the pushback node
        choice("c", b.opts[2], r.opts[2], "weak", level === 1 ? progress : `${id}_r`, withFlags(baseEffects("weak", level), bad)),
        choice("d", b.opts[3], r.opts[3], "critical_error", critNext, withFlags(baseEffects("critical_error", level), badCrit)),
      ],
    };
    nodes[`${id}_r`] = {
      type: "client",
      id: `${id}_r`,
      mood: "irritated",
      text: f(`${v.pre}${b.push[(seed >> 1) % b.push.length]}`),
      hint: tpl.hint.rec,
      tag,
      choices: [
        choice("a", b.rec[0], r.rec[0], "good", progress, withFlags(baseEffects("good", level, true), good)),
        choice("b", b.rec[1], r.rec[1], "weak", level <= 2 ? progress : lostId, baseEffects("weak", level)),
        choice("c", b.rec[2], r.rec[2], "critical_error", lostId, baseEffects("critical_error", level)),
      ],
    };
    end(lostId, "lost", tpl.lostBye.replace("{bye}", b.bye), tpl.gameOver.replace("{why}", b.why), "reset");
  };

  // ---- sequence -----------------------------------------------------------
  const k = spec.tags.length;
  const ids = spec.tags.map((_, i) => `b${i + 1}`);
  const after = (i: number) => (i + 1 < k ? ids[i + 1] : "close");

  // hidden branch sits after the first trust-family beat (or after beat 1)
  const jTrust = spec.tags.findIndex((t) => ruBeats[t].family === "trust");
  const j = level >= 2 ? (jTrust >= 0 ? jTrust : 0) : -1;

  const rt = ruPack.tpl; // Russian source: mistake codes are derived from it
  const mv = (m: { t: string; mistake: string; note: string }, ru: { mistake: string }) => ({
    text: f(m.t),
    mistake: m.mistake,
    mistakeCode: mistakeCode(ru.mistake),
    coachNote: m.note,
  });

  // opening
  const open = voice(spec.seed);
  nodes.open = {
    type: "client",
    id: "open",
    mood: "neutral",
    text: f(`${open.pre}${vocab.open[spec.channel]}${open.post}`),
    hint: tpl.hint.open,
    choices: [
      {
        id: "a",
        text: f(retain ? tpl.open.a.retain : tpl.open.a.sell),
        next: ids[0],
        effects: { trust: 8, interest: 5, irritation: -3, setFlags: { trusted: true } },
        quality: "excellent",
        technique: tpl.open.a.tech,
        coachNote: tpl.open.a.note,
      },
      {
        id: "b",
        text: f(retain ? tpl.open.b.retain : tpl.open.b.sell),
        next: ids[0],
        effects: { trust: 3, interest: 4, irritation: 0, setFlags: { value: true } },
        quality: "good",
        technique: tpl.open.b.tech,
        coachNote: tpl.open.b.note,
      },
      {
        id: "c",
        ...mv(tpl.open.c, rt.open.c),
        next: ids[0],
        effects: { trust: Math.round(-6 * NEG[level]), interest: -2, irritation: Math.round(8 * NEG[level]) },
        quality: "weak",
      },
      {
        id: "d",
        ...mv(tpl.open.d, rt.open.d),
        next: hard ? "lost_open" : ids[0],
        effects: { trust: Math.round(-18 * NEG[level]), interest: -6, irritation: Math.round(15 * NEG[level]) },
        quality: "critical_error",
      },
    ],
  };
  if (hard) end("lost_open", "lost", tpl.open.lostText, tpl.open.lostReason, "reset");

  spec.tags.forEach((tag, i) => {
    const progress: string | ConditionalNext[] = i === j ? [{ when: { trusted: true }, to: "h" }, { to: "s" }] : after(i);
    addBeat(ids[i], tag, progress, spec.seed + i);
  });

  if (j >= 0) {
    const hiddenTag = spec.hidden ?? "spouse_third_party";
    const stallTag: BeatTag = spec.tags.includes("stall") ? "think_about_it" : "stall";
    addBeat("h", hiddenTag, after(j), spec.seed + 11, true);
    addBeat("s", stallTag, after(j), spec.seed + 13);
  }

  // close
  nodes.close = {
    type: "client",
    id: "close",
    mood: "warm",
    text: f(hard ? tpl.close.hard : tpl.close.soft),
    hint: tpl.hint.close,
    choices: [
      {
        id: "a",
        text: f(retain ? tpl.close.a.retain : tpl.close.a.sell),
        next: level === 1 ? "sale_clean" : [{ when: { trusted: true }, to: "sale_clean" }, { to: "partial_next" }],
        effects: { trust: 8, interest: 6, irritation: -4 },
        quality: "excellent",
        technique: tpl.close.a.tech,
        coachNote: tpl.close.a.note,
      },
      {
        id: "b",
        text: f(retain ? tpl.close.b.retain : tpl.close.b.sell),
        next: [{ when: { value: true }, to: "sale_soft" }, { to: "partial_next" }],
        effects: { trust: 5, interest: 5, irritation: -2 },
        quality: "good",
        technique: tpl.close.b.tech,
        coachNote: tpl.close.b.note,
      },
      {
        id: "c",
        ...mv(tpl.close.c, rt.close.c),
        next: "partial_vague",
        effects: { trust: 1, interest: -4, irritation: 0 },
        quality: "weak",
      },
      {
        id: "d",
        ...mv(tpl.close.d, rt.close.d),
        next: "lost_close",
        effects: { trust: Math.round(-20 * NEG[level]), interest: -6, irritation: Math.round(20 * NEG[level]) },
        quality: "critical_error",
      },
    ],
  };
  const E = tpl.endings;
  const mode = retain ? "retain" : "sell";
  end("sale_clean", "sale", E.saleClean[mode].text, E.saleClean[mode].reason, "warm");
  end("sale_soft", "sale", E.saleSoft[mode].text, E.saleSoft[mode].reason, "warm");
  end("partial_next", "partial", E.partialNext[mode].text, E.partialNext[mode].reason, "interested");
  end("partial_vague", "partial", E.partialVague.text, E.partialVague.reason, "neutral");
  end("lost_close", "lost", E.lostClose.text, E.lostClose.reason, "reset");

  return { ...scenarioMeta(spec, pack), nodes: { ...nodes, ...endings } };
}

/** Everything except the node graph: cheap to compute, used by the menu and the lists. */
export function scenarioMeta(spec: CaseSpec, pack: ContentPack = ruPack): Omit<Scenario, "nodes"> {
  const { level, tier } = spec;
  const { persona, vocab, female, nameVoc } = localised(spec, pack);
  const { tpl } = pack;
  const ctx: Ctx = { name: persona.name, nameVoc, vocab, female, tier, perMonth: tpl.perMonth };
  const f = (s: string) => fillText(s, ctx);
  const retain = vocab.mode === "retain";
  const hasHidden = level >= 2; // the hidden-objection branch exists from level 2
  const hiddenLabel = hasHidden ? pack.beats[spec.hidden ?? "spouse_third_party"].label : null;
  const tagsOut: string[] = [...spec.tags];
  if (hasHidden && spec.hidden) tagsOut.push(spec.hidden);
  if (hasHidden) tagsOut.push("hidden_objection");

  return {
    id: spec.id,
    title: f(tpl.title.replace("{label}", pack.beats[spec.tags[0]].label)),
    level,
    niche: vocab.niche,
    channel: spec.channel,
    persona,
    objectionTags: [...new Set(tagsOut)] as Tag[],
    briefing: f(
      `${persona.name}, ${persona.age}, ${persona.profession}. ${tpl.briefing.channelWord}: ${tpl.channel[spec.channel]}. ${vocab.brief} ${retain ? tpl.briefing.firstStep : tpl.briefing.goal} ${tpl.briefing.known}: ${lcFirst(persona.pain)}.`,
    ),
    hiddenContext: f(
      `${persona.hiddenMotive}.${hiddenLabel ? ` ${tpl.hidden.objection}: ${hiddenLabel}.` : ""} ${tpl.hidden.red} — ${lcFirst(persona.redButton)}. ${tpl.hidden.gold} — ${lcFirst(persona.goldenKey)}. ${tpl.hidden.facts}${level === 5 ? ` ${tpl.hidden.level5}` : ""}`,
    ),
    autoEnd: tpl.autoEnd,
    initialState: { ...START[level], flags: {} },
    startNodeId: "open",
    estimatedTurns: spec.tags.length + (hasHidden ? 1 : 0) + 2,
  };
}

/**
 * Same scenario as buildScenario(), but the node graph (the expensive part: ~1.5 ms per case)
 * is built the first time `nodes` is read. The menu only reads metadata, so opening the app
 * does not pay for 100 graphs.
 */
export function buildScenarioLazy(spec: CaseSpec, pack: ContentPack = ruPack): Scenario {
  const meta = scenarioMeta(spec, pack);
  let cache: Scenario["nodes"] | undefined;
  return Object.defineProperty({ ...meta } as Scenario, "nodes", {
    enumerable: true,
    configurable: true,
    get: () => (cache ??= buildScenario(spec, pack).nodes),
  });
}
