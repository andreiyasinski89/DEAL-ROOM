import { m } from "../helpers";
import type { Extras } from "../types";
import { beatsAlt } from "./beatsAlt";

/** English texts of the extra building blocks (the skeleton is in data/moves.ts). */
export const extras: Extras = {
  events: {
    interrupt: {
      line: "Just a second... Sorry, I'm getting a call on the other line, it's urgent. Will you wait?",
      opts: [
        m("Of course, take it. If it's easier, I'll call back in ten minutes: just tell me when.", "Respect for time + a choice", "You didn't compete with their urgent matter and offered a choice: the client comes back calm."),
        m("I'll wait, no rush. When you're back, we'll quickly recap where we stopped.", "A pause without pressure", "Good, but you didn't offer to call back later."),
        m("I only have a little left to say: let me finish my point about the tiers, and then you can answer.", "Ignoring the distraction", "The client said it's urgent, and you insist on your own agenda."),
        m("This is an important conversation, the other call can wait. Please don't get distracted: your participation is being decided right now, and it can't be postponed.", "Pressure on attention", "Demanding attention instead of respecting an urgent matter leads to irritation."),
      ],
      bye: "Everything of yours is more important than my affairs. Let's not do this today.",
      why: "The client's urgent matter was not respected, and they ended the conversation.",
    },
    competitor_offer: {
      line: "By the way, I got an offer yesterday from a similar club, apparently cheaper. What do you say?",
      opts: [
        m("Good that you compare. Send their terms and we'll go through them point by point: payments, what's included, how to leave.", "Comparison by criteria", "You don't attack the competitor, you offer an honest check of terms and learn the client's priorities."),
        m("Tell me what exactly is cheaper there. We'll look at your trips and see what suits you better.", "A calculation on trips", "Sensible, but you didn't ask to see the terms of the offer itself."),
        m("There are many such clubs, but ours is definitely better, believe me, we've been on the market a long time and know what we're doing.", "Arguing without facts", "A claim with no comparison sounds like advertising, not an answer."),
        m("That's surely a scam: such clubs close within half a year. Don't risk your money, sign up with us.", "Belittling a competitor", "You haven't seen their terms: such words are a lie or a guess and undermine trust."),
      ],
      bye: "You speak badly of others without even looking at the terms. I'll compare it myself.",
      why: "The client wanted an honest comparison and got criticism of a competitor with no facts.",
    },
    friend_story: {
      line: "An acquaintance told me he joined a club like this and then couldn't get anything back. Does that happen?",
      opts: [
        m("Thank you for telling me. What exactly went wrong for him? I don't know his terms, but I'll show you yours in writing before you pay.", "Empathy + documents", "You don't make excuses for someone else's story and remove the fear with verifiable terms."),
        m("It's possible. Let's open the contract and see what leaving and a refund look like in your case.", "Relying on a document", "Right, but without a question about what happened to the acquaintance."),
        m("That was surely a different club, this doesn't happen with us, everything is different here, I vouch for it.", "Excuses", "“This doesn't happen with us” is something everyone who has been burned has heard."),
        m("Your acquaintance most likely just didn't read the contract. Don't believe such stories, they harm people.", "Arguing with the client's story", "You dismissed the client's source and in effect blamed the acquaintance."),
      ],
      bye: "I've heard enough. No, thank you.",
      why: "The story of the client's acquaintance was not heard but brushed off.",
    },
    quote_request: {
      line: "Can I get it in numbers right away: what do I have to pay and what does it add up to over a year?",
      opts: [
        m("Entry is {tierPrice}, then {sub}; over a year the subscription is $1,440. I'll show the rest in writing.", "Transparent numbers + a question", "All payments are named, the yearly sum is calculated at once, the rest comes from documents."),
        m("Entry is {tierPrice}, then {sub}. I'll send the yearly calculation in writing.", "Numbers, nothing extra", "Honest and short, but you didn't name the yearly sum."),
        m("It's all simple, it comes to not much in total, and the benefit will cover any costs, there's no need even to count.", "A vague sum", "A direct question about numbers needs a direct answer, not “not much”."),
        m("It will come to very little, and everything pays for itself within a couple of months, that has been proven on people long ago.", "False promise of payback", "Payback cannot be promised: it is a straight road to a complaint."),
      ],
      bye: "Nobody gives me numbers. Have a good day.",
      why: "The client got no clear numbers in answer to a direct question about the cost.",
    },
    skeptic_question: {
      line: "Tell me honestly: do you use this yourself? And what do you get out of it?",
      opts: [
        m("I'll answer straight: I'm interested in your decision, but I won't sell you what doesn't suit you.", "A direct answer about own interest", "You honestly named your interest and did not hide it."),
        m("Yes, I use it. What exactly do you want to know: how the points work or how the subscription is set up?", "A short answer + clarifying", "Good, but you never said anything about your own interest."),
        m("Of course, that's why I'm telling you: I've been in this a long time, I love everything about it, and I recommend the same to all my acquaintances.", "Boasting", "Telling about your own enthusiasm does not answer “what do you get”."),
        m("I use it and already earn well, you can too if you want and do as I do.", "A promise of income", "Promising income breaks ethics and advertising law."),
      ],
      bye: "It looks like they just want to sell to me. Not interested.",
      why: "The client got no honest answer about the seller's own interest.",
    },
    silence: {
      line: "Ok.",
      opts: [
        m("Thanks for replying. Do you have questions left? I can write briefly or call, whichever suits you.", "A gentle open question", "A short answer is a signal. You don't press and offer a choice of channel."),
        m("If it's inconvenient to write, I can call at a time that suits you. Or tell me what exactly is unclear.", "An alternative channel", "A good move, but without a question about the reason for the silence."),
        m("Are you there? Please answer, it's important for me to know what you think, I'm waiting.", "Pressing for a reply", "Demanding an answer from someone who is silent means pressure."),
        m("Why are you silent? If you're not interested, just say so. Decide right now, later it may be too late.", "An ultimatum", "An ultimatum in a chat closes the dialogue."),
      ],
      bye: "No need to rush me. Goodbye.",
      why: "The client's short reply was not read as a signal, and they were pressed.",
    },
    third_joins: {
      line: "There's someone sitting next to me whom I trust with such decisions. Do you mind if the three of us talk?",
      opts: [
        m("I'd be glad to. Let's briefly recall what matters to both of you, and then you can ask anything.", "Including the third person", "You made the new participant part of the decision, not an obstacle."),
        m("Fine. I'll briefly repeat the main points so you are in the picture too.", "A short recap", "Right, but you should have asked what matters to them specifically."),
        m("Let me continue from where I stopped, and questions later, so we don't lose time.", "Ignoring the new participant", "You skipped a new person in the conversation, and they decide together with the client."),
        m("Then let's register today while you're both in the mood, and you can tell them the details later.", "Pressure and concealing the decision", "Haste with a third person present is the client's red button."),
      ],
      bye: "We'll think it over together. Don't call again.",
      why: "The new participant was not included, and they tried to speed up the decision.",
    },
    time_check: {
      line: "I have about five minutes left, then I have to run. What's the most important thing?",
      opts: [
        m("Then let's pick the main thing: name one question, and the rest we'll check in writing.", "Priority within the time", "You accepted the limit and focused the talk on the client."),
        m("Okay, briefly: what you get, what it costs and how to leave. Where do we start?", "A compact structure", "A good structure, but the choice of topic is better left to the client."),
        m("Five minutes is enough, I'll run quickly through all the points: the company, points, subscription, tiers, the network and the business.", "Monologue", "Five minutes for “everything” is a monologue, not a conversation."),
        m("If you don't have time now, you won't have it later either. Let's decide everything right now while you're here.", "Pressure on urgency", "A reproach about lack of time and pressure produce a refusal."),
      ],
      bye: "Time's up and I still understood nothing. Goodbye.",
      why: "In the minutes that were left, the client did not get the main thing.",
    },
    tired: {
      line: "Honestly, I'm worn out this week. My head isn't working anymore.",
      opts: [
        m("I understand. Let's keep it light: one question for today, the rest on a day that suits you. Deal?", "Empathy + a small step", "You acknowledged the client's state and lowered the load."),
        m("Then I won't load you. When would it be comfortable to come back to this?", "Postponing at the client's request", "Good, but you could have kept one small step."),
        m("It happens to everyone. Let's still continue, I have just a little left to tell.", "Ignoring the state", "You heard the tiredness and went on as if it wasn't there."),
        m("That's exactly why you need a change: tiredness comes from a lack of money and rest, and we solve both, you can't put it off.", "Pressure on pain", "Using tiredness as an argument is pressure and a promise that doesn't exist."),
      ],
      bye: "I feel bad and I'm being talked into it. Stop.",
      why: "The client's tiredness was not respected, and they were pressed.",
    },
  },
  openers: {
    tenMinutes: {
      line: "Hello. I'll say right away: I have ten minutes, then a meeting. What do you have?",
      opts: [
        m("Thank you for warning me. In ten minutes I can ask a couple of questions and show the main thing. May I?", "Accepting the frame", "You accepted the client's limit and said what will happen in that time."),
        m("Okay, briefly: I'll give the essence and say how it may be useful. Where shall I start?", "A short introduction", "A good start, but you didn't spell out the time frame."),
        m("Ten minutes is too little. Let's agree on forty, otherwise I can't explain everything, and it's worth it.", "Pressure on time", "The client named a frame and you are widening it."),
        m("We already spoke at the presentation, you left a request yourself, so I have half an hour planned.", "A false pretext", "An invented reason for the conversation destroys trust from the first seconds."),
      ],
    },
    referral: {
      line: "Friends gave me your contact, but I really don't know anything. Where do we start?",
      opts: [
        m("Thank them for the recommendation. Where to start is up to you: what have you already heard and what would you like to understand?", "A question instead of a presentation", "You gave the client the initiative and found out what they came with."),
        m("I'll briefly tell you what it is, and you tell me what's interesting. Okay?", "A short start", "Good, but a question about what the client already knows would be stronger."),
        m("Since you were recommended, you're already in the picture. Let's go straight to registration, no need to drag it out.", "Pressure from the recommendation", "A recommendation does not cancel the client's right to learn what they are buying."),
        m("Your friends have already joined and are very happy, so you will definitely not regret it either, one hundred percent.", "A false guarantee", "Other people's opinion does not guarantee a result, and you cannot promise one."),
      ],
    },
    direct: {
      line: "Before I listen to anything: is this about money or about travel? Answer straight.",
      opts: [
        m("About travel. Income is possible only from your own network, no guarantees. What matters more to you?", "A direct answer", "A direct question gets a direct answer, and no promises."),
        m("Both. We'll start with trips, and I'll tell you about the network if you want.", "Two topics in order", "Honest, but with no clear line between benefit and earning."),
        m("It's all together, let's not split it into parts: the main thing is to trust and start, the rest will come.", "Dodging the direct question", "The client asked for directness and you went into general words."),
        m("About money, and serious money: many of ours reach a good income within a month.", "A promise of income", "Promising income breaks ethics and advertising law."),
      ],
    },
  },
  closers: {
    discount: {
      line: "Okay, I'm ready. But give me a discount or a bonus as well, and then we'll register today.",
      opts: [
        m("The price and terms are set by the company, I don't promise a discount. But I can offer: {next}.", "A firm position + value", "You honestly said no to the discount and offered what you can."),
        m("Let's see what the company's terms actually provide for and discuss it without promises.", "Finding a solution within terms", "Right in substance, but without a clear no to the discount."),
        m("Okay, I'll try to get something, say ten percent, just register today.", "A weak position", "A discount that doesn't exist is a lie and a reason not to trust the price."),
        m("Only today and only for you a thirty percent discount, and tomorrow it won't be there, so decide quickly.", "Invented scarcity", "Invented scarcity destroys the trust you have earned."),
      ],
    },
    send: {
      line: "Let's do it like this: send everything by email, I'll look and decide myself.",
      opts: [
        m("I'll send payments and terms today. And let's agree: on Thursday I'll write to answer questions.", "A concrete next step", "A date and an action instead of “later”: that way the email doesn't get lost."),
        m("Okay, I'll send it. I'll write to you on Thursday to hear what you decided.", "Agreeing on a contact", "Good, but without asking what exactly the client wants to see."),
        m("I'll send it when I have time, and you think it over meanwhile, no hurry, let me know when you decide.", "A vague step", "“When I have time” and “let me know” is a recipe for a quiet fade-out."),
        m("I'll send it, but the offer is valid only until tomorrow, so decide soon, there won't be a second chance.", "An invented deadline", "A fake deadline together with an email sounds absurd."),
      ],
    },
    how: {
      line: "Suppose yes. What exactly do I need to do now and how much do I pay?",
      opts: [
        m("Step by step: terms in writing first, then your decision. Payments: {tierPrice} at the start and {sub}.", "Step-by-step clarity", "The client sees the order of actions and all payments in advance."),
        m("First the contract and terms in writing. Payments: {tierPrice} at the start and then {sub}.", "Payments stated directly", "Honest, but without explaining the steps the client stays in the fog."),
        m("It's all very simple, I'll register everything myself, you'll hardly have to do anything, don't worry.", "A vague answer", "“Hardly anything” instead of steps and sums is evading the question."),
        m("We register right now while the registration window is open: later you'll have to wait, and the terms may change.", "Invented urgency", "Invented urgency destroys trust at the finish."),
      ],
    },
  },
  story: {
    hint: "The client started sharing something personal. Listen and connect it to their goals, not to the sale.",
    opts: [
      m("Thank you for telling me. Shall we see how this relates to your trips and spending?", "Linking the personal to the goal", "You heard the person and brought the talk back to their goals."),
      m("I understand you. Shall we continue?", "Sympathy", "Warm, but without a move to their benefit."),
      m("It's like that for everyone, nothing special. Let's go back to our question, we still have a lot to cover.", "Belittling the story", "The client opened up and you brushed it off."),
      m("That's exactly why you urgently need extra income, and we provide exactly that, you can't put it off.", "Pressure on pain", "Using someone's pain as an argument is pressure and a promise of income."),
    ],
    bye: "I told you something personal and they're trying to sell to me. Don't call.",
    why: "The client's personal story was used for pressure.",
  },
  stories: {
    irina: "You know, I spend about two hours in the evening searching for good prices, and then I still doubt whether I overpaid.",
    maxim: "Honestly, I run a repair shop, ten people and not a spare minute. I haven't taken a holiday in three years.",
    svetlana: "On a teacher's salary there isn't much room to move, you know. And I'd like to go to the sea at least once, not on a union voucher.",
    artem: "Everything at work is grey, just reports. I'd like something bright, something to show my friends.",
    olga: "I'm a doctor, and for half a year now I've felt I'm burning out. A holiday would be better than any vitamins, but there's no time.",
    dmitry: "I'm in procurement, and every quarter I get pressure from above, on deadlines or on budget. I need numbers and no surprises.",
    natalia: "I'm with people all day at the salon, and still there's little money. I dream of opening my own place someday.",
    pavel: "I sit at a computer all day. I'd like a second source of income, but I don't believe in “schemes”.",
    elena: "I'm on maternity leave, I have no money of my own, and it's an unpleasant feeling of dependence. I'd like a little something of my own.",
    viktor: "The shop has barely been keeping afloat lately, and everyone around only gives advice. I'm tired of these advisers.",
    anna: "My income jumps: a crowd of clients one week, silence the next. I'm burning out from this instability.",
    sergey: "My salary has stood still for about five years. I have some savings, but I don't want to risk them.",
    marina: "The night shifts wear me out. I dream of changing jobs, but somehow I'm not confident in myself.",
    roman: "I run a sales department, and the whole team's KPIs are on me. I know all the techniques, so spare me the fluff.",
    yulia: "I run a blog, and I'm sick of template advertising. It matters to me that a brand offers an honest partnership.",
    alexey: "I'm a long-haul driver, I'm rarely home and I miss my family. I'd like to spend more time with my children.",
    tatyana: "I have annual reporting and constant rush jobs. Transparency matters to me, and having everything in documents.",
    igor: "Costs in the restaurant keep rising and we're short of people. I'd like to cut costs, but without looking weak.",
    vera: "My pension is small and I live alone. A neighbour was recently cheated, and now I'm afraid of everything.",
    kirill: "I'm a student with a startup and a pile of ideas, but no money or experience. I want to prove to my family that I can manage alone.",
    anatoly: "I'm a pensioner, a former officer. I'd like to see the world, but my children will say I'm naive.",
    ksenia: "I'm surrounded by people all the time, and there's no time for myself. I love travelling, but I don't believe in “schemes”.",
    gleb: "I'm used to counting risk and return. Any asymmetry in my favour interests me, but only an honest one.",
    polina: "I'm a freelance designer, my money is irregular. I dream of travelling and working from different countries.",
    stanislav: "I'm a surgeon, few holidays, a lot of responsibility. I can't stand inaccuracy and fluff.",
    larisa: "The work is hard, the pay is small, and I've saved only a little. I'm afraid of losing that money.",
    denis: "I work in a bank and professionally count other people's risks. I'm sceptical about any “benefit”.",
    alla: "I have a flower shop, the revenue is seasonal. I want a beautiful life, but I won't risk the shop.",
    timur: "Routine, operations with no days off. I'm looking for one more source of income that can be scaled.",
    zoya: "I'm a grandmother and I really want to travel with my grandchildren. But I'm used to saving, and I'm afraid of being cheated like an acquaintance.",
  },
  beatsAlt,
};
