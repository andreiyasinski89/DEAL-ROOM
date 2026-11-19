import type { Channel, Niche } from "../../engine/types";
import type { Tier } from "./mwr";

/** Segment of the MWR Life market. Every case sells or supports MWR Life. */
export type Vocab = {
  key: string;
  niche: Niche;
  label: string;
  /** "sell" = closing a registration/next step; "retain" = existing client (subscription, doubts). */
  mode: "sell" | "retain";
  tiers: Tier[];
  product: string;
  productAcc: string;
  next: string;
  proof: string;
  third: string;
  thirdWho: string;
  /** Briefing sentence (placeholders allowed). */
  brief: string;
  open: Record<Channel, string>;
  channels: Channel[];
};

const o = (call: string, chat: string, meeting: string, zoom: string = meeting): Record<Channel, string> => ({ call, chat, meeting, zoom });

const PROOF = "договор, условия компании и ваш личный кабинет";

export const vocabs: Vocab[] = [
  {
    key: "member_elite", niche: "member_elite", label: "Клиент · Elite (поездки для себя)", mode: "sell", tiers: ["Elite"],
    product: "членство MWR Life", productAcc: "членство MWR Life", proof: PROOF,
    next: "созвон с расчётом: ваши поездки за год против баллов Elite и подписки",
    third: "с супругом (супругой)", thirdWho: "супруга (супругу)",
    brief: "Вы предлагаете членство MWR Life уровня {tier}: {tierPrice}: {terms}; дальше подписка {sub}.",
    open: o("Алло? Да, слушаю. Вы по поводу клуба путешествий?", "Привет! Ты мне писал про какие-то поездки со скидками. Что за клуб?", "Здравствуйте. Вы хотели показать, как экономить на путешествиях?", "Здравствуйте, я на связи. Расскажите про ваш клуб путешествий."),
    channels: ["call", "meeting", "zoom", "chat"],
  },
  {
    key: "member_turbo", niche: "member_turbo", label: "Клиент · Turbo (больше баллов)", mode: "sell", tiers: ["Turbo"],
    product: "членство MWR Life", productAcc: "членство MWR Life", proof: PROOF,
    next: "созвон с расчётом по Turbo: ваши поездки за год, баллы и подписка",
    third: "с супругом (супругой)", thirdWho: "супруга (супругу)",
    brief: "Клиент выбирает между уровнями; вы предлагаете {tier}: {tierPrice}: {terms}; дальше подписка {sub}. Рекомендовать нужно то, что подходит клиенту, а не дороже.",
    open: o("Алло? Да. Вы про тот уровень, который подороже?", "Привет. Мне предлагали какой-то Turbo, ты в теме?", "Здравствуйте. Мы договаривались обсудить уровни членства.", "Здравствуйте. Расскажите про уровни Elite и Turbo."),
    channels: ["call", "zoom", "meeting", "chat"],
  },
  {
    key: "recruiting", niche: "recruiting", label: "Приглашение в бизнес (развитие сети)", mode: "sell", tiers: ["Turbo", "Elite"],
    product: "бизнес с MWR Life", productAcc: "бизнес с MWR Life", proof: PROOF,
    next: "встреча, где вы посмотрите, как выглядит работа с сетью, и решите, нужна ли она вам",
    third: "с семьёй", thirdWho: "семью",
    brief: "Вы приглашаете в бизнес: вход — {tier} ({tierPrice}: {terms}) и подписка {sub}. Доход возможен только от развития собственной сети; гарантий нет.",
    open: o("Алло? Да. Вы насчёт подработки?", "Привет. Ты писал про какой-то бизнес на путешествиях. Это что?", "Здравствуйте. Вы хотели рассказать про возможность заработка?", "Здравствуйте. Расскажите про ваш бизнес с путешествиями."),
    channels: ["meeting", "zoom", "chat", "call"],
  },
  {
    key: "cold", niche: "cold", label: "Холодный контакт", mode: "sell", tiers: ["Elite"],
    product: "членство MWR Life", productAcc: "членство MWR Life", proof: PROOF,
    next: "короткий созвон на 15 минут, где я отвечу на ваши вопросы",
    third: "с коллегами", thirdWho: "коллег",
    brief: "Человек вас не ждёт. Вы предлагаете {tier} ({tierPrice}: {terms}; дальше подписка {sub}), но цель разговора — заслужить право на следующий шаг.",
    open: o("Алло? Кто это? Откуда у вас мой номер?", "Здравствуйте. А мы знакомы? Что вам нужно?", "Здравствуйте. Мы знакомы?", "Добрый день. Я не записывался(ась) на этот разговор."),
    channels: ["chat", "call"],
  },
  {
    key: "repeat", niche: "repeat", label: "Действующий клиент: подписка и сомнения", mode: "retain", tiers: ["Elite", "Turbo"],
    product: "ваш аккаунт Travel Advantage", productAcc: "ваш аккаунт Travel Advantage", proof: PROOF,
    next: "созвон, где мы разберём вашу ситуацию с подпиской и аккаунтом",
    third: "с семьёй", thirdWho: "семью",
    brief: "Клиент уже зарегистрирован ({tier}), платит подписку {sub} и сомневается, продолжать ли. Цель — разобраться честно и сохранить доверие, а не удержать любой ценой.",
    open: o("Алло? Да. Вы насчёт моего аккаунта?", "Здравствуйте. Вы писали про мой аккаунт, я как раз хотел(а) разобраться с подпиской.", "Здравствуйте. Мы договаривались обсудить мой аккаунт.", "Здравствуйте. Разберёмся с моим аккаунтом?"),
    channels: ["call", "chat", "meeting"],
  },
  {
    key: "family", niche: "family", label: "Семья и отпуск", mode: "sell", tiers: ["Elite", "Turbo"],
    product: "членство MWR Life", productAcc: "членство MWR Life", proof: PROOF,
    next: "семейный созвон, где вы вместе посмотрите цифры",
    third: "с семьёй", thirdWho: "семью",
    brief: "Человек думает о семейных поездках. Вы предлагаете {tier}: {tierPrice}: {terms}; дальше подписка {sub}. Решение принимается вместе с семьёй.",
    open: o("Алло? Да, слушаю. Это вы насчёт путешествий для семьи?", "Здравствуйте. Вы писали про поездки для семьи. Что именно предлагаете?", "Здравствуйте. Расскажите, как вы помогаете с семейными поездками.", "Здравствуйте. Мы с семьёй планируем отпуск, расскажите про клуб."),
    channels: ["call", "meeting", "chat", "zoom"],
  },
  {
    key: "business", niche: "business", label: "Предприниматель и руководитель", mode: "sell", tiers: ["Turbo", "Elite"],
    product: "членство MWR Life", productAcc: "членство MWR Life", proof: PROOF,
    next: "разбор цифр: ваши поездки и поездки команды против баллов и подписки",
    third: "с партнёром или руководством", thirdWho: "партнёра или руководство",
    brief: "Собеседник — занятой руководитель или владелец бизнеса. Вы предлагаете {tier}: {tierPrice}: {terms}; дальше подписка {sub}. Ему важны цифры и время.",
    open: o("Добрый день. Слушаю вас, у меня десять минут.", "Здравствуйте. Прочитал ваше сообщение. Что именно предлагаете?", "Добрый день. Прошу по существу, у меня плотный график.", "Добрый день. Покажите коротко, что у вас."),
    channels: ["call", "meeting", "zoom", "chat"],
  },
  {
    key: "social", niche: "social", label: "Соцсети и блогеры", mode: "sell", tiers: ["Turbo", "Elite"],
    product: "членство MWR Life", productAcc: "членство MWR Life", proof: PROOF,
    next: "эфир-разбор: как выглядит аккаунт Travel Advantage и работа с сетью на практике",
    third: "с аудиторией и семьёй", thirdWho: "аудиторию и семью",
    brief: "Собеседник живёт в соцсетях и дорожит своей аудиторией. Вы предлагаете {tier}: {tierPrice}: {terms}; дальше подписка {sub}. Репутация перед подписчиками важнее быстрой продажи.",
    open: o("Алло? Да, мы списывались в директе.", "Привет! Увидел(а) твой пост про путешествия. Что за проект?", "Привет! Давно хотел(а) познакомиться вживую.", "Привет! Рассказывай, что за проект с путешествиями."),
    channels: ["chat", "zoom", "call", "meeting"],
  },
];

export const vocabByKey = (key: string): Vocab => {
  const v = vocabs.find((x) => x.key === key);
  if (!v) throw new Error(`Unknown vocab ${key}`);
  return v;
};
