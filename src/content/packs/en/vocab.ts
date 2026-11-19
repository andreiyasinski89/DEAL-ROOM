import type { VocabText } from "../types";

const PROOF = "the contract, the company's terms and your personal account";

/** English texts of the 9 market segments (keys as in data/vocab.ts). */
export const vocab: Record<string, VocabText> = {
  member_elite: {
    label: "Client · Elite (trips for yourself)",
    product: "MWR Life membership", productAcc: "MWR Life membership", proof: PROOF,
    next: "a call with a calculation: your trips over a year against Elite points and the subscription",
    third: "my spouse", thirdWho: "my spouse",
    brief: "You are offering MWR Life membership at the {tier} level: {tierPrice}: {terms}; after that the subscription is {sub}.",
    open: {
      call: "Hello? Yes, I'm listening. Is this about the travel club?",
      chat: "Hi! You wrote to me about some trips at a discount. What kind of club is it?",
      meeting: "Hello. You wanted to show me how to save on travel?",
      zoom: "Hello, I'm here. Tell me about your travel club.",
    },
  },
  member_turbo: {
    label: "Client · Turbo (more points)",
    product: "MWR Life membership", productAcc: "MWR Life membership", proof: PROOF,
    next: "a call with a Turbo calculation: your trips over a year, points and the subscription",
    third: "my spouse", thirdWho: "my spouse",
    brief: "The client is choosing between levels; you are offering {tier}: {tierPrice}: {terms}; after that the subscription is {sub}. You should recommend what suits the client, not the pricier option.",
    open: {
      call: "Hello? Yes. Is this about the more expensive level?",
      chat: "Hi. Someone offered me some Turbo, are you the person to ask?",
      meeting: "Hello. We agreed to discuss the membership levels.",
      zoom: "Hello. Tell me about the Elite and Turbo levels.",
    },
  },
  recruiting: {
    label: "Inviting into the business (building a network)",
    product: "a business with MWR Life", productAcc: "a business with MWR Life", proof: PROOF,
    next: "a meeting where you see what working with a network looks like and decide whether you need it",
    third: "my family", thirdWho: "my family",
    brief: "You are inviting the person into the business: entry is {tier} ({tierPrice}: {terms}) plus the {sub} subscription. Income is possible only from building your own network; there are no guarantees.",
    open: {
      call: "Hello? Yes. Is this about a side job?",
      chat: "Hi. You wrote about some travel business. What is it?",
      meeting: "Hello. You wanted to tell me about an earning opportunity?",
      zoom: "Hello. Tell me about your travel business.",
    },
  },
  cold: {
    label: "Cold contact",
    product: "MWR Life membership", productAcc: "MWR Life membership", proof: PROOF,
    next: "a short 15-minute call where I answer your questions",
    third: "my colleagues", thirdWho: "my colleagues",
    brief: "The person is not expecting you. You are offering {tier} ({tierPrice}: {terms}; after that the subscription is {sub}), but the goal of the conversation is to earn the right to a next step.",
    open: {
      call: "Hello? Who is this? Where did you get my number?",
      chat: "Hello. Do we know each other? What do you need?",
      meeting: "Hello. Do we know each other?",
      zoom: "Good afternoon. I didn't sign up for this conversation.",
    },
  },
  repeat: {
    label: "Existing client: subscription and doubts",
    product: "your Travel Advantage account", productAcc: "your Travel Advantage account", proof: PROOF,
    next: "a call where we go through your situation with the subscription and the account",
    third: "my family", thirdWho: "my family",
    brief: "The client is already registered ({tier}), pays the {sub} subscription and doubts whether to continue. The goal is to sort it out honestly and keep the trust, not to retain them at any cost.",
    open: {
      call: "Hello? Yes. Is this about my account?",
      chat: "Hello. You wrote about my account, I was just about to sort out the subscription.",
      meeting: "Hello. We agreed to discuss my account.",
      zoom: "Hello. Shall we sort out my account?",
    },
  },
  family: {
    label: "Family and holidays",
    product: "MWR Life membership", productAcc: "MWR Life membership", proof: PROOF,
    next: "a family call where you look at the numbers together",
    third: "my family", thirdWho: "my family",
    brief: "The person is thinking about family trips. You are offering {tier}: {tierPrice}: {terms}; after that the subscription is {sub}. The decision is made together with the family.",
    open: {
      call: "Hello? Yes, I'm listening. Is this about travel for the family?",
      chat: "Hello. You wrote about trips for families. What exactly are you offering?",
      meeting: "Hello. Tell me how you help with family trips.",
      zoom: "Hello. We're planning a family holiday, tell me about the club.",
    },
  },
  business: {
    label: "Entrepreneur and manager",
    product: "MWR Life membership", productAcc: "MWR Life membership", proof: PROOF,
    next: "a review of the numbers: your trips and your team's trips against points and the subscription",
    third: "my partner or management", thirdWho: "my partner or management",
    brief: "The other person is a busy manager or business owner. You are offering {tier}: {tierPrice}: {terms}; after that the subscription is {sub}. Numbers and time matter to them.",
    open: {
      call: "Good afternoon. I'm listening, I have ten minutes.",
      chat: "Hello. I read your message. What exactly are you offering?",
      meeting: "Good afternoon. To the point, please, my schedule is tight.",
      zoom: "Good afternoon. Show me briefly what you have.",
    },
  },
  social: {
    label: "Social media and bloggers",
    product: "MWR Life membership", productAcc: "MWR Life membership", proof: PROOF,
    next: "a live walkthrough: what the Travel Advantage account looks like and what working with a network is like in practice",
    third: "my audience and family", thirdWho: "my audience and family",
    brief: "The other person lives on social media and values their audience. You are offering {tier}: {tierPrice}: {terms}; after that the subscription is {sub}. Reputation with followers matters more than a quick sale.",
    open: {
      call: "Hello? Yes, we chatted in DMs.",
      chat: "Hi! I saw your post about travel. What's the project?",
      meeting: "Hi! I've wanted to meet in person for a while.",
      zoom: "Hi! Tell me what this travel project is.",
    },
  },
};
