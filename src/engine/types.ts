export type Quality = "excellent" | "good" | "neutral" | "weak" | "critical_error";
export type Mood = "neutral" | "interested" | "doubtful" | "irritated" | "warm" | "reset";
export type Outcome = "sale" | "partial" | "lost";
export type Level = 1 | 2 | 3 | 4 | 5;
export type Niche = "member_elite" | "member_turbo" | "recruiting" | "cold" | "repeat" | "family" | "business" | "social";
export type Channel = "call" | "meeting" | "chat" | "zoom";

export type Effects = {
  trust?: number;
  interest?: number;
  irritation?: number;
  setFlags?: Record<string, boolean>;
};

export type ConditionalNext = {
  /** All listed flags must equal the given value. Omit `when` for the default branch. */
  when?: Record<string, boolean>;
  to: string;
};

export type Choice = {
  id: string;
  text: string;
  next: string | ConditionalNext[];
  effects: Effects;
  quality: Quality;
  technique?: string;
  mistake?: string;
  coachNote: string;
};

export type ClientNode = {
  type: "client";
  id: string;
  text: string;
  choices: Choice[];
  mood?: Mood;
  /** Short nudge for the "Jarvis hint" (not a ready answer). */
  hint?: string;
  /** Objection tag this node practises (feeds the weak-spot map). */
  tag?: string;
};

export type EndingNode = {
  type: "ending";
  id: string;
  outcome: Outcome;
  text: string;
  reason: string;
  mood?: Mood;
};

export type ScenarioNode = ClientNode | EndingNode;

export type Persona = {
  id: string;
  name: string;
  age: number;
  profession: string;
  psychotype: string;
  pain: string;
  hiddenMotive: string;
  redButton: string;
  goldenKey: string;
};

export type Scenario = {
  id: string;
  title: string;
  level: Level;
  niche: Niche;
  channel: Channel;
  persona: Persona;
  objectionTags: string[];
  briefing: string;
  hiddenContext: string;
  initialState: { trust: number; interest: number; irritation: number; flags: Record<string, boolean> };
  startNodeId: string;
  nodes: Record<string, ScenarioNode>;
  estimatedTurns: number;
};

export type HistoryEntry = {
  turn: number;
  nodeId: string;
  choiceId: string;
  choiceText: string;
  quality: Quality;
  technique?: string;
  mistake?: string;
  coachNote: string;
  delta: { trust: number; interest: number; irritation: number };
  after: { trust: number; interest: number; irritation: number };
};

export type GameState = {
  nodeId: string;
  trust: number;
  interest: number;
  irritation: number;
  flags: Record<string, boolean>;
  history: HistoryEntry[];
  combo: number;
  hintsUsed: number;
  /** Set when a scale threshold forced the ending. */
  autoEnding?: { outcome: Outcome; text: string; reason: string };
};
