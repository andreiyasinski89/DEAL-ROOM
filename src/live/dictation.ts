/**
 * Voice dictation for the live-client chat, on the browser's built-in Web Speech API.
 * - No server, no key, no cost on our side, and the audio never goes through our Edge Function.
 * - In Chrome/Edge the recognition itself is done by the browser vendor's service (audio leaves the device);
 *   the UI says so. Firefox does not support it: the mic button is simply hidden there.
 *
 * Everything here is plain TypeScript: the controller takes a recognition factory, so tests can fake the browser.
 */

export type DictationLang = "ru-RU" | "en-US" | "pl-PL";
export const DICTATION_LANGS: { code: DictationLang; label: string }[] = [
  { code: "ru-RU", label: "RU" },
  { code: "en-US", label: "EN" },
  { code: "pl-PL", label: "PL" },
];

/** The minimal slice of SpeechRecognition we use (lib.dom does not ship these types). */
export interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
export type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};
export type RecognitionFactory = () => RecognitionLike;

/** The browser's constructor, or null where dictation is not available. */
export function browserRecognition(): RecognitionFactory | null {
  const w = globalThis as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? () => new C() : null;
}

export const ERROR_TEXT: Record<string, string> = {
  "not-allowed": "Доступ к микрофону запрещён. Разрешите его для этого сайта в настройках браузера (значок замка у адреса).",
  "service-not-allowed": "Браузер не разрешил распознавание речи на этом сайте.",
  "audio-capture": "Микрофон не найден или занят другой программой.",
  network: "Нет связи с сервисом распознавания речи. Проверьте интернет.",
  "language-not-supported": "Этот язык диктовки не поддерживается браузером.",
};

/** Errors after which restarting would just fail again. */
const FATAL = new Set(["not-allowed", "service-not-allowed", "audio-capture", "network", "language-not-supported"]);

/** Appends dictated text to what is already typed: spacing, a capital after a sentence end, length cap. */
export function appendText(current: string, add: string, max: number): string {
  const piece = add.replace(/\s+/g, " ").trim();
  if (!piece) return current;
  const base = current.replace(/\s+$/, "");
  const startsSentence = base === "" || /[.!?…]$/.test(base);
  const text = startsSentence ? piece.charAt(0).toLocaleUpperCase() + piece.slice(1) : piece;
  const joined = base === "" ? text : `${base} ${text}`;
  return joined.slice(0, max);
}

export type DictationEvents = {
  /** A finished piece of speech: append it to the text field. */
  onFinal: (text: string) => void;
  /** What is being recognised right now (not final yet); "" when nothing. */
  onInterim: (text: string) => void;
  onState: (s: { listening: boolean; error: string | null }) => void;
};

export class Dictation {
  private rec: RecognitionLike | null = null;
  private wanted = false;
  private restarts = 0;

  constructor(
    private factory: RecognitionFactory,
    private events: DictationEvents,
    public lang: DictationLang = "ru-RU",
  ) {}

  get listening() {
    return this.wanted;
  }

  start() {
    if (this.wanted) return;
    this.wanted = true;
    this.restarts = 0;
    this.events.onState({ listening: true, error: null });
    this.begin();
  }

  stop() {
    if (!this.wanted && !this.rec) return;
    this.wanted = false;
    const r = this.rec;
    this.rec = null;
    try {
      r?.stop();
    } catch {
      /* already stopped */
    }
    this.events.onInterim("");
    this.events.onState({ listening: false, error: null });
  }

  /** Changing the language while listening restarts the recognition. */
  setLang(lang: DictationLang) {
    this.lang = lang;
    if (this.wanted) {
      const r = this.rec;
      this.rec = null;
      try {
        r?.abort();
      } catch {
        /* ignore */
      }
      this.begin();
    }
  }

  private begin() {
    let r: RecognitionLike;
    try {
      r = this.factory();
    } catch {
      return this.fail("audio-capture");
    }
    r.lang = this.lang;
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const t = res[0].transcript;
        if (res.isFinal) {
          this.restarts = 0; // the engine is alive: a later silence restart is normal
          this.events.onFinal(t);
        } else interim += t;
      }
      this.events.onInterim(interim.trim());
    };
    r.onerror = (e) => {
      if (e.error === "aborted") return;
      if (FATAL.has(e.error)) this.fail(e.error);
      // "no-speech" and the like are harmless: onend restarts the engine
    };
    r.onend = () => {
      if (r !== this.rec) return; // an old instance (language change) or an explicit stop()
      this.events.onInterim("");
      if (this.wanted && this.restarts < 20) {
        // browsers end a "continuous" session after a pause: keep listening until the user stops
        this.restarts++;
        this.begin();
      } else if (this.wanted) {
        this.fail("network");
      }
    };
    this.rec = r;
    try {
      r.start();
    } catch {
      // start() throws if a session is already running; ignore, onend will tidy up
    }
  }

  private fail(code: string) {
    this.wanted = false;
    this.rec = null;
    this.events.onInterim("");
    this.events.onState({ listening: false, error: ERROR_TEXT[code] ?? "Не удалось включить диктовку." });
  }
}

const KEY = "dr_dictation_lang";

export function loadDictationLang(): DictationLang {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "ru-RU" || v === "en-US" || v === "pl-PL") return v;
  } catch {
    /* ignore */
  }
  return "ru-RU"; // the scenarios are in Russian
}

export function saveDictationLang(l: DictationLang) {
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* ignore */
  }
}
