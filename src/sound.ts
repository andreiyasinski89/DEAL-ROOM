/**
 * UI sounds, synthesised with the Web Audio API (no audio files, nothing to download).
 * OFF by default; the choice is remembered. A context is created lazily on the first sound,
 * which always follows a user gesture, so browsers allow it.
 */
export type SoundName = "click" | "strong" | "error" | "win" | "partial" | "lose";

type Note = { f: number; at: number; dur: number; type?: OscillatorType; gain?: number };

/** Each sound is a short list of notes: quiet, short, never harsh. */
export const SOUNDS: Record<SoundName, Note[]> = {
  click: [{ f: 520, at: 0, dur: 0.04, type: "square", gain: 0.03 }],
  strong: [{ f: 660, at: 0, dur: 0.09, type: "sine", gain: 0.08 }, { f: 990, at: 0.07, dur: 0.14, type: "sine", gain: 0.07 }],
  error: [{ f: 110, at: 0, dur: 0.28, type: "sawtooth", gain: 0.06 }, { f: 82, at: 0.05, dur: 0.3, type: "sawtooth", gain: 0.05 }],
  win: [262, 330, 392, 523].map((f, i) => ({ f, at: i * 0.09, dur: 0.5, type: "triangle" as const, gain: 0.07 })),
  partial: [{ f: 392, at: 0, dur: 0.2, type: "triangle", gain: 0.06 }, { f: 440, at: 0.16, dur: 0.3, type: "triangle", gain: 0.06 }],
  lose: [{ f: 220, at: 0, dur: 0.3, type: "sine", gain: 0.07 }, { f: 165, at: 0.22, dur: 0.5, type: "sine", gain: 0.07 }],
};

const KEY = "dr_sound";
let enabled = false;
let ctx: AudioContext | null = null;
let factory: (() => AudioContext) | null = null;

export function loadSoundSetting(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
  try {
    localStorage.setItem(KEY, v ? "on" : "off");
  } catch {
    /* ignore */
  }
  if (!v && ctx) void ctx.suspend?.();
}

export const soundEnabled = () => enabled;

/** For tests: inject a fake AudioContext. */
export function _setAudioFactory(f: (() => AudioContext) | null) {
  factory = f;
  ctx = null;
}

export function play(name: SoundName) {
  if (!enabled) return;
  try {
    if (!ctx) {
      const Ctor = factory ?? (typeof AudioContext !== "undefined" ? () => new AudioContext() : null);
      if (!Ctor) return;
      ctx = Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime;
    for (const n of SOUNDS[name]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = n.type ?? "sine";
      osc.frequency.value = n.f;
      const peak = n.gain ?? 0.05;
      g.gain.setValueAtTime(0.0001, t0 + n.at);
      g.gain.exponentialRampToValueAtTime(peak, t0 + n.at + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0 + n.at);
      osc.stop(t0 + n.at + n.dur + 0.02);
    }
  } catch {
    /* audio is a nicety: never break the game */
  }
}
