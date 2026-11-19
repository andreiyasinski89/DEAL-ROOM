import { g, x } from "../helpers";
import type { Extras } from "../types";

/** English: a second wording of every objection (see ruBeatsAlt.ts for the Russian original). */
export const beatsAlt: Extras["beatsAlt"] = {
  price: {
    soft: "Honestly, {tierPrice} to start and {sub} on top is serious money for me.",
    hard: "I use any hotel service for free, and you ask {tierPrice} and {sub} on top. On what grounds?",
    push: "You still haven't answered what exactly I'm supposed to pay for.",
    alt: [
      g("I understand. What do you usually book in a year? That decides whether there's any point.", "Value through needs", "You don't defend the price, you find out what the client really spends on trips."),
      g("Here is what the payment consists of: entry {tierPrice}, then {sub}. I can show it in writing.", "Payment transparency", "Honest and clear, but without a question about trips the price stays abstract."),
      x("Others pay and don't complain, so you'll get used to it too: for a product like this it's ordinary money, no need to worry so much.", "Pressure by the norm", "“Everybody pays” is not an answer to a personal “too expensive”."),
      x("It will pay for itself quickly, I promise: clients usually get their investment back in the first months, so there's almost no risk.", "False promise of payback", "Payback cannot be guaranteed: it is a road to a complaint."),
    ],
  },
  subscription: {
    soft: "Wait, so besides the entry fee I pay another {sub} every month? That's not how it was explained to me.",
    hard: "A {sub} subscription on top of the entry fee? Smells like a trap. Why am I only learning this now?",
    push: "I want to know what other payments you haven't named.",
    alt: [
      g("Right, besides the entry fee there is a {sub} subscription. Let's add it all up, and I'll show what it gives in the documents.", "The full picture of payments", "You named all the regular payments and showed what they give."),
      g("Yes, the subscription is a separate payment, {sub}. Its terms are better read in the contract: I'll open it with you.", "Relying on the contract", "Right to refer to the document, but link the payment to the client's own costs."),
      x("The subscription is a trifle against everything else. It's not worth doubting because of it and dragging out the decision.", "Belittling the objection", "The client asks about regular money and you call it a trifle."),
      x("You can calmly stop the subscription at any moment, no obligations and no consequences at all, it's a club after all.", "Unverified promise", "You don't know the cancellation terms: you can't promise what isn't in the document."),
    ],
  },
  points_value: {
    soft: "Please explain: for {tierPrice} I get points, not money, and part simply goes to the company. Is that right?",
    hard: "Points on your platform are an internal currency that you value yourselves. Why should I believe that?",
    push: "You didn't answer: can points be exchanged for money or not?",
    alt: [
      g("Right: points are not money, they pay for trips on the platform. I'll show the rules in writing.", "Precise wording + a document", "You confirmed the client's understanding and did not gloss over anything."),
      g("Yes, points work only inside the platform. Which trips do you usually pay for, so we can see if they'd be useful to you?", "Facts + a question about use", "Honest, and an immediate check of usefulness for the client."),
      x("Points are the same money, just in a convenient form. No need to nitpick the name, the substance is the same.", "Distorting the facts", "Points are not equal to money: swapping the concepts is grounds for a complaint."),
      x("Points can be withdrawn to a card at any time, it's your money, and there are no restrictions on it.", "False promise", "You don't know such a condition: inventing it means deceiving."),
    ],
  },
  tier_choice: {
    soft: "I'm told Elite is enough, but a friend advises Turbo. Tell me, how do I choose?",
    hard: "You surely recommend Turbo because it costs more. Explain the difference so that I can verify it.",
    push: "So which level suits me, not you?",
    alt: [
      g("Let's choose by your trips: how many times a year do you travel and how much do you spend?", "Choosing by needs", "You tied the choice to the client's life, not to your revenue."),
      g("The difference is the price and the points: at registration one tier gives one amount, the other another, and renewal too. Everything else we'll check in the company's table.", "Relying on official data", "You don't invent differences and offer to verify them in a document."),
      x("Turbo, of course: it's a serious choice for serious people, and Elite is taken by those who doubt themselves.", "Pressure by upselling", "Selling higher without finding out the needs is the client's red button."),
      x("Turbo brings more income, so for earning it's the only right choice.", "A false promise of income", "You can't promise income, let alone “more”."),
    ],
  },
  refund_cancel: {
    soft: "Suppose it doesn't suit me. How do I get out and what happens to the money?",
    hard: "If I can't get out and get my money back, it's a trap. Show me where it's written.",
    push: "I asked a simple question about a refund. There's no answer yet.",
    alt: [
      g("We check the refund and cancellation terms in the contract. I'll open it with you before you pay.", "A document instead of promises", "You didn't invent a condition, you offered to verify it in writing."),
      g("Honestly: I don't remember the details so as not to get them wrong. Let's find the clause in the contract and read it together.", "Admitting the limits of knowledge", "Saying “I don't remember” and opening the document is professional practice."),
      x("Don't worry, they'll refund everything with no problem, it always goes like that, I've never heard of anyone who couldn't.", "Unverified promise", "“Never heard” is not a guarantee, and you don't know the terms."),
      x("They'll refund everything in full, I guarantee it, it's a standard procedure and no questions will arise.", "A false refund guarantee", "A personal guarantee where you guarantee nothing is a serious violation."),
    ],
  },
  network_realism: {
    soft: "I'm not very sociable. If I don't invite anyone, does this make any sense at all?",
    hard: "How many people do I have to bring in to at least break even? Answer with a number, not “it depends”.",
    push: "What happens to my money if I can't manage to attract people?",
    alt: [
      g("Then you simply use the account. The network is optional, and there is no income guarantee.", "An honest frame", "You separated use from business and said plainly that there are no guarantees."),
      g("I won't name figures: there are no income guarantees. I can show what working with the network looks like in practice, and you judge whether it suits you.", "Refusing to promise", "Honest: no figures that can't be confirmed."),
      x("Bringing people in isn't hard, everyone has acquaintances. Just write to everyone and push a little, and the result will come.", "Pressure and a spam approach", "Advice to write to everyone harms the client's reputation."),
      x("Bring three people and everything pays back, many do it, and they manage without effort.", "A false promise of income", "Any “pays back” breaks ethics and advertising law."),
    ],
  },
  time: {
    soft: "Can we do this some other time? I have no time at all right now for long conversations.",
    hard: "I have a meeting in five minutes. One sentence: what do you want?",
    push: "I already said I'm busy. I won't repeat it.",
    alt: [
      g("Of course: I help work out the benefit of trips. When is it convenient to come back for ten minutes?", "The essence + a choice of time", "You gave the essence in seconds and offered a convenient time."),
      g("I understand. Let me call tomorrow at a time that suits you. Which is better?", "Rescheduling to a specific time", "Good, but the client has not yet seen the value of the conversation."),
      x("It won't take long, just listen to me for a minute and then decide: I'll quickly tell you everything at once.", "Monologue", "You ask for a minute and then deliver a monologue."),
      x("Everyone says that and then regrets half a year later that they didn't listen in time. Let's decide now.", "Pressure and reproach", "A reproach to the client is the shortest way to “goodbye”."),
    ],
  },
  trust: {
    soft: "Sorry, but I don't know you. Why should I trust you?",
    hard: "The internet is full of “companies”. What sets yours apart besides nice words?",
    push: "You talk, but there's no proof. I need facts.",
    alt: [
      g("A good question. Don't take my word for it: here is {proof}. Ask what you want to check, and I'll show it.", "Verifiable facts", "You don't ask for faith, you give a way to check."),
      g("I can show how I use the account myself and let you look at the documents. What is more convincing for you?", "A personal example + a choice", "Fine, but documents are more convincing than a personal example."),
      x("It hurts to hear that: I'm an honest person and I've worked in this not for the first year, why would I deceive you?", "Taking offence", "Taking offence puts the client in the position of the guilty one."),
      x("I swear everything will be exactly as I say and you won't have any problems, just take my word for it.", "False promise", "Oaths instead of facts deepen the distrust."),
    ],
  },
  mlm_stigma: {
    soft: "Tell me, isn't this something like network marketing? I don't really like that.",
    hard: "Network marketing and pyramids are the same thing to me. Is this it?",
    push: "You still haven't said whether this is a network company or not.",
    alt: [
      g("Yes, the model is network-based, I won't hide it. What exactly worries you?", "Directness + a question", "You admitted the obvious and asked about the cause of the doubt."),
      g("Yes, the model is network-based. Let's look at the documents, and you decide whether it suits you.", "Facts and documents", "Right, but without a question about their fears."),
      x("What pyramid? This is an absolutely legal business, pyramids are run by completely different people, it's unfair of you to say that about us.", "Arguing", "Arguing doesn't remove the fear, and “absolutely legal” you can't prove."),
      x("No, it's not network marketing, it's a closed club for travellers, there's nothing in common with that there.", "Lie", "Denying the network model is a lie that is easy to check."),
    ],
  },
  need: {
    soft: "Honestly, I don't need any clubs at all: I travel a couple of times a year and I'm fine with it.",
    hard: "I travel perfectly well without you. Tell me, why should I pay for what I do myself?",
    push: "I already said I don't need it.",
    alt: [
      g("Maybe you don't. Let's check on one of your trips: if there's no benefit, I'll say so.", "A check on data", "You offer to check, you don't try to prove."),
      g("I understand. Many people think so at first. Shall we calculate one of your holidays, no obligation?", "Normalising the doubt", "Good, but a question about trips is stronger."),
      x("Everyone needs it, you just haven't understood your benefit yet. Let me explain, and you'll agree.", "Arguing", "“Everyone needs it” is not an argument for one person."),
      x("You don't need it? Then you're missing what others have already understood, and you'll regret the missed opportunity.", "Pressure and false scarcity", "Pressure through fear of missing out doesn't work on someone who said no."),
    ],
  },
  competitor: {
    soft: "I usually find everything through an aggregator, it's convenient there. How are you better?",
    hard: "Booking and flight sites are free. Name at least one reason to pay you {tierPrice} and {sub}.",
    push: "You still haven't compared. Let's be specific: how are you better?",
    alt: [
      g("Aggregators are convenient. Let's compare your last trip by the numbers, with points and the subscription.", "Comparison on the client's data", "You don't criticise the competitor, you offer to check by calculation."),
      g("If you travel rarely, an aggregator may suit you better. If often, it's worth calculating. Shall I show how?", "Honesty about the product's limits", "Admitting the product isn't for everyone gives your words weight."),
      x("Aggregators inflate prices and hide fees, they simply cheat you there, and with us everything is honest and cheaper.", "Criticising a competitor", "Bad words about others without proof breed distrust."),
      x("With us it's always cheaper, that's certain, I've compared more than once myself, so there's no need even to check.", "False promise", "Claiming “certainly cheaper” without a calculation leads to a complaint."),
    ],
  },
  spouse_third_party: {
    soft: "I have to discuss this with {third}. We make decisions together.",
    hard: "Without {thirdWho} I won't sign anything, and they'll hardly agree to this.",
    push: "This is a family matter, and there's no need to rush us.",
    alt: [
      g("Of course. What will matter most to {thirdWho}? I'll send a calculation and answer questions if any come up.", "A question about the third party", "The third party became a participant in the decision, not an obstacle."),
      g("Okay. I can talk with them too, to answer questions directly. When is convenient?", "A meeting of three", "A concrete step, but you should have found out what exactly they fear."),
      x("You're an adult, decide yourself. Why coordinate everything, it's your personal decision, isn't it?", "Pressure and belittling", "You put the client between yourself and their loved ones."),
      x("We'll register today, and then you explain everything. It's simpler: better to do it first and agree afterwards.", "Pressure and concealing the decision", "Advice to hide the decision is an ethical risk and a red button."),
    ],
  },
  think_about_it: {
    soft: "I need to weigh all this up. I'll let you know.",
    hard: "Don't rush me. If I decide, I'll call myself.",
    push: "I need time, not persuasion.",
    alt: [
      g("Sensible. Which question is the main one for you right now? I'll send exactly what helps.", "Finding out the doubt", "You turned “I'll think” into a concrete question."),
      g("Of course. Let me write to you on Thursday, once you've thought it over. Does that suit you?", "A concrete next contact", "Good: there's a date, but the cause of the doubt stayed unknown."),
      x("What is there to weigh? The terms are excellent, you won't find better, and time is running out, so decide today.", "Pressure", "You did not accept the client's right to think."),
      x("Think about it, but the offer is valid only until evening, after that prices will be different.", "False scarcity", "A fake deadline destroys trust."),
    ],
  },
  bad_past_experience: {
    soft: "I already put money into something similar once and ended up with nothing. I don't want that again.",
    hard: "I've already been told nice stories about a “club” and “opportunities”. What is different with you?",
    push: "You're repeating the same words as last time.",
    alt: [
      g("I'm sorry it turned out that way. What exactly was promised and what happened? It matters to me not to repeat it.", "Empathy + a question", "You uncovered the cause of the pain instead of defending yourself."),
      g("I understand. I don't promise what I can't show. Here is what can be checked: {proof}.", "An honest frame", "Honest, but the client's story went unheard."),
      x("That was something else, this simply doesn't happen with us, don't compare us with those.", "Excuses", "“This doesn't happen with us” sounds like everybody else."),
      x("You were just unlucky. Try again: this time you definitely won't lose anything, I vouch for it.", "Pressure and a false promise", "“You won't lose anything” is a promise with no grounds."),
    ],
  },
  no_money: {
    soft: "Money is tight for me right now, I don't have a spare {tierPrice}.",
    hard: "Every dollar of mine is accounted for. What payments are there besides the entry fee? Tell me straight away.",
    push: "I said: no money. There's nothing more to discuss.",
    alt: [
      g("I understand. What amount would be comfortable for you? Then we'll decide whether it suits you.", "Finding the budget", "You don't argue with the lack of money, you find the limits."),
      g("Okay, let's not rush. We'll come back to this when it suits you better. Meanwhile I'll send some information.", "Respect for the situation", "A good move, but you could have found out a comfortable budget."),
      x("Everyone has money, you just have to set priorities: you surely spend more on small things.", "Belittling", "A reproach about “wrong priorities” hurts."),
      x("Borrow from acquaintances or take an instalment plan: it's an investment, it will bring everything back, many do it.", "Advice to go into debt", "Advising debt to make a purchase is a serious ethical mistake."),
    ],
  },
  no_network: {
    soft: "I don't know who to offer this to at all. My circle is small.",
    hard: "My acquaintances can't stand “network” things. I'll lose my friends.",
    push: "I can't do it like that, it's not for me.",
    alt: [
      g("You don't have to start with acquaintances, and the business is optional. Shall I explain how it works?", "An alternative start", "You removed the fear of “having to invite friends”."),
      g("Let's check: who do you talk to during a week? No obligation to offer anything, we'll just look at the circle.", "A joint exercise", "The objection became a small practice."),
      x("Everyone has acquaintances, you just don't want to push yourself. You have to work, not look for reasons.", "Belittling", "Accusing the client of laziness ends the dialogue."),
      x("Write to everyone in your phone with the same message: somebody will certainly respond.", "A spam approach", "Advice to write to everyone harms the client's reputation."),
    ],
  },
  not_salesperson: {
    soft: "I don't know how to sell, it's not for me. I'm a modest person anyway.",
    hard: "I don't want to talk anyone into anything, it's humiliating. Selling is not my thing.",
    push: "You're on about selling again. I told you I'm not a salesperson.",
    alt: [
      g("Good that you say so. I'll show you without any hard sell how this works.", "Acknowledge + reframe", "You accepted the fear and reframed “selling”."),
      g("You can start as an ordinary customer: use the account for yourself. The network is optional. Shall I explain?", "An alternative start", "Good, but without a question about what exactly the client fears."),
      x("You'll learn: selling is simple, anyone masters it in a week, there's nothing to be afraid of.", "Ignoring the objection", "If it's “simple”, the client will feel stupid."),
      x("Then why did you come? There's no way around it here, either you learn or don't waste your time.", "Pressure", "The question sounds like a reproach."),
    ],
  },
  proof_request: {
    soft: "Can I see the documents? I'm used to believing only papers.",
    hard: "Show me everything that can be checked: contract, terms, details. Otherwise we go no further.",
    push: "I don't need words. Where are the papers?",
    alt: [
      g("Of course. Here is {proof}. Look calmly, and if anything is missing, tell me and I'll find it.", "Proof + readiness to add", "You showed what can be verified and are ready to give more."),
      g("I can send {proof} right after the conversation. What is most important for you to check first?", "Written proof + a question", "Good, and it clarifies priorities."),
      x("All my clients are happy, you can ask any of them, nobody has ever complained or regretted anything.", "Empty assurances", "Without specifics and checkable contacts these are empty words."),
      x("I answer for my words, everything with us is perfect and without problems, so you won't need documents.", "False promise", "“Perfect and no problems” is a red flag for an analyst."),
    ],
  },
  income_question: {
    soft: "And how much do you earn from this yourself, if it's not a secret?",
    hard: "Name your real income for the last three months. Not “potential”, a figure.",
    push: "You're dodging. One figure, please.",
    alt: [
      g("I'll answer honestly: the result depends on effort, and there are no income guarantees.", "Honesty without guarantees", "An honest answer without gloss is the best proof."),
      g("I'll tell my own figures as they are, but I won't promise them to you. The payout structure can be seen in the company's documents.", "Moving to documents", "Right, but the sidestepping of the personal question is noticeable."),
      x("Enough not to work for someone else. You can too if you do what I do.", "Boasting", "It sounds like manipulation and contains a promise."),
      x("A lot, and within a couple of months you'll reach the same level if you aren't lazy.", "A false promise of income", "Promising income breaks ethics and advertising law."),
    ],
  },
  stall: {
    soft: "Drop it all in a messenger for me, I'll look at leisure.",
    hard: "No need to show anything. Just send the information.",
    push: "So will you send it or not?",
    alt: [
      g("I'll send it. What matters more to see first: payments, terms or examples? Then I'll send exactly that.", "Clarifying interest", "A formal request turns into a dialogue."),
      g("Okay, I'll send it today. Shall we agree that I write tomorrow to hear your impression?", "Agreeing on the next contact", "A contact is set: good."),
      x("What is there to read, let me tell you everything right now, and it will be clear without emails.", "Ignoring the request", "You ignore the client's request."),
      x("I'll send it, but the decision has to be made today, otherwise the terms will change.", "False scarcity", "“Today” pressure together with “I'll send it” sounds absurd."),
    ],
  },
  aggression: {
    soft: "I'm tired of your messages. Do you even realise you're a nuisance?",
    hard: "Stop calling! Where did you get my number? I'll file a complaint!",
    push: "I said: leave me alone! What is unclear?",
    alt: [
      g("I hear you're irritated, and I'm sorry I bothered you. What exactly irritates you? I'll take it into account.", "De-escalation", "You accepted the emotion and gave a chance to speak out."),
      g("Sorry for the bother. If you want, I won't write again, just say so.", "An apology and respect for the boundary", "Respect for the boundary, but with no chance to keep the contact."),
      x("Let's keep the nerves out of it. I'm doing my job and have to finish the conversation.", "Dismissing emotions", "“Keep the nerves out” only fuels it."),
      x("You left a request yourself, so there's no need to be outraged.", "Excuses", "An excuse puts the client in the wrong, and you may be wrong about the “request”."),
    ],
  },
  manipulation: {
    soft: "I'm ready to take it if you give at least some discount or a bonus.",
    hard: "Another club offers half the price. Either you match it or I'm leaving.",
    push: "So are you making concessions or not?",
    alt: [
      g("The price and terms are set by the company, I don't promise a discount. I'll help choose a tier for your trips.", "A firm position + value", "You honestly said what you can't do and offered what you can."),
      g("I understand the wish for a better deal. Let's see what is decided within the company's terms, with no promises out of thin air.", "Looking for a solution within limits", "Right, but without a clear no to the discount."),
      x("Fine, I'll give you a discount, just don't leave. Say, twenty percent, and we register right now.", "Giving up the position", "You promised what doesn't exist and showed that the price isn't real."),
      x("If you leave, you'll miss your only chance, there won't be another like it. Decide while the offer is valid.", "False scarcity", "A manipulative client leaves exactly because of pressure."),
    ],
  },
  smokescreen: {
    soft: "It seems too expensive to me. And somehow it's all unclear.",
    hard: "No, the price is simply not serious. I don't agree to pay such money.",
    push: "It's not only the price, but I can't explain.",
    alt: [
      g("I understand. If the price were different, would anything else remain a doubt?", "Testing for a hidden objection", "You check whether this is the real objection."),
      g("Let's see what {tierPrice} includes: {terms}. And tell me which part raises questions.", "Working with the price", "You respond to what was said and clarify."),
      x("Expensive compared to what? Others are even more expensive and the quality is worse, so you lose nothing.", "Arguing", "You argue with an objection that may be false."),
      x("I can ask management for a discount, but only if you register today.", "Invented discount", "You have no right to promise a discount, and it doesn't solve the problem."),
    ],
  },
};
