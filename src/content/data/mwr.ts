/**
 * MWR Life facts used by every case. ONLY the facts below are stated as true in the content.
 * Anything else about the company (refund terms, subscription contents, commission plan,
 * point expiry, extra tier differences) must never be asserted by the "right" answers —
 * the correct behaviour is to check the official documents and show them in writing.
 */
export type Tier = "Elite" | "Turbo";

export const MWR = {
  fee: 100, // paid to the company, USD
  subscription: 120, // per month, USD
  tiers: {
    // points: credited to the Travel Advantage account at registration; renewPoints: per subscription renewal ($120).
    // NOTE: for Elite, price - fee - points is not explained by the company facts we have: the content never says where the rest goes.
    Elite: { price: 340, points: 120, renewPoints: 120 },
    Turbo: { price: 590, points: 490, renewPoints: 240 },
  },
} as const;

export const usd = (n: number) => `$${n}`;

/** Every dollar amount that may appear in the content. Anything else fails the content test. */
export const ALLOWED_USD = new Set([
  MWR.fee,
  MWR.subscription,
  MWR.subscription * 12,
  MWR.tiers.Elite.price,
  MWR.tiers.Turbo.price,
  MWR.tiers.Turbo.price - MWR.tiers.Elite.price,
]);

/** Points are written with a unit by the language pack ("120 баллов" / "120 points"): `pointsText` turns a number into that text. */
export const tierFacts = (t: Tier, perMonth = "в месяц", pointsText: (n: number) => string = (n) => `${n} баллов`) => ({
  tier: t,
  tierPrice: usd(MWR.tiers[t].price),
  tierPoints: pointsText(MWR.tiers[t].points),
  renewPoints: pointsText(MWR.tiers[t].renewPoints),
  fee: usd(MWR.fee),
  sub: `${usd(MWR.subscription)} ${perMonth}`,
});
