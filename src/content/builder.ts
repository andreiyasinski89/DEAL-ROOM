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
import { beats, type BeatTag, type Opt, type Beat, type Tag } from "./data/beats";
import { tierFacts, type Tier } from "./data/mwr";
import type { Vocab } from "./data/vocab";

export type CaseSpec = {
  id: string;
  title: string;
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

const CHANNEL_RU: Record<Channel, string> = { call: "телефонный звонок", meeting: "личная встреча", chat: "переписка в мессенджере", zoom: "Zoom-презентация" };

const START: Record<Level, { trust: number; interest: number; irritation: number }> = {
  1: { trust: 50, interest: 40, irritation: 5 },
  2: { trust: 45, interest: 35, irritation: 10 },
  3: { trust: 35, interest: 25, irritation: 15 },
  4: { trust: 30, interest: 25, irritation: 20 },
  5: { trust: 25, interest: 20, irritation: 25 },
};
/** Negative effects are scaled by level: forgiving at level 1, harsh at level 5. */
const NEG: Record<Level, number> = { 1: 0.7, 2: 0.85, 3: 1, 4: 1.15, 5: 1.3 };

const FEMALE = new Set(["Ирина", "Светлана", "Ольга", "Наталья", "Елена", "Анна", "Марина", "Юлия", "Татьяна", "Вера", "Ксения", "Полина", "Лариса", "Алла", "Зоя"]);

type Ctx = { name: string; vocab: Vocab; female: boolean; tier: Tier };

/** Fills placeholders (two passes, because vocab strings contain placeholders too) and gendered forms. */
export function fillText(text: string, c: Ctx): string {
  const facts = tierFacts(c.tier);
  const map: Record<string, string> = {
    name: c.name,
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
  for (let pass = 0; pass < 2; pass++)
    s = s.replace(/\{([A-Za-z]+)\}/g, (m, k: string) => (k in map ? map[k] : m));
  // gendered forms: «сказал(а)» → «сказала» / «сказал»
  return s.replace(/(\p{L}+)\(а\)/gu, (_, stem: string) => (c.female ? `${stem}а` : stem));
}

function voice(p: Persona, seed: number): { pre: string; post: string } {
  const v = (seed >> 1) % 4;
  switch (p.psychotype) {
    case "Аналитик": return { pre: "", post: [" Только конкретику, без воды.", " Мне нужны факты, а не эмоции.", " Цифры, пожалуйста.", " Без общих слов."][v] };
    case "Драйвер": return { pre: "", post: [" Давайте быстрее.", " Короче, по делу.", " Время дорого.", " Суть, пожалуйста."][v] };
    case "Экспрессив": return { pre: ["Ой, ну даже не знаю... ", "Слушайте, я в сомнениях... ", "Ох, как всё сложно... ", "Вау, но... "][v], post: "" };
    default: return { pre: ["Мне неловко, но... ", "Не хочу вас обижать, но... ", "Только не обижайтесь... ", "Знаете, я стесняюсь, но... "][v], post: "" };
  }
}

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

const HINT: Record<Beat["family"], string> = {
  trust: "Клиент проверяет вас на честность: ему нужны проверяемые факты и документы, а не заверения.",
  value: "За этим возражением стоит вопрос о ценности. Что вы знаете о поездках и тратах клиента?",
  other: "Не спорьте и не давите. Что поможет клиенту принять решение в его темпе?",
};

export function buildScenario(spec: CaseSpec): Scenario {
  const { vocab, persona, level, tier } = spec;
  const ctx: Ctx = { name: persona.name, vocab, female: FEMALE.has(persona.name), tier };
  const f = (s: string) => fillText(s, ctx);
  const retain = vocab.mode === "retain";
  const hard = level >= 4;
  const nodes: Record<string, ScenarioNode> = {};
  const endings: Record<string, ScenarioNode> = {};

  const choice = (id: string, o: Opt, quality: Quality, next: string | ConditionalNext[], effects: Effects): Choice => ({
    id,
    text: f(o.t),
    next,
    effects,
    quality,
    ...(o.tech ? { technique: o.tech } : {}),
    ...(o.mistake ? { mistake: o.mistake } : {}),
    coachNote: o.note,
  });

  const end = (id: string, outcome: "sale" | "partial" | "lost", text: string, reason: string, mood: Mood) => {
    endings[id] = { type: "ending", id, outcome, text: f(text), reason: f(reason), mood };
  };

  /** One objection beat: client node, pushback node and its own GAME OVER ending. */
  const addBeat = (id: string, tag: BeatTag, progress: string | ConditionalNext[], seed: number, reveal = false) => {
    const b = beats[tag];
    // the persona's voice colours every other line, not all of them
    const v = seed % 2 === 0 ? voice(persona, seed) : { pre: "", post: "" };
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
      text: f(`${reveal ? "Вообще-то, скажу честно. " : ""}${v.pre}${say}${v.post}`),
      hint: HINT[b.family],
      tag,
      choices: [
        choice("a", b.opts[0], "excellent", progress, withFlags(baseEffects("excellent", level), good)),
        choice("b", b.opts[1], "good", progress, withFlags(baseEffects("good", level), trust || value ? good : {})),
        // level 1 forgives a weak answer (the client just reacts), higher levels send it to the pushback node
        choice("c", b.opts[2], "weak", level === 1 ? progress : `${id}_r`, withFlags(baseEffects("weak", level), bad)),
        choice("d", b.opts[3], "critical_error", critNext, withFlags(baseEffects("critical_error", level), badCrit)),
      ],
    };
    nodes[`${id}_r`] = {
      type: "client",
      id: `${id}_r`,
      mood: "irritated",
      text: f(`${v.pre}${b.push[(seed >> 1) % b.push.length]}`),
      hint: "Признайте ошибку и верните контроль клиенту. Дальше — без давления.",
      tag,
      choices: [
        choice("a", b.rec[0], "good", progress, withFlags(baseEffects("good", level, true), good)),
        choice("b", b.rec[1], "weak", level <= 2 ? progress : lostId, baseEffects("weak", level)),
        choice("c", b.rec[2], "critical_error", lostId, baseEffects("critical_error", level)),
      ],
    };
    end(lostId, "lost", `${persona.name}: «${b.bye}»`, `GAME OVER: ${b.why}`, "reset");
  };

  // ---- sequence -----------------------------------------------------------
  const k = spec.tags.length;
  const ids = spec.tags.map((_, i) => `b${i + 1}`);
  const after = (i: number) => (i + 1 < k ? ids[i + 1] : "close");

  // hidden branch sits after the first trust-family beat (or after beat 1)
  const jTrust = spec.tags.findIndex((t) => beats[t].family === "trust");
  const j = level >= 2 ? (jTrust >= 0 ? jTrust : 0) : -1;

  // opening
  const open = voice(persona, spec.seed);
  nodes.open = {
    type: "client",
    id: "open",
    mood: "neutral",
    text: f(`${open.pre}${vocab.open[spec.channel]}${open.post}`),
    hint: "Первые секунды решают всё: уважайте время и интерес клиента.",
    choices: [
      {
        id: "a",
        text: f(
          retain
            ? "Добрый день, {name}! Хочу спокойно разобраться с вашим аккаунтом Travel Advantage и подпиской: что вам понятно, а что нет. Удобно сейчас? Если нет, вернусь в удобное время."
            : "Добрый день, {name}! Хочу коротко рассказать про {productAcc}. Займёт две минуты — удобно сейчас? Если нет, вернусь в удобное время.",
        ),
        next: ids[0],
        effects: { trust: 8, interest: 5, irritation: -3, setFlags: { trusted: true } },
        quality: "excellent",
        technique: "Разрешение + уважение ко времени",
        coachNote: "Вы спросили разрешение и уважили границы клиента — доверие растёт с первых секунд.",
      },
      {
        id: "b",
        text: f(retain ? "Здравствуйте! Коротко: хочу помочь разобраться с подпиской и аккаунтом. С чем вам сейчас сложнее всего?" : "Здравствуйте! Коротко: мы предлагаем {productAcc}. А что вам знакомо в этой теме?"),
        next: ids[0],
        effects: { trust: 3, interest: 4, irritation: 0, setFlags: { value: true } },
        quality: "good",
        technique: "Короткое представление + вопрос",
        coachNote: "Чёткое представление и вопрос — клиент вовлекается в разговор.",
      },
      {
        id: "c",
        text: "Здравствуйте! У меня для вас суперпредложение, которое нельзя пропустить!",
        next: ids[0],
        effects: { trust: Math.round(-6 * NEG[level]), interest: -2, irritation: Math.round(8 * NEG[level]) },
        quality: "weak",
        mistake: "Давление с первых секунд",
        coachNote: "Громкие слова без содержания настораживают.",
      },
      {
        id: "d",
        text: f("Здравствуйте, {name}! Вы выиграли специальный бонус — нужно только подтвердить участие."),
        next: hard ? "lost_open" : ids[0],
        effects: { trust: Math.round(-18 * NEG[level]), interest: -6, irritation: Math.round(15 * NEG[level]) },
        quality: "critical_error",
        mistake: "Манипуляция / ложный повод",
        coachNote: "Ложный повод для разговора — потеря доверия ещё до начала.",
      },
    ],
  };
  if (hard) end("lost_open", "lost", `${persona.name} кладёт трубку: «Не люблю, когда мне врут с первой секунды».`, "GAME OVER: ложный повод в начале разговора.", "reset");

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
    text: f(hard ? "Ладно. Но условия такие: без давления и без сюрпризов. Что предлагаете дальше?" : "Хорошо, я готов(а) двигаться дальше. Что вы предлагаете?"),
    hint: "Нужен ясный, мягкий следующий шаг: без давления и без выдуманного дефицита.",
    choices: [
      {
        id: "a",
        text: f(retain
          ? "Предлагаю так: {next}. Если после этого вам будет понятно, продолжать ли, — решим вместе. Договорились?"
          : "Предлагаю так: {next}. Если после этого сомнений не останется — оформим {tier} вместе. Договорились?"),
        next: level === 1 ? "sale_clean" : [{ when: { trusted: true }, to: "sale_clean" }, { to: "partial_next" }],
        effects: { trust: 8, interest: 6, irritation: -4 },
        quality: "excellent",
        technique: "Закрытие на проверяемый шаг",
        coachNote: "Клиент сам проверяет и решает — продажа без риска возврата.",
      },
      {
        id: "b",
        text: f(retain
          ? "Могу прямо сейчас открыть с вами договор и условия подписки {sub} и решить вместе, продолжать или нет. Подходит?"
          : "Могу сразу оформить {tier}: {tierPrice}, из них {fee} — регистрация, {tierPoints} — баллы на ваш аккаунт Travel Advantage; дальше {sub}. Все условия письменно. Подходит?"),
        next: [{ when: { value: true }, to: "sale_soft" }, { to: "partial_next" }],
        effects: { trust: 5, interest: 5, irritation: -2 },
        quality: "good",
        technique: "Закрытие-альтернатива",
        coachNote: "Все платежи названы прямо, условия письменно — хороший второй путь.",
      },
      {
        id: "c",
        text: "Хорошо, подумайте, я напишу вам на неделе.",
        next: "partial_vague",
        effects: { trust: 1, interest: -4, irritation: 0 },
        quality: "weak",
        mistake: "Размытый следующий шаг",
        coachNote: "«Напишу на неделе» без даты и цели — частая причина тихого слива.",
      },
      {
        id: "d",
        text: "Тогда давайте закроем сегодня — осталась всего пара мест!",
        next: "lost_close",
        effects: { trust: Math.round(-20 * NEG[level]), interest: -6, irritation: Math.round(20 * NEG[level]) },
        quality: "critical_error",
        mistake: "Ложный дефицит",
        coachNote: "Выдуманный дефицит разрушает заработанное доверие.",
      },
    ],
  };
  if (retain) {
    end("sale_clean", "sale", "{name}: «Договорились. {next} — давайте. Спасибо, что без давления».", "SALE CLOSED: клиент остаётся на связи, всё прояснено честно и без давления.", "warm");
    end("sale_soft", "sale", "{name}: «Хорошо, давайте откроем договор и решим спокойно. Спасибо, что без уловок».", "SALE CLOSED: условия подписки разобраны вместе, клиент принял осознанное решение.", "warm");
    end("partial_next", "partial", "{name}: «Хорошо, {next} — давайте. Решение приму после».", "PARTIAL: договорились о разборе, окончательное решение клиента впереди.", "interested");
  } else {
    end("sale_clean", "sale", "{name}: «Договорились. {next} — давайте. Если цифры сойдутся — оформляем {tier}».", "SALE CLOSED: клиент согласился на проверяемый шаг и оформление по результату.", "warm");
    end("sale_soft", "sale", "{name}: «Хорошо, оформляем {tier}. Условия пришлите письменно».", "SALE CLOSED: оформлен {tier} при полном понимании платежей: {tierPrice} (из них {fee} — взнос компании, {tierPoints} — баллы) и {sub}.", "warm");
    end("partial_next", "partial", "{name}: «Хорошо, {next} — давайте. Решение приму после».", "PARTIAL: договорились о следующем шаге, но полного доверия пока нет.", "interested");
  }
  end("partial_vague", "partial", "{name}: «Ну... напишите как-нибудь. До свидания».", "PARTIAL: следующий шаг размыт — шанс вернуть клиента невелик.", "neutral");
  end("lost_close", "lost", "{name}: «Пара мест? Мне это уже говорили. Нет, спасибо».", "GAME OVER: выдуманный дефицит на финише разрушил доверие.", "reset");

  return { ...scenarioMeta(spec), nodes: { ...nodes, ...endings } };
}

