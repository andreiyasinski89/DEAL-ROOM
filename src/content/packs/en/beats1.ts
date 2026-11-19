import type { Beat, BeatTag } from "../../data/beats";

/** English objection bank, part 1 (see data/beats.ts for the Russian source and the placeholder rules). */
export const beats1: Partial<Record<BeatTag, Beat>> = {
  price: {
    label: "“Too expensive”", family: "value",
    soft: ["{tierPrice} to get in and {sub} on top: that's a bit much for me.", "Oh, {tierPrice}... and {sub} on top. Pretty pricey."],
    hard: ["{tierPrice} to join and {sub}? Every booking aggregator is free. Justify it or stop wasting my time.", "{tierPrice}? For that money I can fly anywhere without any subscriptions."],
    opts: [
      { t: "Entry is {tierPrice}: {terms}. How much do you spend on trips in a year?", tech: "Separating price from value", note: "You split the price into its parts honestly and moved on to what they actually spend on travel." },
      { t: "Joining is {tierPrice}, then {sub}. I can lay out where each part goes and show you the terms in writing.", tech: "Price transparency", note: "Honest and transparent, but without a question about their trips the doubt stays where it was." },
      { t: "But it's a really good deal! People join and they're happy, and you're hesitating even though the price is perfectly reasonable and there's nothing to wait for.", mistake: "Pressure by social proof", note: "Other people's reviews do not answer a personal “too expensive”." },
      { t: "It's an investment: the entry fee pays for itself in a couple of months, I guarantee it, so there's really nothing to worry about, you just have to decide.", mistake: "False promise of payback", note: "There are no payback guarantees and there cannot be. A promise like that is a straight road to a complaint." },
    ],
    push: ["No, I still don't understand what I'm paying for.", "You just keep naming numbers and I don't see the point."],
    rec: [
      { t: "Let's calculate with your own numbers: how much you spend on holidays in a year and what {tierPoints} would cover. If there's no benefit, I'll tell you so.", tech: "Calculation on the client's data", note: "You offered to test the benefit with their money and promised honesty if there is none." },
      { t: "I can ask the company for a discount, but you need to decide quickly.", mistake: "Invented discount", note: "The price is fixed by the terms. Promising a discount that doesn't exist is a lie and loses trust." },
      { t: "The price goes up next month, so you need to hurry.", mistake: "False scarcity", note: "Invented scarcity destroys trust." },
    ],
    bye: "Expensive and unclear. No, thank you.", why: "The price was never tied to the client's real benefit, so they could not see what they were paying for.",
  },
  subscription: {
    label: "“Another $120 subscription?”", family: "value",
    soft: ["Wait, another {sub}? I thought you pay once and that's it.", "I don't get it... so besides {tierPrice} I have to keep paying {sub}?"],
    hard: ["{sub}?! Every single month? That's almost $1,440 a year. It's a trap, you just didn't tell me up front.", "You kept quiet about the subscription. What else aren't you telling me?"],
    opts: [
      { t: "Yes, {sub} is a separate payment. Over a year that's $1,440 plus the entry fee. Shall we check whether it pays off with your trips?", tech: "Honesty about recurring costs", note: "You named the yearly sum yourself and offered to check the benefit, which removes the feeling of a trap." },
      { t: "Yes, the subscription is {sub}. I'll show you in the company's documents what it includes and you can see for yourself.", tech: "Relying on documents", note: "Right not to retell it from memory. But without a question about their trips the number stayed abstract." },
      { t: "That's peanuts, people spend more on coffee than on the subscription.", mistake: "Belittling the objection", note: "To the client it's not peanuts. Comparing it to coffee sounds like mockery." },
      { t: "You can cancel the subscription any time with no consequences, don't worry, it's all very flexible, nobody is holding anyone back.", mistake: "Unverified promise", note: "You don't know the cancellation terms for certain. You can't promise what isn't in the document." },
    ],
    push: ["You didn't tell me right away. Now I'm not sure I'm being told everything.", "So that's not all, is it? What else will pop up?"],
    rec: [
      { t: "You're right: I should have mentioned the subscription at the start. Here are all the payments: {tierPrice} to join and {sub}. The rest is in the contract, so let's read it together.", tech: "Admitting the mistake + completeness", note: "Admitting the slip and laying out every payment is the best way to win trust back." },
      { t: "Well, it's a small thing, what matters is the result.", mistake: "Ignoring the objection", note: "The client is angry exactly about what was left unsaid, and you are downplaying it again." },
      { t: "Everybody pays the subscription and nobody complains.", mistake: "Pressure / false generalisation", note: "“Everybody pays” is not an argument, and you can't know that nobody complains." },
    ],
    bye: "Hidden payments are not for me. Goodbye.", why: "The client did not hear about the subscription right away, and it felt like something left unsaid.",
  },
  points_value: {
    label: "“Points aren't money?”", family: "trust",
    soft: ["Hold on, I pay {tierPrice} and only {tierPoints} goes to my account, and {fee} just goes away?", "So points are not money, and I hand over {fee} for good?"],
    hard: ["So I pay {tierPrice} and get points on their platform? That's a game of Monopoly. Explain it properly.", "{fee} goes to the company, {tierPoints} goes to the account. So where's the benefit for me and not for you?"],
    opts: [
      { t: "Correct: {fee} is the company's fee, and the {tierPoints} on your Travel Advantage are for trips. It is not cash.", tech: "Precise wording, no gloss", note: "You confirmed their understanding and said plainly that points are not money. That removes distrust." },
      { t: "Exactly: {terms}. Want me to show it in the personal account?", tech: "Facts + demonstration", note: "Accurate and visual, but without a question about whether such points would be useful to them." },
      { t: "Points are the same as money, they just sit in a different account, so in effect you lose nothing and even gain more.", mistake: "Distorting the facts", note: "Points are not equal to money: they can't simply be withdrawn. Such a swap is grounds for a complaint." },
      { t: "You can withdraw points any time and get your money back, it's your money after all, so there's really no risk at all.", mistake: "False promise", note: "You don't know of such a condition. Inventing it means deceiving the client." },
    ],
    push: ["What you just said is different. Are points money or not?", "I thought so: you're dodging the subject. Say it straight."],
    rec: [
      { t: "Straight: points are not money. {fee} is the company's fee, and {tierPoints} are for paying for trips on the platform. If that doesn't suit you, we'll say so.", tech: "Direct answer", note: "A direct answer after an imprecise one brings back the client's respect." },
      { t: "Well, it's basically the same thing, don't nitpick.", mistake: "Ignoring the objection", note: "For the client the difference is fundamental, and you deny it." },
      { t: "What matters is that you get the chance to travel cheaply.", mistake: "Evading the question", note: "You didn't answer the direct question and added an unverified promise." },
    ],
    bye: "Nobody tells me plainly what I'm getting. No, thanks.", why: "The client never heard the difference between points and money stated directly.",
  },
  tier_choice: {
    label: "“Elite or Turbo?”", family: "value",
    soft: ["What's the difference between Elite and Turbo? Which one should I take?", "I'm being offered Elite, but my friend says I need Turbo. Who's right?"],
    hard: ["Elite, Turbo: you just want to sell the pricier one. Explain the difference without the marketing.", "Why should I take Turbo for $590 when Elite costs $340?"],
    opts: [
      { t: "Elite is $340, Turbo is $590; in both, $100 is the company's fee and points go to the account. How often do you travel?", tech: "Comparison by facts + a question", note: "You gave the numbers and tied the choice to the client's real trips, not to your benefit." },
      { t: "The difference is the price and the points: 120 for Elite and 490 for Turbo at registration, and a subscription renewal gives 120 and 240. For anything else let's check the company's official table.", tech: "Relying on official data", note: "Honest: you don't invent other differences, you offer to verify them." },
      { t: "Take Turbo, it's always better: more points and a serious level, and Elite is only for people who don't believe in themselves.", mistake: "Pressure / upsell without grounds", note: "Selling higher without finding out the needs is the client's red button." },
      { t: "Turbo gives twice the income, so it's better for everyone.", mistake: "False promise of income", note: "You can't promise income, let alone “twice as much”." },
    ],
    push: ["You didn't answer my question. What is the real difference?", "That sounds like “take the pricier one”. Explain it like a human."],
    rec: [
      { t: "Fair. Let's do it this way: Elite is $340, Turbo is $590. What volume of travel do you plan? We'll pick what suits you, even if that's Elite.", tech: "Recommendation in the client's favour", note: "Readiness to recommend the cheaper option is the strongest signal of honesty." },
      { t: "Well, Turbo is for people who are serious about it.", mistake: "Pressure", note: "Pressing on “seriousness” stings the client." },
      { t: "If you take Elite, it means you don't believe in success.", mistake: "Manipulation", note: "Manipulating with status is the way to lose a client." },
    ],
    bye: "They're trying to sell me the pricier one. No, thanks.", why: "The tier choice was not tied to the client's needs, so they felt pressure.",
  },
  refund_cancel: {
    label: "“If I don't like it, do I get my money back?”", family: "trust",
    soft: ["And if I don't like it, will I get my money back?", "How do I get out if it doesn't suit me? What happens to the money then?"],
    hard: ["Show me where the refund is written down. If you can't, this conversation is over.", "I've already been promised “we'll refund everything” somewhere else. What exactly do you have?"],
    opts: [
      { t: "Honestly: I'll check the refund and cancellation terms in the contract and show them to you in writing before you pay.", tech: "Honesty + a document", note: "You didn't invent a condition, you promised to show it in writing. That is maximum trust." },
      { t: "The terms are in the contract: let's open it together and you can read everything yourself.", tech: "Pointing to the document", note: "Right, but it would help to add that you will go through the contentious points together." },
      { t: "Of course they'll refund everything, don't worry, nobody has ever complained.", mistake: "Unverified promise", note: "You don't know that they'll refund anything. That kind of “don't worry” is grounds for a claim." },
      { t: "They'll refund everything, no questions asked, I personally guarantee it, and you shouldn't even think about it: it's a long-established procedure.", mistake: "False refund guarantee", note: "A personal guarantee where you guarantee nothing is a serious violation." },
    ],
    push: ["So will they refund it or not? I didn't hear an answer.", "Either you know or you don't. What does the contract say?"],
    rec: [
      { t: "I'll be honest: I don't remember it by heart and don't want to get it wrong. Let's open the contract and read the refund clause together, before you pay.", tech: "Admitting the limits of knowledge", note: "Saying “I don't remember” and opening the document is normal professional practice." },
      { t: "Well, generally it's all fine, I think.", mistake: "Vague answer", note: "“I think” instead of the contract terms sounds like evasion." },
      { t: "If you're thinking about a refund from the start, you're not ready.", mistake: "Pressure / belittling", note: "Asking about a refund is ordinary caution, not weakness." },
    ],
    bye: "If you can't show the refund terms, I won't do it.", why: "The question about refunds and cancellation was left without documents and without an honest answer.",
  },
  network_realism: {
    label: "“What if I don't bring anyone?”", family: "other",
    soft: ["What if I don't bring anyone in? Then what's the point of all this?", "I'm not sure I can attract anyone. What then?"],
    hard: ["So income only comes if I bring in others? Then it all rests on new people.", "How many people do I have to bring in for this to at least pay off? Honestly."],
    opts: [
      { t: "Then you simply use your Travel Advantage account for trips. The network is optional; there is no guaranteed income.", tech: "Honest framing", note: "You separated “using” from “building a business” and said plainly that there are no guarantees." },
      { t: "Inviting people is not required. If you want to work with the network, I'll explain what it looks like in practice.", tech: "Alternative path", note: "Right, but it would help to add that the result depends on effort and is not guaranteed." },
      { t: "You'll bring them, where would you go: everyone has acquaintances who need this, you just have to write to them and push a little.", mistake: "Pressure / unfounded generalisation", note: "You attribute to the client a result you don't know." },
      { t: "Bring two people and the entry fee comes back in full, it's been proven on many people, so don't be afraid at all.", mistake: "False promise of income", note: "Any promise of “comes back in full” breaks ethics and advertising law." },
    ],
    push: ["That “it'll all work out” is exactly what I don't like. Specifically, what happens if it doesn't?", "You're avoiding the question. Tell me what happens if I bring nobody."],
    rec: [
      { t: "Straight: if you bring nobody, you're left with the account and the {sub} subscription, and the benefit depends only on your trips. Let's work out whether that's worth it to you.", tech: "Direct answer with numbers", note: "You named both the upsides and the costs without gloss." },
      { t: "Nothing terrible will happen, lots of people just live that way.", mistake: "Evading the question", note: "“Lots of people live that way” is unverifiable and explains nothing." },
      { t: "So you're not set on success.", mistake: "Belittling", note: "Blaming the client closes the dialogue." },
    ],
    bye: "I'm not getting an honest answer. Not interested.", why: "The client never got an honest answer about having no results in the network.",
  },
  time: {
    label: "“No time”", family: "value",
    soft: ["Honestly, I don't have time for this right now.", "I'm very busy at the moment, let's talk later."],
    hard: ["I have three meetings in a row. What do you want? One sentence.", "I'm pressed for time. Be brief or I'm hanging up."],
    opts: [
      { t: "Understood. One question: what takes up most of your time when you plan trips?", tech: "Respect for time + a question", note: "You acknowledged how busy they are and showed right away that the talk will be to the point." },
      { t: "Then let's talk at a time that suits you, for 10 minutes.", tech: "Rescheduling to a specific time", note: "A good move, but the client has not yet seen the value of the conversation." },
      { t: "It'll take literally a minute, bear with me, I'll tell you everything quickly: first about the company, then Travel Advantage, then the tiers, the subscription and the business.", mistake: "Monologue", note: "“Bear with me” sounds like asking them to put up with you." },
      { t: "Everyone busy says that and then regrets not listening.", mistake: "Pressure", note: "Reproaching the client is the shortest way to “goodbye”." },
    ],
    push: ["I told you: no time. Let's end this.", "You're not hearing me. I'm pressed for time."],
    rec: [
      { t: "Got it. When is better, tomorrow or Thursday? I'll send one message and the main point will fit in three lines.", tech: "Alternative + brevity", note: "A choice between two options and a promise of brevity." },
      { t: "Well, at least hear me out, it's important.", mistake: "Ignoring the objection", note: "You repeated what the client has already said no to." },
      { t: "If you don't have time for your own travel, you don't value your life.", mistake: "Pressure / belittling", note: "Belittling the client is a mistake that cannot be undone." },
    ],
    bye: "That's it, I have no time. Goodbye.", why: "The value of the conversation wasn't shown in the first seconds and the client left.",
  },
};
