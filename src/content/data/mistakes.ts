/**
 * Language-independent codes of the mistakes named in the content. The Russian label is the source;
 * every language pack shares the same graph, so the code is derived once from the Russian text and
 * the debrief can give the right growth advice whatever language the player uses.
 */
export const MISTAKE_CODES = ["scarcity", "lie", "weak_position", "pressure", "devalue", "dispute", "excuse", "ignore", "monologue", "boasting", "other"] as const;
export type MistakeCode = (typeof MISTAKE_CODES)[number];

const RULES: [MistakeCode, RegExp][] = [
  ["scarcity", /дефицит/i],
  ["lie", /ложь|ложн|искажени|выдуманная|непроверенн|пустые заверения/i],
  ["weak_position", /сдача|слабая позиция/i],
  ["pressure", /давлен|апсейл|манипуляц|финансовый риск|спам-подход/i],
  ["devalue", /обесценив|отказ от клиента|обвинен/i],
  ["dispute", /спор|критика/i],
  ["excuse", /оправдан|обида/i],
  ["ignore", /игнор|уход от|размыт/i],
  ["monologue", /монолог|холодн/i],
  ["boasting", /хвастовств/i],
];

export function mistakeCode(russianLabel: string | undefined): MistakeCode | undefined {
  if (!russianLabel) return undefined;
  for (const [code, re] of RULES) if (re.test(russianLabel)) return code;
  return "other";
}
