import { describe, expect, it } from "vitest";
import { allScenarios } from "./index";
import { ALLOWED_USD, MWR, tierFacts, usd } from "./data/mwr";
import { MWR_CORE } from "./matrix";
import { mentionsRubles } from "../../supabase/functions/_shared/live.ts";

const choicesOf = () =>
  allScenarios.flatMap((s) =>
    Object.values(s.nodes).flatMap((n) => (n.type === "client" ? n.choices.map((c) => ({ s, n, c })) : [])),
  );

describe("MWR Life facts", () => {
  it("constants match the agreed prices", () => {
    expect(MWR.tiers.Elite).toEqual({ price: 340, points: 240 });
    expect(MWR.tiers.Turbo).toEqual({ price: 590, points: 490 });
    expect(MWR.fee).toBe(100);
    expect(MWR.subscription).toBe(120);
    // price = company fee + points for both tiers
    for (const t of Object.values(MWR.tiers)) expect(t.price).toBe(MWR.fee + t.points);
    expect(usd(340)).toBe("$340");
    expect(tierFacts("Turbo").sub).toBe("$120 в месяц");
  });
});

describe("MWR Life adaptation (all cases)", () => {
  it("every dollar amount in the content is a known MWR fact", () => {
    const bad: string[] = [];
    for (const s of allScenarios) {
      const text = JSON.stringify(s);
      for (const m of text.matchAll(/\$(\d+(?:\s\d{3})*)/g)) {
        const n = Number(m[1].replace(/\s/g, ""));
        if (!ALLOWED_USD.has(n)) bad.push(`${s.id}: $${n}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("no foreign prices or invented numbers (euros, thousands, trial month)", () => {
    for (const s of allScenarios) expect(JSON.stringify(s), s.id).not.toMatch(/€|тысяч|пробный месяц|пробный курс/i);
  });

  it("scripted dialogues never name money in rubles or other currencies (dollars or euros only)", () => {
    for (const s of allScenarios) expect(mentionsRubles(JSON.stringify(s)), s.id).toBe(false);
  });

  it("every case states tier price, company fee, points, subscription and the no-guarantee rule", () => {
    for (const s of allScenarios) {
      const text = JSON.stringify(s);
      expect(text, s.id).toMatch(/\$340|\$590/);
      expect(text, s.id).toContain("$100");
      expect(text, s.id).toContain("$120");
      expect(text, s.id).toContain("Travel Advantage");
      expect(text, s.id).toContain("гарантий нет");
    }
  });

  it("every generated case contains at least one MWR-specific objection", () => {
    for (const s of allScenarios) {
      if (s.id === "mwr-l3-irina-accountant") continue;
      expect(s.objectionTags.some((t) => (MWR_CORE as string[]).includes(t)), s.id).toBe(true);
    }
  });

  it("the new MWR objections are well covered", () => {
    for (const t of ["subscription", "points_value", "tier_choice", "refund_cancel", "network_realism"]) {
      const n = allScenarios.filter((s) => s.objectionTags.includes(t)).length;
      expect(n, t).toBeGreaterThanOrEqual(8);
    }
  });

  it("compliance: promises of income, payback, refunds or free perks are never a strong answer", () => {
    const re = /(?<!не )(?<!нет )гарантир|окупится|вернётся полностью|вернут всё|без последствий|точно дешевле|вернут без/i;
    const strong = new Set(["excellent", "good"]);
    const hits = choicesOf().filter(({ c }) => re.test(c.text) && strong.has(c.quality));
    expect(hits.map(({ s, n, c }) => `${s.id}/${n.id}/${c.id}: ${c.text}`)).toEqual([]);
  });

  it("strong answers about refunds or cancelling point to the documents", () => {
    for (const s of allScenarios)
      for (const n of Object.values(s.nodes))
        if (n.type === "client" && /(?<![а-я])возврат|вернут(?![а-я])|отключ/i.test(n.text))
          for (const c of n.choices.filter((x) => x.quality === "excellent"))
            expect(c.text, `${s.id}/${n.id}`).toMatch(/договор|письменн|документ/i);
  });

  it("every case has several sale-quality answers that never invent terms", () => {
    // sanity: strong answers never contain percentages (no invented discounts)
    const hits = choicesOf().filter(({ c }) => (c.quality === "excellent" || c.quality === "good") && /\d\s?%/.test(c.text));
    expect(hits.map(({ s, c }) => `${s.id}: ${c.text}`)).toEqual([]);
  });
});
