import {
  applyChoice,
  computeScore,
  createState,
  currentClientNode,
  currentEnding,
  getNode,
  OUTCOME_POINTS,
  QUALITY_POINTS,
} from "./engine";
import { T, translate, type Tr } from "../i18n";
import type { MistakeCode } from "../content/data/mistakes";
import type { GameState, Outcome, Quality, Scenario } from "./types";

export type BestStep = {
  nodeId: string;
  clientText: string;
  choiceId: string;
  text: string;
  quality: Quality;
  technique?: string;
  coachNote: string;
};

/** Optimal route through the scenario: best ending first, then the highest-quality moves. */
export function bestPath(s: Scenario): { steps: BestStep[]; outcome: Outcome } | null {
  type Best = { value: number; steps: BestStep[]; outcome: Outcome };
  const memo = new Map<string, Best>();
  const visiting = new Set<string>();

  const go = (st: GameState): Best | null => {
    const end = currentEnding(s, st);
    if (end) return { value: OUTCOME_POINTS[end.outcome] * 20, steps: [], outcome: end.outcome };
    const key = `${st.nodeId}|${st.trust}|${st.interest}|${st.irritation}|${Object.entries(st.flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .sort()
      .join(",")}`;
    const cached = memo.get(key);
    if (cached) return cached;
    if (visiting.has(key) || visiting.size > 60) return null;
    visiting.add(key);

    const node = currentClientNode(s, st)!;
    let best: Best | null = null;
    for (const c of node.choices) {
      const r = go(applyChoice(s, st, c.id));
      if (!r) continue;
      const value = r.value + QUALITY_POINTS[c.quality];
      if (!best || value > best.value) {
        best = {
          value,
          outcome: r.outcome,
          steps: [
            {
              nodeId: node.id,
              clientText: node.text,
              choiceId: c.id,
              text: c.text,
              quality: c.quality,
              technique: c.technique,
              coachNote: c.coachNote,
            },
            ...r.steps,
          ],
        };
      }
    }
    visiting.delete(key);
    if (best) memo.set(key, best);
    return best;
  };

  const r = go(createState(s));
  return r ? { steps: r.steps, outcome: r.outcome } : null;
}

export type Fork = {
  turn: number;
  clientText: string;
  chosen: { text: string; quality: Quality; coachNote: string };
  best: { text: string; quality: Quality; coachNote: string };
};

export type Debrief = {
  outcome: Outcome;
  reason: string;
  score: ReturnType<typeof computeScore>;
  turns: number;
  durationSec: number;
  good: string[];
  bad: string[];
  growth: string[];
  hidden: string[];
  fork: Fork | null;
};

const GROWTH: Partial<Record<MistakeCode, string>> = {
  lie: T("Никогда не обещать доход и гарантии — говорить только то, что можно подтвердить"),
  scarcity: T("Никогда не обещать доход и гарантии — говорить только то, что можно подтвердить"),
  pressure: T("Не давить: дать клиенту время и предложить конкретный следующий шаг"),
  dispute: T("Не спорить с возражением: присоединиться и уточнить его причину"),
  devalue: T("Не спорить с возражением: присоединиться и уточнить его причину"),
  excuse: T("Вместо оправданий — признать сомнение и задать уточняющий вопрос"),
  ignore: T("Сначала ответить на прямой вопрос клиента, потом продолжать"),
  monologue: T("Говорить короче и задавать вопросы: клиент должен говорить больше половины времени"),
};

const FALLBACK_GROWTH = T("Разбирать каждое возражение: присоединение → уточнение → аргумент → следующий шаг");

export function buildDebrief(s: Scenario, state: GameState, outcome: Outcome, reason: string, durationSec = 0, tr: Tr = (t, v) => translate("ru", t, v)): Debrief {
  const h = state.history;
  const score = computeScore(state, outcome);

  const good = h
    .filter((x) => x.quality === "excellent" || x.quality === "good")
    .sort((a, b) => QUALITY_POINTS[b.quality] - QUALITY_POINTS[a.quality] || a.turn - b.turn)
    .slice(0, 4)
    .sort((a, b) => a.turn - b.turn)
    .map((x) => tr("Ход {n}: {what} — {note}", { n: x.turn, what: x.technique ?? tr("сильный ход"), note: x.coachNote }));

  const badMoves = h.filter((x) => x.quality === "weak" || x.quality === "critical_error");
  const bad = badMoves.slice(0, 4).map((x) => tr("Ход {n}: {what} — {note}", { n: x.turn, what: x.mistake ?? tr("слабый ход"), note: x.coachNote }));

  const growth: string[] = [];
  const add = (t: string) => growth.includes(t) || growth.push(t);
  for (const m of badMoves) add(tr((m.mistakeCode && GROWTH[m.mistakeCode as MistakeCode]) || FALLBACK_GROWTH));
  if (outcome === "partial") add(tr("Закрывать на конкретный следующий шаг: дата, время, участники"));
  if (outcome === "sale" && growth.length === 0) add(tr("Повторить на уровне выше и сравнить результат"));
  if (growth.length === 0) add(tr(FALLBACK_GROWTH));

  // key fork: the turn where the chosen answer lost the most against the best one
  let fork: Fork | null = null;
  let gap = 0;
  for (const x of h) {
    const node = getNode(s, x.nodeId);
    if (node.type !== "client") continue;
    const best = node.choices.reduce((a, b) => (QUALITY_POINTS[b.quality] > QUALITY_POINTS[a.quality] ? b : a));
    const g = QUALITY_POINTS[best.quality] - QUALITY_POINTS[x.quality];
    if (g > gap) {
      gap = g;
      fork = {
        turn: x.turn,
        clientText: node.text,
        chosen: { text: x.choiceText, quality: x.quality, coachNote: x.coachNote },
        best: { text: best.text, quality: best.quality, coachNote: best.coachNote },
      };
    }
  }

  return {
    outcome,
    reason,
    score,
    turns: h.length,
    durationSec,
    good,
    bad,
    growth: growth.slice(0, 3),
    hidden: [s.hiddenContext, tr("Скрытый мотив: {m}", { m: s.persona.hiddenMotive })],
    fork,
  };
}

export const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
