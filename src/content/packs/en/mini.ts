import type { MiniText } from "../types";

/** English text of the hand-written level-3 case "The sceptical accountant" (the graph lives in content/miniCase.ts). */
export const mini: MiniText = {
  title: "The sceptical accountant",
  persona: {
    name: "Irina",
    profession: "accountant",
    psychotype: "Analyst",
    pain: "Loves to travel, but spends hours hunting for good prices",
    hiddenMotive: "Wants to travel with her family more often, but is afraid of repeating a friend's mistake",
    redButton: "Lies and pressure, promises of “mountains of gold”",
    goldenKey: "Honesty, numbers based on her own trip, the right to think it over",
  },
  briefing:
    "You are calling Irina, an acquaintance of an acquaintance. She travels 2–3 times a year and finds accommodation on Booking herself. You are offering her MWR Life membership at the Elite level: $340; $100 is the company's registration fee and 120 points are credited to the Travel Advantage account at registration; after that the subscription is $120 per month (each renewal gives 120 points). The goal: register Elite or agree on a next step.",
  hiddenContext:
    "Irina's friend put money into a similar club: she was promised payback within two months and could only get out after half a year. Irina's husband is against any “schemes”: that is her hidden objection. Facts to check yourself against: Elite is $340 ($100 company fee, 120 points on the Travel Advantage account at registration), subscription $120 per month (a renewal gives 120 points); income is possible only from building your own network, with no guarantees.",
  nodes: {
    n1: {
      text: "Hello? Yes, this is Irina. Is this about that travel club?.. Is this network marketing again?",
      hint: "Her question is direct. What removes suspicion best: evasiveness or directness?",
      choices: {
        a: { text: "Yes, it's a network model, I won't hide it. What exactly about that worries you?", technique: "Acknowledge + clarify", coachNote: "You admitted the obvious and asked about the cause of the doubt: trust grows and you gain information." },
        b: { text: "Let me quickly explain why we're better than Booking: we have closed prices for members!", mistake: "Ignoring the objection", coachNote: "You didn't answer the direct question and slid into a monologue about discounts." },
        c: { text: "No, no, of course not, it's something completely different: a closed club for smart travellers!", mistake: "Lie", coachNote: "Denying the network model is a lie. It is easy to check, and trust vanishes at once." },
        d: { text: "I understand, the call is unexpected. Give me two minutes and you'll decide for yourself whether it's interesting?", technique: "Acknowledge + gentle agreement", coachNote: "Polite, but you still haven't answered the question about MLM: it will come back later." },
      },
    },
    n2: {
      text: "At least that's honest. I've been burned already: a friend put money into a club like this and then couldn't get out for half a year. How do I know yours is different?",
      hint: "Before arguments, a person needs to be heard. What do you know about that story?",
      choices: {
        a: { text: "I'm sorry about your friend. What exactly went wrong for her? I want to understand what you need to feel at ease.", technique: "Empathy + an open question", coachNote: "You uncovered the hidden pain instead of defending yourself right away." },
        b: { text: "Everything with us is official: there is a contract and the company's terms. You can check for yourself.", technique: "Proof by facts", coachNote: "Facts work, but you skipped the emotional part of her story." },
        c: { text: "That wasn't our club, this doesn't happen with us.", mistake: "Excuses", coachNote: "“This doesn't happen with us” sounds like brushing it off: it's what everybody says." },
        d: { text: "Just try it: you've got nothing to lose!", mistake: "Pressure and a false promise", coachNote: "“Nothing to lose” is a promise with no grounds. For someone with a bad experience it's a red rag." },
      },
    },
    n2b: {
      text: "One minute. Your website says “partner programme” and “referrals”. Are you being honest with me at all?",
      hint: "A mistake can be admitted: that sometimes brings trust back. Brushing it off definitely won't.",
      choices: {
        a: { text: "You're right, I answered evasively at first: I'm sorry. Yes, there is a partner programme, but the club can be used without it. Shall we go by the facts?", technique: "Admitting a mistake", coachNote: "An honest admission is the only way to win trust back after an inaccuracy." },
        b: { text: "Well, that's just how the marketing works, don't pay attention.", mistake: "Ignoring the objection", coachNote: "Brushing off an obvious contradiction means confirming that you are hiding something." },
        c: { text: "You've just read rumours on the internet.", mistake: "Arguing", coachNote: "Arguing with the client and dismissing their sources is a quick path to the end of the conversation." },
      },
    },
    n2c: {
      text: "Closed prices... I already search on Booking, the prices there are no worse. And I don't really have time, to be honest.",
      hint: "Don't argue with Booking. Better find out how she travels.",
      choices: {
        a: { text: "Do you travel often? Where did you fly last time and how did you choose where to stay?", technique: "SPIN: situation questions", coachNote: "Instead of arguing with a competitor you found out how the client looks for trips: that's material for a calculation." },
        b: { text: "Booking is just one service, and we have closed prices that aren't there.", mistake: "Arguing", coachNote: "A claim without proof. She can check and find no confirmation." },
        c: { text: "I understand, you're short on time. Shall I call back on Thursday at a time that suits you, for 10 minutes?", technique: "Closing on a next step", coachNote: "Respect for time and a concrete agreement. But you never learned the client's needs." },
      },
    },
    n3: {
      text: "She was promised that the club would pay for itself in two months. It didn't. She paid the fee and there were hardly any trips. I don't want the same.",
      hint: "Promises of payback are exactly what burned her. How do you speak so as not to repeat it?",
      choices: {
        a: { text: "Thank you for telling me. I don't promise payback: the club is about good-value trips for yourself. If you travel 2–3 times a year, let's calculate whether it pays off for you specifically.", technique: "Honest framing + moving to a calculation", coachNote: "You gave up the “mountains of gold”: exactly what she wanted to hear." },
        b: { text: "Your friend just didn't work hard enough. With us you can earn a great deal, the main thing is to want it.", mistake: "False promise of income", coachNote: "Promising income breaks ethics and advertising law. And it repeats exactly what burned her." },
        c: { text: "I understand. Let's move on to the numbers.", coachNote: "You moved to business too fast: the emotion was left unanswered." },
      },
    },
    n3b: {
      text: "A legal entity, a contract... that's all fine. But how much does it cost and what do I get?",
      hint: "State the numbers and terms without gloss.",
      choices: {
        a: { text: "I'll tell you honestly and briefly: I'll name the fee and the terms, but first I want to understand how you choose hotels now. That way we calculate the real benefit.", technique: "SPIN: a situation question", coachNote: "You brought the talk back to her situation instead of abstract promises." },
        b: { text: "Entry is $340. You'll learn the rest at the presentation.", mistake: "Monologue / evading the answer", coachNote: "An invitation “to the presentation” instead of an answer irritates an analyst." },
      },
    },
    n4: {
      text: "Okay, suppose I do travel at least once a year. How much does it cost to join? And what guarantees do I have that I won't lose money?",
      hint: "The word “guarantees” is a trap. What can you really guarantee and what can't you?",
      choices: {
        a: { text: "Elite is $340: $100 is the company's registration fee, 120 points are credited to your Travel Advantage account, then the subscription is $120 per month and each renewal gives another 120 points. I don't guarantee savings, but let's check on your last trip: where did you go and how much did you pay?", technique: "An honest answer + a check on her data", coachNote: "The price is stated directly, no guarantees invented, and the check is on her numbers. For an analyst that is ideal." },
        b: { text: "It's an investment, it will pay off from the first trip: I guarantee it.", mistake: "False promise", coachNote: "The word “guarantee” here is a straight road to a complaint and a refund." },
        c: { text: "$340 and another $120 a month. It's up to you.", mistake: "A cold delivery", coachNote: "A number without value and without care leaves the client alone with doubts." },
        d: { text: "Let's not talk about money but about emotions: imagine yourself in Bali at sunset...", mistake: "Evading the question", coachNote: "The analyst asked a concrete question: an answer “about emotions” irritates her." },
      },
    },
    n5: {
      text: "So... I need to think. And discuss it with my husband: he doesn't like things like this.",
      hint: "The husband is the hidden objection. It's better to invite him into the conversation than to go around him.",
      choices: {
        a: { text: "Of course. What would your husband usually say about things like this? Shall I send you a calculation for your trip, you show him the numbers, and on Thursday we talk as three?", technique: "Working with the third party + a next step", coachNote: "You didn't go around the husband, you made him a participant in the decision and set a concrete step." },
        b: { text: "Okay, think it over. I'll write to you this week.", technique: "Postponed closing", coachNote: "A vague “I'll write this week” with no date and no purpose is a common cause of a quiet fade-out." },
        c: { text: "Well, if your husband is against it, why do you even want this?", mistake: "Pressure / belittling", coachNote: "You touched something personal and put her before a choice of “me or my husband”." },
        d: { text: "Let's register Elite today, and you can tell your husband later.", mistake: "Pressure", coachNote: "Advising her to hide the decision from her husband is toxic pressure and a reputational risk." },
      },
    },
    n6: {
      text: "Okay, I like that you don't promise miracles. Calculate it for my trip to Turkey. What do I need to get started?",
      hint: "A clear, soft next step is needed now: no pressure and no invented scarcity.",
      choices: {
        a: { text: "I suggest this: first I'll send a calculation for your Turkey trip, and if the numbers suit you, we'll register Elite together. Deal?", technique: "Closing on a verifiable step", coachNote: "The client decides on the numbers: a sale with no risk of a refund." },
        b: { text: "We can register Elite today: $340; $100 is the company's fee and 120 points are credited to the Travel Advantage account, then $120 per month. I'll send all terms in writing. Does that suit you?", technique: "Alternative close", coachNote: "All payments are named directly and the terms are in writing. A good second path to a win." },
        c: { text: "Great! Only today there are 2 places left on the promotion!", mistake: "Lie about scarcity", coachNote: "Invented scarcity destroys the trust you have just earned." },
        d: { text: "Good. Send me your passport and card details right now and I'll register you.", mistake: "Pressure for speed", coachNote: "Asking for card details over the phone is too abrupt a step for a client who has only just thawed." },
      },
    },
    end_sale_clean: { text: "Irina: “Agreed. Send me the calculation, and if everything adds up, we'll register. Thank you for no tricks.”", reason: "SALE CLOSED: the client agreed to a calculation and to register based on the result." },
    end_sale_trial: { text: "Irina: “Okay, let's register Elite. Send the terms to my email.”", reason: "SALE CLOSED: Elite registered with a full understanding of the payments and terms." },
    end_partial_meeting: { text: "Irina: “Okay, on Thursday we'll talk as three. My husband will be interested to see the numbers.”", reason: "PARTIAL: a call with the husband is set: the hidden objection was brought into the light." },
    end_partial_call: { text: "Irina: “Fine, Thursday at six in the evening. Just keep it short.”", reason: "PARTIAL: a call is agreed, but the client's needs were not uncovered." },
    end_partial_vague: { text: "Irina: “Yes, yes, write sometime. Goodbye.”", reason: "PARTIAL: the next step is vague, and the chance to win the client back is small." },
    end_lost_lie: { text: "Irina: “I don't like being lied to. Have a good day.” A dial tone.", reason: "GAME OVER: the lie about the network model was exposed, and trust is lost." },
    end_lost_promise: { text: "Irina: “They said exactly the same words to my friend. This conversation is over.”", reason: "GAME OVER: a promise of income or guarantees repeated the story that burned her." },
    end_lost_pressure: { text: "Irina: “Are you suggesting I deceive my husband? Don't call me again.”", reason: "GAME OVER: pressure and advice to hide the decision: the client left." },
    end_lost_spouse: { text: "Irina: “That's my family, it's not for you to judge. Goodbye.”", reason: "GAME OVER: you touched something personal: the hidden objection “my husband is against it” became the reason for refusal." },
    end_lost_scarcity: { text: "Irina: “Two places, only today... I've heard that before. No, thank you.”", reason: "GAME OVER: invented scarcity destroyed the trust you had just earned." },
  },
};
