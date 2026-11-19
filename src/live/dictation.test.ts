import { describe, expect, it, vi } from "vitest";
import { Dictation, ERROR_TEXT, appendText, browserRecognition, type RecognitionEvent, type RecognitionLike } from "./dictation";

class FakeRec implements RecognitionLike {
  static all: FakeRec[] = [];
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: ((e: RecognitionEvent) => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  started = 0;
  stopped = false;
  aborted = false;
  constructor() {
    FakeRec.all.push(this);
  }
  start() {
    this.started++;
  }
  stop() {
    this.stopped = true;
    this.onend?.();
  }
  abort() {
    this.aborted = true;
    this.onend?.();
  }
  say(parts: { t: string; final: boolean }[], resultIndex = 0) {
    this.onresult?.({ resultIndex, results: parts.map((p) => ({ isFinal: p.final, 0: { transcript: p.t } })) });
  }
}

function setup(lang?: "ru-RU" | "en-US" | "pl-PL") {
  FakeRec.all = [];
  const log = { final: [] as string[], interim: [] as string[], states: [] as { listening: boolean; error: string | null }[] };
  const d = new Dictation(
    () => new FakeRec(),
    { onFinal: (t) => log.final.push(t), onInterim: (t) => log.interim.push(t), onState: (s) => log.states.push(s) },
    lang,
  );
  return { d, log, rec: () => FakeRec.all[FakeRec.all.length - 1] };
}

describe("appendText", () => {
  it("adds spacing and capitalises the first word of a sentence", () => {
    expect(appendText("", "здравствуйте, ирина", 500)).toBe("Здравствуйте, ирина");
    expect(appendText("Добрый день.", "расскажу про членство", 500)).toBe("Добрый день. Расскажу про членство");
    expect(appendText("Добрый день, ", "расскажу про членство", 500)).toBe("Добрый день, расскажу про членство");
    expect(appendText("Вы согласны?", "да", 500)).toBe("Вы согласны? Да");
  });
  it("collapses whitespace, ignores empty input and respects the length cap", () => {
    expect(appendText("a", "  b   c  ", 500)).toBe("a b   c".replace(/ {3}/, " "));
    expect(appendText("abc", "   ", 500)).toBe("abc");
    expect(appendText("", "я".repeat(600), 500)).toHaveLength(500);
    expect(appendText("x".repeat(498), "yyyy", 500)).toHaveLength(500);
  });
});

describe("Dictation", () => {
  it("starts a continuous recognition with interim results in the chosen language", () => {
    const { d, log, rec } = setup("pl-PL");
    d.start();
    expect(rec()).toMatchObject({ lang: "pl-PL", continuous: true, interimResults: true, started: 1 });
    expect(log.states.at(-1)).toEqual({ listening: true, error: null });
    expect(d.listening).toBe(true);
  });

  it("reports interim text and passes final pieces on, with the result index respected", () => {
    const { d, log, rec } = setup();
    d.start();
    rec().say([{ t: "добрый", final: false }]);
    expect(log.interim.at(-1)).toBe("добрый");
    rec().say([{ t: "добрый день", final: true }, { t: " расскажу", final: false }]);
    expect(log.final).toEqual(["добрый день"]);
    expect(log.interim.at(-1)).toBe("расскажу");
    // the engine appends results: only those from resultIndex on are new
    rec().say([{ t: "добрый день", final: true }, { t: " расскажу про клуб", final: true }], 1);
    expect(log.final).toEqual(["добрый день", " расскажу про клуб"]);
  });

  it("keeps listening when the browser ends the session after a pause (restart), until the user stops", () => {
    const { d, rec } = setup();
    d.start();
    const first = rec();
    first.onend?.(); // silence timeout
    expect(FakeRec.all).toHaveLength(2);
    expect(rec().started).toBe(1);
    expect(d.listening).toBe(true);
    d.stop();
    expect(rec().stopped).toBe(true);
    expect(FakeRec.all).toHaveLength(2); // no restart after an explicit stop
    expect(d.listening).toBe(false);
  });

  it("stop clears the interim text and reports the state", () => {
    const { d, log, rec } = setup();
    d.start();
    rec().say([{ t: "полслова", final: false }]);
    d.stop();
    expect(log.interim.at(-1)).toBe("");
    expect(log.states.at(-1)).toEqual({ listening: false, error: null });
    d.stop(); // idempotent
  });

  it.each(Object.keys(ERROR_TEXT))("a fatal error '%s' stops dictation with a readable message and does not loop", (code) => {
    const { d, log, rec } = setup();
    d.start();
    rec().onerror?.({ error: code });
    expect(log.states.at(-1)).toEqual({ listening: false, error: ERROR_TEXT[code] });
    rec().onend?.();
    expect(FakeRec.all).toHaveLength(1);
  });

  it("harmless errors (no-speech, aborted) do not stop dictation", () => {
    const { d, log, rec } = setup();
    d.start();
    rec().onerror?.({ error: "no-speech" });
    rec().onerror?.({ error: "aborted" });
    expect(d.listening).toBe(true);
    expect(log.states.at(-1)).toEqual({ listening: true, error: null });
  });

  it("gives up after too many restarts without any recognised speech (no infinite loop)", () => {
    const { d, log } = setup();
    d.start();
    for (let i = 0; i < 30; i++) FakeRec.all[FakeRec.all.length - 1].onend?.();
    expect(d.listening).toBe(false);
    expect(log.states.at(-1)?.error).toBeTruthy();
    expect(FakeRec.all.length).toBeLessThanOrEqual(22);
  });

  it("changing the language while listening restarts with the new language", () => {
    const { d, rec } = setup("ru-RU");
    d.start();
    const old = rec();
    d.setLang("en-US");
    expect(old.aborted).toBe(true);
    expect(rec()).not.toBe(old);
    expect(rec().lang).toBe("en-US");
    expect(d.listening).toBe(true);
  });

  it("a failing constructor (no microphone API) is reported, not thrown", () => {
    const states: { listening: boolean; error: string | null }[] = [];
    const d = new Dictation(() => {
      throw new Error("nope");
    }, { onFinal: vi.fn(), onInterim: vi.fn(), onState: (s) => states.push(s) });
    expect(() => d.start()).not.toThrow();
    expect(states.at(-1)?.listening).toBe(false);
    expect(states.at(-1)?.error).toBe(ERROR_TEXT["audio-capture"]);
  });
});

describe("browserRecognition", () => {
  it("is null where the API does not exist (e.g. Firefox)", () => {
    expect(browserRecognition()).toBeNull();
  });
  it("prefers the standard constructor and falls back to the webkit one", () => {
    const g = globalThis as Record<string, unknown>;
    g.webkitSpeechRecognition = FakeRec;
    expect(browserRecognition()?.()).toBeInstanceOf(FakeRec);
    delete g.webkitSpeechRecognition;
  });
});
