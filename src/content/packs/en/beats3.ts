import type { Beat, BeatTag } from "../../data/beats";

/** English objection bank, part 3. */
export const beats3: Partial<Record<BeatTag, Beat>> = {
  not_salesperson: {
    label: "“I'm not a salesperson”", family: "other",
    soft: ["I don't know how to sell. This is definitely not for me.", "Selling to friends isn't my thing."],
    hard: ["I'm not a salesperson and I don't want to be one. All this “selling” makes me sick.", "If I have to talk anyone into anything, I'm out right away."],
    opts: [
      { t: "It's good that you say so: there are plenty of pushy sellers. I'll show it without any hard sell.", tech: "Acknowledge + reframe", note: "You accepted the fear and reframed “selling”." },
      { t: "You can start as an ordinary customer: just use the account for yourself. The business is optional. Shall I explain?", tech: "Alternative start", note: "Good, but without a question about what exactly the client is afraid of." },
      { t: "Anyone can sell, it's very simple, there's nothing difficult, anybody can manage in a week.", mistake: "Ignoring the objection", note: "If it's “simple”, the client will feel stupid." },
      { t: "If you're afraid of selling, why did you even come? There's no way around it here, so either learn or don't waste your time.", mistake: "Pressure", note: "The question sounds like a reproach." },
    ],
    push: ["There you go, you too. No, I can't do that.", "I don't need to talk anyone into anything."],
    rec: [
      { t: "Try it with no obligation: I'll show you what the first three steps look like. If it's not for you, you just say so.", tech: "Demonstration without obligation", note: "A trial step with no risk lowers the barrier." },
      { t: "You'll learn, practice makes perfect.", mistake: "Ignoring the objection", note: "A stock phrase does not remove the fear." },
      { t: "Then you really shouldn't do this.", mistake: "Giving up on the client", note: "You closed the conversation for the client." },
    ],
    bye: "Not for me. Goodbye.", why: "The fear of selling was not removed: the client felt pressure.",
  },
  proof_request: {
    label: "“Prove it”", family: "trust",
    soft: ["Is there any proof that this works?", "Can I look at something: a contract, the terms, reviews?"],
    hard: ["Show me the contract, the terms, the reviews: everything that can be checked. Otherwise this conversation is pointless.", "Give me the documents now, not promises."],
    opts: [
      { t: "Yes, it's better to check for yourself. Here is {proof}. What matters most to you?", tech: "Proof + a question", note: "You gave something verifiable and asked what matters to the client." },
      { t: "I can email you {proof}, and you can look at it calmly.", tech: "Written proof", note: "Good, but there is no dialogue." },
      { t: "All my clients are happy, you can ask any of them: nobody has ever complained and nobody will regret it.", mistake: "Empty assurances", note: "Without specifics and checkable contacts these are empty words." },
      { t: "I can say it on my word: everything is perfect with us and there are no problems.", mistake: "False promise", note: "“Perfect and no problems” is a red flag for an analyst." },
    ],
    push: ["Words are not proof. I need facts.", "Again without papers. No."],
    rec: [
      { t: "Fair. Here is {proof}. Tell me exactly what is still missing and I'll find it.", tech: "Agreement + specifics", note: "Agreeing with the client's demand is stronger than defending." },
      { t: "You're too picky, just try it.", mistake: "Pressure", note: "Accusing them of being picky ends the dialogue." },
      { t: "I don't have it to hand right now, but trust me.", mistake: "Evasion", note: "An answer without facts confirms the suspicion." },
    ],
    bye: "Without proof, this conversation is over.", why: "The client demanded facts but got assurances.",
  },
  income_question: {
    label: "“How much do you earn?”", family: "trust",
    soft: ["And how much do you earn from this yourself?", "Can you really earn from the network? How much do you manage?"],
    hard: ["How much do you personally earn? Give me a figure. Honestly, no “potential”.", "Show me your real income or don't tell me about the business."],
    opts: [
      { t: "I'll answer honestly: my level depends on effort, and there are no income guarantees. Shall I explain what the result depends on?", tech: "Honesty + a frame without guarantees", note: "An honest answer without gloss is the strongest proof." },
      { t: "I'll give only my own figures, as they are, with no promises to you. I can show the payout structure from the company's documents.", tech: "Moving to documents", note: "Right, but the sidestepping of the personal question is noticeable." },
      { t: "More than you think. Believe me, it's very profitable.", mistake: "Evasion / boasting", note: "A vague “more than you think” raises suspicion." },
      { t: "Personally I earn a lot, and you could earn as much within a couple of months if you simply do what I do.", mistake: "False promise of income", note: "Promising income breaks ethics and advertising law." },
    ],
    push: ["You didn't answer my question. So there's nothing to brag about?", "There were figures. Where are they?"],
    rec: [
      { t: "Fair. I'll say it straight: my result is such-and-such and it comes from my effort and time in the business. A newcomer earns less and is not obliged to earn at all.", tech: "An honest answer", note: "A direct answer brings trust back." },
      { t: "It doesn't matter, what matters is the prospect.", mistake: "Evasion", note: "Ignoring a direct question." },
      { t: "Enough not to work for someone else.", mistake: "Boasting / manipulation", note: "It sounds like manipulation." },
    ],
    bye: "You didn't answer me. Have a good day.", why: "The direct question about income was left without an honest answer.",
  },
  stall: {
    label: "“Email it to me”", family: "other",
    soft: ["Send me everything by email and I'll look later.", "Drop the information in a messenger, I'll glance at it at leisure."],
    hard: ["Send the information. I'll look when I have time.", "No presentations. Just send it."],
    opts: [
      { t: "I'll send it. What matters more for you to see: the price, the terms or examples?", tech: "Clarifying interest", note: "You turn a formal request into a dialogue." },
      { t: "Okay, I'll send it today. Shall we agree that I call tomorrow to hear your impression?", tech: "A concrete next contact", note: "The next contact is set, which is good." },
      { t: "What is there to read, let me quickly tell you and everything will be clear without any emails or long waiting.", mistake: "Ignoring the request", note: "You ignore the client's request." },
      { t: "I'll send it, but the decision has to be made today.", mistake: "False scarcity", note: "“Today” pressure together with “I'll send it” sounds absurd." },
    ],
    push: ["So are you going to send it or not?", "I asked you simply to send it."],
    rec: [
      { t: "Sending it now. And I'll add one short line about the main point so you understand everything at once.", tech: "Fulfilling the request", note: "You fulfilled the request and added value." },
      { t: "I'll send it, but you won't look at it anyway.", mistake: "Belittling", note: "Predicting a refusal is a self-fulfilling prophecy." },
      { t: "Let's better discuss it all now, why put it off.", mistake: "Ignoring the request", note: "You are not hearing the client again." },
    ],
    bye: "Fine, don't send anything. Goodbye.", why: "The request “send it” was not turned into a dialogue.",
  },
  aggression: {
    label: "Aggression", family: "other",
    soft: ["I'm sick of you! How long will you keep writing?", "You again! I asked you not to bother me."],
    hard: ["Stop writing to me! I'll blacklist you, this is spam!", "Who are you anyway? Where did you get my number? This is illegal!"],
    opts: [
      { t: "I understand your irritation. What exactly is irritating you?", tech: "De-escalation", note: "You accepted the emotion and let them speak out, which lowers the heat." },
      { t: "Sorry for the bother. If that's what you want, I won't write anymore.", tech: "Apology and respect for the boundary", note: "Respect for the boundary, but with no chance to keep the contact." },
      { t: "Calm down, please, let's keep emotions out of it. I'm just doing my job and I have to finish the conversation.", mistake: "Dismissing emotions", note: "“Calm down” only pours oil on the fire." },
      { t: "I'm just doing my job, you left a request yourself.", mistake: "Excuses", note: "An excuse puts the client in the wrong, and you may be wrong about the “request”." },
    ],
    push: ["Don't you understand plain language? Leave me alone!", "You're driving me up the wall!"],
    rec: [
      { t: "Understood. I'm stopping. If you're ever interested, you know where to find me. Thank you for being honest.", tech: "A dignified exit", note: "A dignified exit is sometimes better than holding on." },
      { t: "But I only wanted to help!", mistake: "Excuses", note: "Taking offence only prolongs the conflict." },
      { t: "You're behaving rudely.", mistake: "Arguing / belittling", note: "A reproach to the client ends the dialogue." },
    ],
    bye: "That's it. I'm blocking you.", why: "The client's aggression could not be lowered, and the contact was blocked.",
  },
  manipulation: {
    label: "Client haggling and pressure", family: "other",
    soft: ["I'll take it, but only if you give me back part of the entry fee out of your commission.", "Knock off part of the price and I'll sign up right now."],
    hard: ["I've already had two better offers. Either you give me {tier} at half price or I walk.", "Give me a 50% discount and a free month of subscription, otherwise we're done."],
    opts: [
      { t: "The price and terms are set by the company, I don't promise discounts. I'll help you choose a tier for your trips.", tech: "A firm position + value", note: "You said honestly that you can't give discounts and offered what you can." },
      { t: "I understand the wish for a better deal. Let's see what can be decided within the company's terms, with no promises out of thin air.", tech: "Looking for a solution within limits", note: "Right in substance, but without a clear “no” to the discount." },
      { t: "Okay, 50%: just don't leave, let's sign quickly, I'll do everything the way you want!", mistake: "Giving up the position", note: "You promised what you can't and showed that the price isn't real." },
      { t: "If you leave, you'll lose a unique offer that won't come again, and you'll regret the missed opportunity.", mistake: "False scarcity / pressure", note: "A manipulative client leaves precisely because of pressure." },
    ],
    push: ["So you're not interested in a deal. I need a result now.", "Then this isn't a conversation."],
    rec: [
      { t: "I'm interested, but the terms are fixed. I can suggest choosing a tier for your trips and showing the calculation. Shall we go that way?", tech: "A firm position", note: "A firm, polite position is respected by negotiators." },
      { t: "Okay, 30%: that's my final word.", mistake: "A weak position", note: "A new discount after “my final word” undermines trust." },
      { t: "You're just trying to play me.", mistake: "Accusation", note: "Accusing of manipulation without proof is a conflict." },
    ],
    bye: "No deal. Goodbye.", why: "The haggling was lost: a weak position or pressure.",
  },
  smokescreen: {
    label: "False objection", family: "value",
    soft: ["That's too expensive for me.", "I don't know, something's off with the price."],
    hard: ["The price is absurd. Beyond common sense.", "{tierPrice}? No, that's not up for discussion."],
    opts: [
      { t: "I understand. If the price were fine, would anything else stop you?", tech: "Testing for a hidden objection", note: "You checked whether this is the real objection." },
      { t: "Let's see what {tierPrice} includes: {terms}.", tech: "Working with the price", note: "You respond to what was said, but don't check whether it is real." },
      { t: "Expensive compared to what? Others are even more expensive and the quality is worse, so you lose nothing!", mistake: "Arguing", note: "You argue with an objection that may be false." },
      { t: "I can knock off 30% right now if you decide today.", mistake: "Invented discount", note: "You have no right to promise discounts over a false objection, and it doesn't solve the problem." },
    ],
    push: ["It's not only the price... It's all just somehow strange.", "The price isn't the main thing. I just don't like it."],
    rec: [
      { t: "Thank you for saying so honestly. What exactly seems strange? Let's go through it.", tech: "An open question", note: "You gave the client the chance to tell the truth." },
      { t: "So the price is fine after all? Then let's sign.", mistake: "Ignoring the objection", note: "Ignoring a hint of the real reason." },
      { t: "First it's expensive, then it's strange: make up your mind.", mistake: "Arguing / belittling", note: "A reproach to the client ends the dialogue." },
    ],
    bye: "It all feels strange somehow. I won't.", why: "The false objection was not uncovered, and the real reason stayed unknown.",
  },
};
