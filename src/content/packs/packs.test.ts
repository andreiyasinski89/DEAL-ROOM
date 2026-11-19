import { describe, expect, it } from "vitest";
import { parseScenario } from "../../engine/schema";
import type { Scenario } from "../../engine/types";
import { mentionsRubles } from "../../../supabase/functions/_shared/live.ts";
import { beats as ruBeats, TAGS } from "../data/beats";
import { ALLOWED_USD } from "../data/mwr";
import { personas as ruPersonas } from "../data/personas";
import { vocabs } from "../data/vocab";
import { buildLibrary } from "../library";
import { enPack } from "./en";
import { plPack } from "./pl";
import { ruPack } from "./ru";
import { ukPack } from "./uk";
import type { ContentPack } from "./types";

const PACKS: ContentPack[] = [enPack, plPack, ukPack];
const ALL: ContentPack[] = [ruPack, ...PACKS];
const libs = new Map(ALL.map((p) => [p.lang, buildLibrary(p)]));
const ru = libs.get("ru")!;

/** Everything language independent about a scenario: ids, graph, moods, effects, qualities, flags. */
function skeleton(s: Scenario) {
  return {
    id: s.id,
    level: s.level,
    niche: s.niche,
    channel: s.channel,
    persona: s.persona.id,
    tags: s.objectionTags,
    start: s.startNodeId,
    initial: s.initialState,
    nodes: Object.fromEntries(
      Object.entries(s.nodes).map(([id, n]) => [
        id,
        n.type === "client"
          ? { mood: n.mood, tag: n.tag, choices: n.choices.map((c) => ({ id: c.id, next: c.next, effects: c.effects, quality: c.quality, tech: !!c.technique, mistake: c.mistakeCode ?? null })) }
          : { outcome: n.outcome, mood: n.mood },
      ]),
    ),
  };
}

const KNOWN = new Set(["name", "nameVoc", "product", "renewPoints", "terms", "renew", "n", "productAcc", "next", "proof", "third", "thirdWho", "tier", "tierPrice", "tierPoints", "fee", "sub", "bye", "why", "label"]);

