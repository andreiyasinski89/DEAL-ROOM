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
import { mistakeCode, type MistakeCode } from "./data/mistakes";
import { CLOSER_CODES, EVENTS, OPENER_CODES, QUALITIES, STORY_CODES, type MoveSkeleton } from "./data/moves";
import { isGhostTag, ghostBeats as ruGhostBeats, type GhostTag } from "./data/ghost";
import { GHOST_CLOSER_CODES, GHOST_OPENER_CODES, GHOST_CLOSER_IDS, type GhostCloserId, type GhostOpenerId, type CloserId, type OpenerId } from "./data/moves";
import { hash01, variantsFor } from "./variants";
import { tierFacts, type Tier } from "./data/mwr";
import type { Vocab } from "./data/vocab";
import { ruPack } from "./packs/ru";
import type { ContentPack, Mv4, Psy, Tpl, VocabText } from "./packs/types";

export type CaseSpec = {
  id: string;
  level: Level;
  vocab: Vocab;
  tier: Tier;
  channel: Channel;
  persona: Persona;
  /** Ordered objection beats (without the hidden one). For a "diver" case the first one is the real reason of the silence. */
  tags: (BeatTag | GhostTag)[];
  /** Set for the "Divers" block: clients who vanished after the presentation. */
  ghost?: { opener: GhostOpenerId; closer: "default" | CloserId | GhostCloserId; days: 0 | 1 | 2; promise: number; tries: 0 | 1 | 2 };
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
/** Divers are guarded and a bit irritated from the start (about 45 of 100), and sceptical. */
const GHOST_START: Record<Level, { trust: number; interest: number; irritation: number }> = {
  1: { trust: 32, interest: 28, irritation: 40 },
  2: { trust: 32, interest: 28, irritation: 40 },
  3: { trust: 30, interest: 25, irritation: 44 },
  4: { trust: 27, interest: 22, irritation: 48 },
  5: { trust: 24, interest: 20, irritation: 52 },
};
/** Negative effects are scaled by level: forgiving at level 1, harsh at level 5. */
const NEG: Record<Level, number> = { 1: 0.7, 2: 0.85, 3: 1, 4: 1.15, 5: 1.3 };

/** Gender of the client (language independent: by persona id). */
const FEMALE_IDS = new Set(["irina", "svetlana", "olga", "natalia", "elena", "anna", "marina", "yulia", "tatyana", "vera", "ksenia", "polina", "larisa", "alla", "zoya"]);

/** Psychotype code from the Russian source label. */
const PSY: Record<string, Psy> = { "Аналитик": "analyst", "Драйвер": "driver", "Экспрессив": "expressive", "Миротворец": "peacemaker" };

type Ctx = { name: string; nameVoc: string; vocab: VocabText; female: boolean; tier: Tier; tpl: Tpl };

/**
 * Fills placeholders (two passes, because vocab strings contain placeholders too) and gendered forms:
 * Russian «сказал(а)» and the generic {male|female} used by the other languages.
 */
export function fillText(text: string, c: Ctx): string {
  const facts = tierFacts(c.tier, c.tpl.perMonth, (n) => c.tpl.points.replace("{n}", String(n)));
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
    renewPoints: facts.renewPoints,
    terms: c.tpl.terms + (c.tier === "Elite" ? c.tpl.termsRest : ""),
    renew: c.tpl.renew,
    fee: facts.fee,
    sub: facts.sub,
  };
  let s = text;
  for (let pass = 0; pass < 2; pass++) s = s.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in map ? map[k] : m));
  s = s.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m: string, f: string) => (c.female ? f : m));
  // Russian forms: сказал(а), привык(ла), должен(на), общительный(ая), вымотался(лась)
  return s.replace(/(\p{L}+)\((а|ла|лась|на|ая)\)/gu, (_, w: string, suf: string) => {
    if (!c.female) return w;
    if (suf === "на") return w.replace(/ен$/, "на");
    if (suf === "ая") return w.replace(/(ый|ой|ий)$/, "ая");
    if (suf === "лась") return w.replace(/лся$/, "лась");
    return w + suf;
  });
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
  const ctx: Ctx = { name: persona.name, nameVoc, vocab, female, tier, tpl };
  const f = (s: string) => fillText(s, ctx);
  const retain = vocab.mode === "retain";
  const hard = level >= 4;
  const psy: Psy = PSY[spec.persona.psychotype] ?? "peacemaker";
  const nodes: Record<string, ScenarioNode> = {};
  const endings: Record<string, ScenarioNode> = {};
  /** Stable pseudo-random number for this case (the same in every language). */
  const R = (k: string) => hash01(`${spec.id}|${k}`);

  /** The four answers of an extra move: excellent, good, weak, critical (the texts come from the pack, the rest from the skeleton). */
  const four = (m: Mv4, codes: MoveSkeleton["codes"], nexts: (string | ConditionalNext[])[], fx: Effects[]): Choice[] =>
    m.map((x, i) => ({
      id: "abcd"[i],
      text: f(x.t),
      next: nexts[i],
      effects: fx[i],
      quality: QUALITIES[i],
      ...(i < 2 ? { technique: x.label } : { mistake: x.label, mistakeCode: codes[i] as MistakeCode }),
      coachNote: x.note,
    }));

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
  const addBeat = (id: string, tag: BeatTag | GhostTag, progress: string | ConditionalNext[], seed: number, reveal = false, extra: { lead?: string; aNext?: string } = {}) => {
    const ghostTag = isGhostTag(tag);
    const base = ghostTag ? pack.ghost.beats[tag] : pack.beats[tag as BeatTag];
    const alt = ghostTag ? undefined : pack.extras.beatsAlt[tag as BeatTag];
    const ralt = ghostTag ? undefined : ruPack.extras.beatsAlt[tag as BeatTag];
    // one more wording of the client line and of the pushback; every answer may come in its second wording
    const b: Beat = alt ? { ...base, soft: [...base.soft, alt.soft], hard: [...base.hard, alt.hard], push: [...base.push, alt.push] } : base;
    const r: Beat = ghostTag ? ruGhostBeats[tag] : ruBeats[tag as BeatTag];
    const altOf = (slot: number) => !!alt && R(`${id}|o${slot}`) < 0.5;
    const opt = (slot: 0 | 1 | 2 | 3): Opt => (alt && altOf(slot) ? alt.alt[slot] : base.opts[slot]);
    const ropt = (slot: 0 | 1 | 2 | 3): Opt => (ralt && altOf(slot) ? ralt.alt[slot] : r.opts[slot]);
    // the persona's voice colours every other line, not all of them
    // (the confession of a "diver" is told in the client's own words, without the persona's stock phrases)
    const v = seed % 2 === 0 && !(spec.ghost && id === "b1") ? voice(seed) : { pre: "", post: "" };
    const lines = hard ? b.hard : b.soft;
    const say = lines[Math.floor(R(`${id}|say`) * lines.length)];
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
      text: f(`${extra.lead ? `${extra.lead} ` : ""}${reveal ? tpl.reveal : ""}${v.pre}${say}${v.post}`),
      hint: tpl.hint[b.family],
      tag,
      choices: [
        choice("a", opt(0), ropt(0), "excellent", extra.aNext ?? progress, withFlags(baseEffects("excellent", level), extra.lead ? { ...good, trusted: true } : good)),
        choice("b", opt(1), ropt(1), "good", progress, withFlags(baseEffects("good", level), extra.lead ? { ...(trust || value ? good : {}), value: true } : trust || value ? good : {})),
        // level 1 forgives a weak answer (the client just reacts), higher levels send it to the pushback node
        choice("c", opt(2), ropt(2), "weak", level === 1 ? progress : `${id}_r`, withFlags(baseEffects("weak", level), bad)),
        choice("d", opt(3), ropt(3), "critical_error", critNext, withFlags(baseEffects("critical_error", level), badCrit)),
      ],
    };
    nodes[`${id}_r`] = {
      type: "client",
      id: `${id}_r`,
      mood: "irritated",
      text: f(`${v.pre}${b.push[Math.floor(R(`${id}|push`) * b.push.length)]}`),
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
  const V = variantsFor(spec);
  const k = spec.tags.length;
  const ids = spec.tags.map((_, i) => `b${i + 1}`);
  const after = (i: number) => (i + 1 < k ? ids[i + 1] : "close");
  /** Where the talk goes after beat i: an event if one is placed there, otherwise the next beat. */
  const gap = (i: number) => (i in V.events ? `ev${i}` : after(i));
  const j = V.hiddenAfter;

  const rt = ruPack.tpl; // Russian source: mistake codes are derived from it
  const mv = (m: { t: string; mistake: string; note: string }, ru: { mistake: string }) => ({
    text: f(m.t),
    mistake: m.mistake,
    mistakeCode: mistakeCode(ru.mistake),
    coachNote: m.note,
  });

  // opening: the usual greeting, an objection right away, or one of the other openers
  const open = voice(spec.seed);
  const openFx: Effects[] = [
    { trust: 8, interest: 5, irritation: -3, setFlags: { trusted: true } },
    { trust: 3, interest: 4, irritation: 0, setFlags: { value: true } },
    { trust: Math.round(-6 * NEG[level]), interest: -2, irritation: Math.round(8 * NEG[level]) },
    { trust: Math.round(-18 * NEG[level]), interest: -6, irritation: Math.round(15 * NEG[level]) },
  ];
  const ghostOpener = spec.ghost ? pack.ghost.openers[V.opening as GhostOpenerId] : undefined;
  if (spec.ghost && ghostOpener) {
    nodes.open = {
      type: "client",
      id: "open",
      mood: "doubtful",
      text: f(ghostOpener.line),
      hint: pack.ghost.hint,
      choices: four(ghostOpener.opts, GHOST_OPENER_CODES, [ids[0], ids[0], ids[0], hard ? "lost_open" : ids[0]], openFx),
    };
    if (hard) end("lost_open", "lost", tpl.lostBye.replace("{bye}", ghostOpener.bye), tpl.gameOver.replace("{why}", ghostOpener.why), "reset");
  } else if (V.opening === "default") {
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
          effects: openFx[0],
          quality: "excellent",
          technique: tpl.open.a.tech,
          coachNote: tpl.open.a.note,
        },
        {
          id: "b",
          text: f(retain ? tpl.open.b.retain : tpl.open.b.sell),
          next: ids[0],
          effects: openFx[1],
          quality: "good",
          technique: tpl.open.b.tech,
          coachNote: tpl.open.b.note,
        },
        {
          id: "c",
          ...mv(tpl.open.c, rt.open.c),
          next: ids[0],
          effects: openFx[2],
          quality: "weak",
        },
        {
          id: "d",
          ...mv(tpl.open.d, rt.open.d),
          next: hard ? "lost_open" : ids[0],
          effects: openFx[3],
          quality: "critical_error",
        },
      ],
    };
  } else if (V.opening !== "straight") {
    const op = pack.extras.openers[V.opening as OpenerId];
    nodes.open = {
      type: "client",
      id: "open",
      mood: "neutral",
      text: f(op.line),
      hint: tpl.hint.open,
      choices: four(op.opts, OPENER_CODES, [ids[0], ids[0], ids[0], hard ? "lost_open" : ids[0]], openFx),
    };
  }
  if (hard && !spec.ghost && V.opening !== "straight") end("lost_open", "lost", tpl.open.lostText, tpl.open.lostReason, "reset");

  // objection beats (the first one carries the greeting when the client starts with the objection)
  spec.tags.forEach((tag, i) => {
    const progress: string | ConditionalNext[] = i === j ? [{ when: { trusted: true }, to: "h" }, { to: "s" }] : gap(i);
    addBeat(ids[i], tag, progress, spec.seed + i, false, {
      lead: V.opening === "straight" && i === 0 ? vocab.open[spec.channel] : undefined,
      aNext: V.story && i === 0 ? "st" : undefined,
    });
  });

  // the client opens up after a strong first answer: a personal remark of this very persona
  if (V.story) {
    const st = pack.extras.story;
    const sFx = [
      { ...baseEffects("excellent", level), setFlags: { trusted: true } },
      { ...baseEffects("good", level), setFlags: { value: true } },
      baseEffects("weak", level),
      { ...baseEffects("critical_error", level), setFlags: { trusted: false } },
    ];
    nodes.st = {
      type: "client",
      id: "st",
      mood: "warm",
      text: f(pack.extras.stories[spec.persona.id]),
      hint: st.hint,
      choices: four(st.opts, STORY_CODES, [gap(0), gap(0), gap(0), level <= 2 ? gap(0) : "lost_st"], sFx),
    };
    if (level > 2) end("lost_st", "lost", tpl.lostBye.replace("{bye}", st.bye), tpl.gameOver.replace("{why}", st.why), "reset");
  }

  if (j >= 0) {
    const hiddenTag = spec.hidden ?? "spouse_third_party";
    const stallTag: BeatTag = (spec.tags as string[]).includes("stall") ? "think_about_it" : "stall";
    addBeat("h", hiddenTag, gap(j), spec.seed + 11, true);
    addBeat("s", stallTag, gap(j), spec.seed + 13);
  }

  // events in the middle of the talk (an interruption, a competitor's offer, a request for a quote ...)
  for (const [gi, eid] of Object.entries(V.events)) {
    const i = Number(gi);
    const sk = EVENTS[eid];
    const tx = pack.extras.events[eid];
    const lostId = `lost_ev${i}`;
    const evFx = [
      { ...baseEffects("excellent", level), setFlags: { trusted: true } },
      { ...baseEffects("good", level), setFlags: { value: true } },
      baseEffects("weak", level),
      { ...baseEffects("critical_error", level), setFlags: { trusted: false } },
    ];
    nodes[`ev${i}`] = {
      type: "client",
      id: `ev${i}`,
      mood: eid === "tired" || eid === "silence" ? "doubtful" : "neutral",
      text: f(tx.line),
      hint: tpl.hint.other,
      ...(sk.tag ? { tag: sk.tag } : {}),
      choices: four(tx.opts, sk.codes, [after(i), after(i), after(i), level <= 2 ? after(i) : lostId], evFx),
    };
    if (level > 2) end(lostId, "lost", tpl.lostBye.replace("{bye}", tx.bye), tpl.gameOver.replace("{why}", tx.why), "reset");
  }

  // close: the client is ready, or asks for a discount / for the info by mail / "what exactly do I do now"
  const closeFx = [
    { trust: 8, interest: 6, irritation: -4 },
    { trust: 5, interest: 5, irritation: -2 },
    { trust: 1, interest: -4, irritation: 0 },
    { trust: Math.round(-20 * NEG[level]), interest: -6, irritation: Math.round(20 * NEG[level]) },
  ];
  const closeA: string | ConditionalNext[] = level === 1 ? "sale_clean" : [{ when: { trusted: true }, to: "sale_clean" }, { to: "partial_next" }];
  const closeB: ConditionalNext[] = [{ when: { value: true }, to: "sale_soft" }, { to: "partial_next" }];
  if (V.closing === "default") {
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
          next: closeA,
          effects: closeFx[0],
          quality: "excellent",
          technique: tpl.close.a.tech,
          coachNote: tpl.close.a.note,
        },
        {
          id: "b",
          text: f(retain ? tpl.close.b.retain : tpl.close.b.sell),
          next: closeB,
          effects: closeFx[1],
          quality: "good",
          technique: tpl.close.b.tech,
          coachNote: tpl.close.b.note,
        },
        {
          id: "c",
          ...mv(tpl.close.c, rt.close.c),
          next: "partial_vague",
          effects: closeFx[2],
          quality: "weak",
        },
        {
          id: "d",
          ...mv(tpl.close.d, rt.close.d),
          next: "lost_close",
          effects: closeFx[3],
          quality: "critical_error",
        },
      ],
    };
  } else {
    const isGhostCloser = (GHOST_CLOSER_IDS as readonly string[]).includes(V.closing);
    const cl = isGhostCloser ? pack.ghost.closers[V.closing as GhostCloserId] : pack.extras.closers[V.closing as CloserId];
    const clCodes = isGhostCloser ? GHOST_CLOSER_CODES[V.closing as GhostCloserId] : CLOSER_CODES[V.closing as CloserId];
    nodes.close = {
      type: "client",
      id: "close",
      mood: "warm",
      text: f(cl.line),
      hint: tpl.hint.close,
      choices: four(cl.opts, clCodes, [closeA, closeB, "partial_vague", "lost_close"], closeFx),
    };
  }
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
  const ctx: Ctx = { name: persona.name, nameVoc, vocab, female, tier, tpl };
  const f = (s: string) => fillText(s, ctx);
  const retain = vocab.mode === "retain";
  const hasHidden = level >= 2; // the hidden-objection branch exists from level 2
  const V = variantsFor(spec);
  const g = spec.ghost;
  const firstTag = spec.tags[0];
  const hiddenLabel = hasHidden && !g ? pack.beats[spec.hidden ?? "spouse_third_party"].label : null;
  const tagsOut: string[] = [...spec.tags];
  if (hasHidden && !g && spec.hidden) tagsOut.push(spec.hidden);
  if (hasHidden && !g) tagsOut.push("hidden_objection");
  const firstLabel = isGhostTag(firstTag) ? pack.ghost.beats[firstTag].label : pack.beats[firstTag].label;
  /** The situation of a "diver": when, what was said, how many attempts have already failed. */
  const ghostBriefing = g
    ? pack.ghost.briefing.replace("{days}", pack.ghost.days[g.days]).replace("{promise}", pack.ghost.promises[g.promise % 6]).replace("{tries}", pack.ghost.tries[g.tries])
    : "";

  return {
    id: spec.id,
    title: f(tpl.title.replace("{label}", firstLabel)),
    level,
    niche: g ? "ghost" : vocab.niche,
    channel: spec.channel,
    persona,
    objectionTags: [...new Set(tagsOut)] as Tag[],
    briefing: f(
      g
        ? `${persona.name}, ${persona.age}, ${persona.profession}. ${ghostBriefing.replace("{channel}", tpl.channel[spec.channel])} ${tpl.briefing.known}: ${lcFirst(persona.pain)}.`
        : `${persona.name}, ${persona.age}, ${persona.profession}. ${tpl.briefing.channelWord}: ${tpl.channel[spec.channel]}. ${vocab.brief} ${retain ? tpl.briefing.firstStep : tpl.briefing.goal} ${tpl.briefing.known}: ${lcFirst(persona.pain)}.`,
    ),
    hiddenContext: f(
      `${g ? pack.ghost.hidden[firstTag as GhostTag] : `${persona.hiddenMotive}.`}${hiddenLabel ? ` ${tpl.hidden.objection}: ${hiddenLabel}.` : ""} ${tpl.hidden.red} — ${lcFirst(persona.redButton)}. ${tpl.hidden.gold} — ${lcFirst(persona.goldenKey)}. ${tpl.hidden.facts}${level === 5 ? ` ${tpl.hidden.level5}` : ""}`,
    ),
    autoEnd: tpl.autoEnd,
    initialState: { ...(g ? GHOST_START[level] : START[level]), flags: {} },
    startNodeId: V.opening === "straight" ? "b1" : "open",
    estimatedTurns: spec.tags.length + (hasHidden ? 1 : 0) + 2 + Object.keys(V.events).length + (V.story ? 1 : 0),
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
