import { z } from "zod";
import type { Scenario } from "./types";

const quality = z.enum(["excellent", "good", "neutral", "weak", "critical_error"]);
const mood = z.enum(["neutral", "interested", "doubtful", "irritated", "warm", "reset"]);
const scale = z.number().min(0).max(100);

const effects = z.object({
  trust: z.number().optional(),
  interest: z.number().optional(),
  irritation: z.number().optional(),
  setFlags: z.record(z.string(), z.boolean()).optional(),
});

const conditionalNext = z.object({
  when: z.record(z.string(), z.boolean()).optional(),
  to: z.string().min(1),
});

const choice = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  next: z.union([z.string().min(1), z.array(conditionalNext).min(1)]),
  effects,
  quality,
  technique: z.string().optional(),
  mistake: z.string().optional(),
  mistakeCode: z.string().optional(),
  coachNote: z.string().min(1, "coachNote is required"),
});

const clientNode = z.object({
  type: z.literal("client"),
  id: z.string().min(1),
  text: z.string().min(1),
  choices: z.array(choice),
  mood: mood.optional(),
  hint: z.string().optional(),
  tag: z.string().optional(),
});

const endingNode = z.object({
  type: z.literal("ending"),
  id: z.string().min(1),
  outcome: z.enum(["sale", "partial", "lost"]),
  text: z.string().min(1),
  reason: z.string().min(1),
  mood: mood.optional(),
});

const persona = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().int().positive(),
  profession: z.string(),
  psychotype: z.string(),
  pain: z.string(),
  hiddenMotive: z.string(),
  redButton: z.string(),
  goldenKey: z.string(),
});

export const scenarioSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  niche: z.enum(["member_elite", "member_turbo", "recruiting", "cold", "repeat", "family", "business", "social", "ghost"]),
  channel: z.enum(["call", "meeting", "chat", "zoom"]),
  persona,
  objectionTags: z.array(z.string()),
  briefing: z.string().min(1),
  hiddenContext: z.string().min(1),
  autoEnd: z
    .object({ irritation: z.object({ text: z.string(), reason: z.string() }), trust: z.object({ text: z.string(), reason: z.string() }) })
    .optional(),
  initialState: z.object({
    trust: scale,
    interest: scale,
    irritation: scale,
    flags: z.record(z.string(), z.boolean()),
  }),
  startNodeId: z.string().min(1),
  nodes: z.record(z.string(), z.discriminatedUnion("type", [clientNode, endingNode])),
  estimatedTurns: z.number().int().positive(),
});

export type ParseResult = { ok: true; scenario: Scenario } | { ok: false; errors: string[] };

export function parseScenario(data: unknown): ParseResult {
  const r = scenarioSchema.safeParse(data);
  if (r.success) return { ok: true, scenario: r.data as Scenario };
  return { ok: false, errors: r.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`) };
}