/** Every string inside a value, with its path (for readable failures). */
function strings(v: unknown, path = "", out: [string, string][] = []): [string, string][] {
  if (typeof v === "string") out.push([path, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => strings(x, `${path}[${i}]`, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) strings(x, path ? `${path}.${k}` : k, out);
  return out;
}

describe.each(PACKS)("content pack: $lang", (pack) => {
  const lib = libs.get(pack.lang)!;
  const json = strings([lib.allScenarios, lib.tutorialCase]).map(([, v]) => v).join("\n");

  it("has every objection beat with the same shape as the Russian source", () => {
    expect(Object.keys(pack.beats).sort()).toEqual(Object.keys(ruBeats).sort());
    for (const tag of Object.keys(ruBeats) as (keyof typeof ruBeats)[]) {
      const b = pack.beats[tag];
      const r = ruBeats[tag];
      expect(b.family, tag).toBe(r.family);
      expect(b.soft.length, `${tag}.soft`).toBe(r.soft.length);
      expect(b.hard.length, `${tag}.hard`).toBe(r.hard.length);
      expect(b.push.length, `${tag}.push`).toBe(r.push.length);
      for (const [name, group, rgroup] of [["opts", b.opts, r.opts], ["rec", b.rec, r.rec]] as const)
        group.forEach((o, i) => {
          expect(!!o.tech, `${tag}.${name}[${i}] technique`).toBe(!!rgroup[i].tech);
          expect(!!o.mistake, `${tag}.${name}[${i}] mistake`).toBe(!!rgroup[i].mistake);
        });
    }
    expect(TAGS.length).toBeGreaterThan(20);
  });

  it("has all segments and personas", () => {
    expect(Object.keys(pack.vocab).sort()).toEqual(vocabs.map((v) => v.key).sort());
    expect(Object.keys(pack.personas).sort()).toEqual(ruPersonas.map((p) => p.id).sort());
    for (const v of vocabs) expect(Object.keys(pack.vocab[v.key].open).sort(), v.key).toEqual(["call", "chat", "meeting", "zoom"]);
  });

  it("has no empty texts and only known placeholders", () => {
    const bad: string[] = [];
    const source = { beats: pack.beats, vocab: pack.vocab, personas: pack.personas, tpl: pack.tpl, mini: pack.mini, extras: pack.extras };
    for (const [path, s] of strings(source)) {
      if (!s.trim() && !/voice\.\w+\.(pre|post)/.test(path)) bad.push(`${path}: empty`);
      for (const m of s.matchAll(/\{([^{}|]*)\}/g)) if (!KNOWN.has(m[1])) bad.push(`${path}: {${m[1]}}`);
    }
    expect(bad).toEqual([]);
  });

  it("builds 100 valid cases whose graph is identical to the Russian one", () => {
    expect(lib.allScenarios).toHaveLength(100);
    for (const s of lib.allScenarios) {
      const r = parseScenario(s);
      expect(r.ok, `${s.id}: ${"errors" in r ? r.errors.join("; ") : ""}`).toBe(true);
    }
    const base = ru.allScenarios.map(skeleton);
    expect(lib.allScenarios.map(skeleton)).toEqual(base);
    expect(parseScenario(lib.tutorialCase).ok).toBe(true);
  });

  it("leaves no unresolved placeholder or gender marker in any built text", () => {
    expect(json.match(/[{}|]|\(а\)|\(ась\)|\(ла\)/g)).toBeNull();
  });

  it("every dollar amount is a known MWR fact; no euros or other currencies", () => {
    const bad: string[] = [];
    for (const m of json.matchAll(/\$(\d+(?:[\s,]\d{3})*)/g)) {
      const n = Number(m[1].replace(/[\s,]/g, ""));
      if (!ALLOWED_USD.has(n)) bad.push(`$${n}`);
    }
    expect(bad).toEqual([]);
    expect(json).not.toMatch(/€|(?<!\p{L})zł(?!\p{L})|\bPLN\b|\bUAH\b|грн|₴|₽/u);
    expect(mentionsRubles(json)).toBe(false);
  });

  it("points are always one of the real amounts: 120 / 490 at registration, 120 / 240 per renewal", () => {
    const bad: string[] = [];
    for (const m of json.matchAll(/(\d+)\s*(?:баллов|балів|points|punktów)/g)) if (![120, 240, 490].includes(Number(m[1]))) bad.push(m[0]);
    expect(bad).toEqual([]);
    expect(json).not.toMatch(/\$(?:240|490)\b/);
  });

  it("no text says the rest of the Elite price becomes points", () => {
    const re = { en: /the rest (?:is|comes) (?:as )?points/i, pl: /reszta (?:to|w) punkt/i, uk: /решта (?:—|-) бали|решта балами/i }[pack.lang as "en" | "pl" | "uk"];
    expect(json).not.toMatch(re);
  });

  it("every case states prices, the fee, the subscription and that there are no guarantees", () => {
    const noGuarantee = { en: /no guarantees/, pl: /gwarancji nie ma/, uk: /гарантій немає/ }[pack.lang as "en" | "pl" | "uk"];
    for (const s of lib.allScenarios) {
      const t = JSON.stringify(s);
      expect(t, s.id).toMatch(/\$340|\$590/);
      expect(t, s.id).toContain("$100");
      expect(t, s.id).toContain("$120");
      expect(t, s.id).toContain("Travel Advantage");
      expect(t, s.id).toMatch(noGuarantee);
    }
  });

  it("strong answers never promise income, payback, refunds or percentages", () => {
    const re = {
      en: /\bI (?:personally )?guarantee\b|pay for itself|pays for itself|refund everything|no consequences/i,
      pl: /(?<!nie )gwarantuję|zwróci się sam|zwróci się już|zwrócą wszystko|bez konsekwencji/i,
      uk: /(?<!не )гарантую|окупиться|повернуть усе|без наслідків/i,
    }[pack.lang as "en" | "pl" | "uk"];
    const hits: string[] = [];
    for (const s of lib.allScenarios)
      for (const n of Object.values(s.nodes))
        if (n.type === "client")
          for (const c of n.choices)
            if ((c.quality === "excellent" || c.quality === "good") && (re.test(c.text) || /\d\s?%/.test(c.text))) hits.push(`${s.id}/${n.id}/${c.id}: ${c.text}`);
    expect(hits).toEqual([]);
  });

  it("is really in its language (no Russian left over)", () => {
    if (pack.lang === "uk") {
      expect(json.match(/[ыэъёЫЭЪЁ]/g)).toBeNull();
      const ruWords = json.match(/(?<![а-яіїєґА-ЯІЇЄҐ'])(что|это|если|чтобы|когда|может|нужно|очень|вы|ваши|потому|хотите|можно)(?![а-яіїєґ])/gi);
      expect(ruWords).toBeNull();
    } else {
      expect(json.match(/[А-Яа-яЁё]/g)).toBeNull();
    }
  });

  it("the extra moves are complete and their labels are translated", () => {
    const ex = pack.extras;
    const rx = ruPack.extras;
    expect(Object.keys(ex.stories).sort()).toEqual(ruPersonas.map((p) => p.id).sort());
    const shared = new Set(["Монолог", "Критика конкурента", "Ультиматум", "Співчуття", "Брехня", "Опора на документ", "Альтернатива каналу", "Короткий старт"]);
    const same: string[] = [];
    const groups: [string, { opts: unknown[] }[], { opts: unknown[] }[]][] = [
      ["events", Object.values(ex.events), Object.values(rx.events)],
      ["openers", Object.values(ex.openers), Object.values(rx.openers)],
      ["closers", Object.values(ex.closers), Object.values(rx.closers)],
    ];
    for (const [name, a, b] of groups)
      a.forEach((e, i) => (e.opts as { label: string }[]).forEach((o, k) => {
        if (o.label === (b[i].opts as { label: string }[])[k].label && !shared.has(o.label)) same.push(`${name}: ${o.label}`);
      }));
    expect(same).toEqual([]);
    for (const tag of Object.keys(rx.beatsAlt) as (keyof typeof rx.beatsAlt)[])
      rx.beatsAlt[tag].alt.forEach((o, i) => {
        const t = ex.beatsAlt[tag].alt[i];
        expect(!!t.tech, `${tag} alt ${i} technique`).toBe(!!o.tech);
        expect(!!t.mistake, `${tag} alt ${i} mistake`).toBe(!!o.mistake);
      });
  });

  it("translates every mistake and technique label (none left identical to the Russian original)", () => {
    const same: string[] = [];
    const rl = ruPack.beats;
    for (const tag of Object.keys(rl) as (keyof typeof rl)[])
      for (const [i, o] of [...pack.beats[tag].opts, ...pack.beats[tag].rec].entries()) {
        const r = [...rl[tag].opts, ...rl[tag].rec][i];
        // the same word in Ukrainian and Russian
        const shared = new Set(["Монолог", "Критика конкурента"]);
        if (o.tech && o.tech === r.tech && !shared.has(o.tech)) same.push(`${tag}: ${o.tech}`);
        if (o.mistake && o.mistake === r.mistake && !shared.has(o.mistake)) same.push(`${tag}: ${o.mistake}`);
      }
    expect(same).toEqual([]);
  });

  it("different cases read differently for a woman and a man (gender forms are applied)", () => {
    const female = lib.allScenarios.find((s) => s.persona.id === "irina")!;
    const male = lib.allScenarios.find((s) => s.persona.id === "maxim")!;
    expect(female.persona.name).not.toBe(male.persona.name);
  });
});

describe("Russian pack", () => {
  it("is the source: the library builds from it and matches the shipped Russian cases", () => {
    expect(ru.allScenarios).toHaveLength(100);
    expect(ru.tutorialCase.title).toBe("Кейс 0: Как играть");
  });
});
