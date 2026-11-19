import type { PersonaText } from "../types";

const A = "Analyst";
const D = "Driver";
const E = "Expressive";
const P = "Peacemaker";

const t = (name: string, profession: string, psychotype: string, pain: string, hiddenMotive: string, redButton: string, goldenKey: string): PersonaText => ({
  name, profession, psychotype, pain, hiddenMotive, redButton, goldenKey,
});

/** English texts of the 30 client personas (ids as in data/personas.ts). */
export const personas: Record<string, PersonaText> = {
  irina: t("Irina", "accountant", A, "Spends hours hunting for good prices", "Wants to be with her family more, but is afraid of repeating a friend's mistake", "Lies and pressure, promises of “mountains of gold”", "Honesty, numbers based on her own example, the right to think it over"),
  maxim: t("Maxim", "car-repair shop owner", D, "No time and too many tasks for one pair of hands", "Wants to scale up, but doesn't trust other people's promises", "Long introductions and “fluff”", "A short benefit in numbers and a concrete next step"),
  svetlana: t("Svetlana", "literature teacher", P, "Tired of never having enough money and the feeling that everything passes her by", "Is afraid her children and colleagues will judge her", "Pushiness and a sharp tone", "A gentle pace, care, stories of people like her"),
  artem: t("Artem", "social media manager", E, "Bored at work, craves bright projects", "Wants recognition and status among friends", "Tedium and dry tables", "An idea, a story and a chance to stand out"),
  olga: t("Olga", "general practitioner", A, "Constant fatigue and no time for herself", "Sceptical of any supplements, yet feels burnout herself", "Pseudo-scientific promises and “cures everything”", "Composition, research and an honest “this is not a medicine”"),
  dmitry: t("Dmitry", "procurement director", D, "Pressure on deadlines and budget from above", "Needs a successful pilot to get promoted", "Manipulation and “today only” discounts", "Risks under control, clear KPIs and deadlines"),
  natalia: t("Natalia", "beauty salon administrator", E, "Lots of socialising, little income", "Dreams of her own studio", "A cold, formal tone", "Emotion, personal attention and attractive examples"),
  pavel: t("Pavel", "programmer", A, "A desk job and a chronic lack of free time", "Wants a second source of income but doesn't believe in “schemes”", "Manipulation and “everybody does it”", "Logic, transparent terms and the chance to check for himself"),
  elena: t("Elena", "mother on maternity leave", P, "Has no money of her own and feels dependent on her husband", "Wants independence but fears conflict at home", "Pressure and belittling her doubts", "A safe start, support and a flexible schedule"),
  viktor: t("Viktor", "shop owner", D, "Falling sales and fatigue from “advisers”", "Is quietly looking for a way to outdo competitors", "Being lectured", "A partner's tone, business benefit and specifics"),
  anna: t("Anna", "fitness trainer", E, "Unstable income and burnout", "Wants a brand and products of her own", "Criticism of her passions", "Inspiration, community and recognition"),
  sergey: t("Sergey", "factory engineer", A, "His salary stands still", "Is afraid to risk his savings", "Haste and vague wording", "Documents, calculations and time to verify"),
  marina: t("Marina", "nurse", P, "Night shifts and constant fatigue", "Wants to change jobs but lacks self-confidence", "Aggressive selling", "Involvement, encouragement and small steps"),
  roman: t("Roman", "head of a sales department", D, "KPIs and pressure on his team", "Is testing you as a salesperson: techniques matter to him", "Weak, unsure answers", "Confidence, clarity and respect for his experience"),
  yulia: t("Yulia", "beauty blogger", E, "Needs content and ad integrations", "Wants an honest partnership, not “one more ad”", "Template scripts and flattery", "A real conversation and creative freedom"),
  alexey: t("Alexey", "long-haul truck driver", P, "Rarely at home and misses his family", "Dreams of more time with his children", "Complicated terms and haste", "Simple words and care for his family"),
  tatyana: t("Tatyana", "chief accountant", A, "Reporting and constant rush jobs", "Looks for transparency and protection from risks", "Promises without documents", "A contract, a register and careful work with numbers"),
  igor: t("Igor", "restaurant owner", D, "Rising costs and a shortage of people", "Wants to cut costs but doesn't want to look weak", "Pleading requests and uncertainty", "A quick effect on money and clear terms"),
  vera: t("Vera", "pensioner, former teacher", P, "A small pension and loneliness", "Is afraid of being cheated, like her neighbour", "Haste, pressure and complicated words", "Patience, written terms and a warm attitude"),
  kirill: t("Kirill", "student and budding startup founder", E, "No money or experience, but lots of ideas", "Wants to prove to his family that he can do it himself", "A condescending tone", "A challenge, growth prospects and recognition of his ideas"),
  anatoly: t("Anatoly", "pensioner, former military officer", P, "A modest pension and a wish to see the world", "Is afraid of looking naive in front of his children", "Haste and jargon", "A calm tone, written terms and respect for his experience"),
  ksenia: t("Ksenia", "HR manager", A, "Many people around, little time for herself", "Suspects “schemes” but loves to travel", "Manipulation and vague promises", "Transparent terms and an honest “it doesn't suit everyone”"),
  gleb: t("Gleb", "trader", D, "Used to weighing risk and return", "Looks for any asymmetry in his favour", "Emotions instead of numbers", "A clear calculation and an acknowledgement of risks"),
  polina: t("Polina", "graphic designer", E, "Freelancing and irregular money", "Dreams of travelling and working from different countries", "Template presentations", "A lively story and beautiful visuals"),
  stanislav: t("Stanislav", "surgeon", D, "Few holidays, a lot of responsibility", "Can't stand inaccuracy and “fluff”", "Uncertainty and evasiveness", "Brevity, precision and respect for his time"),
  larisa: t("Larisa", "school canteen cook", P, "Hard work and a small salary", "Is afraid of losing the little money she has saved", "Pressure and complicated terms", "Patience, simple words and a written calculation"),
  denis: t("Denis", "bank manager", A, "Professionally calculates other people's risks", "A sceptic towards any “benefit”", "Vague promises of returns", "Numbers, documents and an acknowledgement of limits"),
  alla: t("Alla", "flower shop owner", E, "Seasonality and unstable revenue", "Wants a beautiful life but not to risk her shop", "Rude pushiness", "A warm contact and an understandable benefit"),
  timur: t("Timur", "entrepreneur, taxi fleet", D, "Routine and operations with no days off", "Looks for an additional scalable source of income", "Promises of “mountains of gold”", "Concrete numbers and honest risks"),
  zoya: t("Zoya", "grandmother, pensioner", P, "Wants to travel with her grandchildren but is saving", "Is afraid of being cheated, like an acquaintance", "Haste, pressure, complicated terms", "Written terms and a calm pace"),
};
