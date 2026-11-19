/** Limits of the live (AI) mode. Its own tiny module so the app can show them without loading the prompts. */
export const LIMITS = {
  playerChars: 500,
  fieldChars: 600,
  transcriptMessages: 40,
  /** Hard cap on player turns in one live game. */
  maxTurns: 14,
  /** A sale cannot be declared before this many player turns. */
  minTurnsForSale: 4,
  /** Max abs change of one scale in one turn. */
  deltaMax: 25,
  replyChars: 700,
  noteChars: 400,
  /** Daily quota per user (enforced in the database, see 003_ai_usage.sql). */
  sessionsPerDay: 10,
  /** 10 games x 14 turns + a debrief each, with some room for retries. */
  turnsPerDay: 200,
} as const;
