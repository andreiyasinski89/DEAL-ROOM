import type { Tpl } from "../types";

/** English scenario templates (shape and placeholders: packs/types.ts; Russian original: packs/ru.ts). */
export const tpl: Tpl = {
  quote: ["“", "”"],
  title: "{name}: {label}",
  perMonth: "per month",
  tutorialTitle: "Case 0: How to play",
  channel: { call: "phone call", meeting: "face-to-face meeting", chat: "messenger chat", zoom: "Zoom presentation" },
  voice: {
    analyst: { pre: [], post: [" Specifics only, no fluff.", " I need facts, not emotions.", " Numbers, please.", " No generalities."] },
    driver: { pre: [], post: [" Let's make it quick.", " Short and to the point.", " Time is money.", " The point, please."] },
    expressive: { pre: ["Oh, I really don't know... ", "Listen, I'm full of doubts... ", "Oh, it's all so complicated... ", "Wow, but... "], post: [] },
    peacemaker: { pre: ["I feel awkward, but... ", "I don't want to offend you, but... ", "Please don't be offended... ", "You know, I'm shy, but... "], post: [] },
  },
  hint: {
    trust: "The client is testing you for honesty: they need verifiable facts and documents, not assurances.",
    value: "A question about value stands behind this objection. What do you know about the client's trips and spending?",
    other: "Don't argue and don't push. What will help the client decide at their own pace?",
    rec: "Admit the mistake and give control back to the client. After that, no pressure.",
    open: "The first seconds decide everything: respect the client's time and interest.",
    close: "A clear, soft next step is needed: no pressure and no invented scarcity.",
  },
  reveal: "Actually, I'll be honest. ",
  open: {
    a: {
      sell: "Good afternoon, {name}! I'd like to briefly tell you about the {productAcc}. It takes two minutes: is now a good time? If not, I'll come back whenever suits you.",
      retain: "Good afternoon, {name}! I'd like to calmly go through your Travel Advantage account and subscription with you: what's clear and what isn't. Is now a good time? If not, I'll come back whenever suits you.",
      tech: "Permission + respect for time",
      note: "You asked permission and respected the client's boundaries: trust grows from the very first seconds.",
    },
    b: {
      sell: "Hello! In short: we offer the {productAcc}. What is familiar to you about this topic?",
      retain: "Hello! In short: I'd like to help sort out the subscription and the account. What is hardest for you right now?",
      tech: "A short introduction + a question",
      note: "A clear introduction and a question draw the client into the conversation.",
    },
    c: { t: "Hello! I have a super offer for you that you can't miss!", mistake: "Pressure from the first seconds", note: "Loud words with no content put people on guard." },
    d: { t: "Hello, {name}! You've won a special bonus: you just need to confirm your participation.", mistake: "Manipulation / false pretext", note: "A false pretext for the conversation loses trust before it begins." },
    lostText: "{name} hangs up: “I don't like being lied to from the very first second.”",
    lostReason: "GAME OVER: a false pretext at the start of the conversation.",
  },
  close: {
    soft: "Okay, I'm ready to move on. What do you suggest?",
    hard: "Fine. But my terms are: no pressure and no surprises. What do you suggest next?",
    a: {
      sell: "Here's what I suggest: {next}. If no doubts remain after that, we'll register {tier} together. Deal?",
      retain: "Here's what I suggest: {next}. If after that it's clear to you whether to continue, we'll decide together. Deal?",
      tech: "Closing on a verifiable step",
      note: "The client checks and decides for themselves: a sale with no risk of a refund.",
    },
    b: {
      sell: "I can register {tier} right away: {tierPrice}, of which {fee} is the registration fee and {tierPoints} goes as points to your Travel Advantage account; after that, {sub}. All terms in writing. Does that suit you?",
      retain: "I can open the contract and the {sub} subscription terms with you right now and we decide together whether to continue. Does that suit you?",
      tech: "Alternative close",
      note: "All payments are named directly and the terms are in writing: a good second path.",
    },
    c: { t: "Okay, think about it, I'll write to you this week.", mistake: "A vague next step", note: "“I'll write this week” with no date and no purpose is a common cause of a quiet fade-out." },
    d: { t: "Then let's close today: there are only a couple of places left!", mistake: "False scarcity", note: "Invented scarcity destroys the trust you've earned." },
  },
  endings: {
    saleClean: {
      sell: { text: "{name}: “Agreed: {next}. Let's do it. If the numbers add up, we register {tier}.”", reason: "SALE CLOSED: the client agreed to a verifiable step and to register based on the result." },
      retain: { text: "{name}: “Agreed: {next}. Let's do it. Thank you for no pressure.”", reason: "SALE CLOSED: the client stays in touch, everything was clarified honestly and without pressure." },
    },
    saleSoft: {
      sell: { text: "{name}: “Okay, let's register {tier}. Send me the terms in writing.”", reason: "SALE CLOSED: {tier} registered with a full understanding of the payments: {tierPrice} (of which {fee} is the company fee and {tierPoints} is points) and {sub}." },
      retain: { text: "{name}: “Okay, let's open the contract and decide calmly. Thank you for no tricks.”", reason: "SALE CLOSED: the subscription terms were gone through together, and the client made an informed decision." },
    },
    partialNext: {
      sell: { text: "{name}: “Okay, {next}: let's do it. I'll decide afterwards.”", reason: "PARTIAL: a next step is agreed, but full trust is not there yet." },
      retain: { text: "{name}: “Okay, {next}: let's do it. I'll decide afterwards.”", reason: "PARTIAL: a review is agreed, and the client's final decision is still ahead." },
    },
    partialVague: { text: "{name}: “Well... write sometime. Goodbye.”", reason: "PARTIAL: the next step is vague, and the chance to win the client back is small." },
    lostClose: { text: "{name}: “A couple of places? I've heard that before. No, thank you.”", reason: "GAME OVER: invented scarcity at the finish destroyed the trust." },
  },
  autoEnd: {
    irritation: { text: "The client abruptly cuts the conversation: “I'm not interested. Don't call again.” A dial tone.", reason: "Irritation hit the maximum: the client hung up." },
    trust: { text: "“You know, I don't believe you anymore. Goodbye.” The client ends the conversation.", reason: "Trust dropped to zero: the client stopped believing you." },
  },
  lostBye: "{name}: “{bye}”",
  gameOver: "GAME OVER: {why}",
  briefing: { channelWord: "Channel", firstStep: "The first step is “{next}”.", goal: "The goal is to agree on the step “{next}” or to register {tier}.", known: "Known" },
  hidden: {
    objection: "Hidden objection",
    red: "The client's red button",
    gold: "The golden key",
    facts: "Facts to check yourself against: {tier} is {tierPrice} ({fee} company fee, {tierPoints} as points on the Travel Advantage account), subscription {sub}; income is possible only from building your own network, with no guarantees.",
    level5: "The client may exaggerate competitors' offers: check the facts.",
  },
};
