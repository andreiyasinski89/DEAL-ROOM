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
    Elite: { price: 340, points: 240 },
    Turbo: { price: 590, points: 490 },
  },
} as const;

export const usd = (n: number) => `$${n}`;

/** Every dollar amount that may appear in the content. Anything else fails the content test. */
export const ALLOWED_USD = new Set([
  MWR.fee,
  MWR.subscription,
  MWR.subscription * 12,
  MWR.tiers.Elite.price,
  MWR.tiers.Elite.points,
  MWR.tiers.Turbo.price,
  MWR.tiers.Turbo.points,
  MWR.tiers.Turbo.price - MWR.tiers.Elite.price,
]);

export const tierFacts = (t: Tier) => ({
  tier: t,
  tierPrice: usd(MWR.tiers[t].price),
  tierPoints: usd(MWR.tiers[t].points),
  fee: usd(MWR.fee),
  sub: `${usd(MWR.subscription)} в месяц`,
});