/** Everything except the node graph: cheap to compute, used by the menu and the lists. */
export function scenarioMeta(spec: CaseSpec): Omit<Scenario, "nodes"> {
  const { vocab, persona, level, tier } = spec;
  const ctx: Ctx = { name: persona.name, vocab, female: FEMALE.has(persona.name), tier };
  const f = (s: string) => fillText(s, ctx);
  const retain = vocab.mode === "retain";
  const hasHidden = level >= 2; // the hidden-objection branch exists from level 2
  const hiddenLabel = hasHidden ? beats[spec.hidden ?? "spouse_third_party"].label : null;
  const tagsOut: string[] = [...spec.tags];
  if (hasHidden && spec.hidden) tagsOut.push(spec.hidden);
  if (hasHidden) tagsOut.push("hidden_objection");

  return {
    id: spec.id,
    title: spec.title,
    level,
    niche: vocab.niche,
    channel: spec.channel,
    persona,
    objectionTags: [...new Set(tagsOut)] as Tag[],
    briefing: f(
      `${persona.name}, ${persona.age}, ${persona.profession}. Канал: ${CHANNEL_RU[spec.channel]}. ${vocab.brief} ${retain ? "Первый шаг — «{next}»." : "Цель — договориться о шаге «{next}» или оформить {tier}."} Известно: ${persona.pain.toLowerCase()}.`,
    ),
    hiddenContext: f(
      `${persona.hiddenMotive}.${hiddenLabel ? ` Скрытое возражение: ${hiddenLabel}.` : ""} Красная кнопка клиента — ${persona.redButton.toLowerCase()}. Золотой ключ — ${persona.goldenKey.toLowerCase()}. Факты для проверки себя: {tier} — {tierPrice} ({fee} взнос компании, {tierPoints} баллами на аккаунт Travel Advantage), подписка {sub}; заработок возможен только от развития собственной сети, гарантий нет.${level === 5 ? " Клиент может преувеличивать предложения конкурентов — проверяйте факты." : ""}`,
    ),
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
export function buildScenarioLazy(spec: CaseSpec): Scenario {
  const meta = scenarioMeta(spec);
  let cache: Scenario["nodes"] | undefined;
  return Object.defineProperty({ ...meta } as Scenario, "nodes", {
    enumerable: true,
    configurable: true,
    get: () => (cache ??= buildScenario(spec).nodes),
  });
}
