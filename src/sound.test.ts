import { beforeEach, describe, expect, it, vi } from "vitest";
import { SOUNDS, _setAudioFactory, play, setSoundEnabled, soundEnabled, type SoundName } from "./sound";

function fakeCtx() {
  const created = { osc: 0, started: 0 };
  const ctx = {
    state: "running",
    currentTime: 0,
    destination: {},
    resume: vi.fn(),
    suspend: vi.fn(),
    createOscillator: () => {
      created.osc++;
      const o = { type: "", frequency: { value: 0 }, connect: (x: unknown) => x, start: () => created.started++, stop: () => {} };
      return o;
    },
    createGain: () => ({ gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: (x: unknown) => x }),
  };
  return { ctx: ctx as unknown as AudioContext, created };
}

const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
});

beforeEach(() => {
  localStorage.clear();
  setSoundEnabled(false);
  _setAudioFactory(null);
});

describe("sounds", () => {
  it("are off by default and silent: no audio context is even created", () => {
    const f = vi.fn();
    _setAudioFactory(f as unknown as () => AudioContext);
    play("win");
    expect(soundEnabled()).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("play one oscillator per note when enabled", () => {
    const { ctx, created } = fakeCtx();
    _setAudioFactory(() => ctx);
    setSoundEnabled(true);
    play("win");
    expect(created.osc).toBe(SOUNDS.win.length);
    expect(created.started).toBe(SOUNDS.win.length);
    expect(localStorage.getItem("dr_sound")).toBe("on");
  });

  it("every sound is short and quiet", () => {
    for (const [name, notes] of Object.entries(SOUNDS) as [SoundName, (typeof SOUNDS)[SoundName]][]) {
      expect(notes.length, name).toBeGreaterThan(0);
      for (const n of notes) {
        expect(n.gain ?? 0.05, name).toBeLessThanOrEqual(0.1);
        expect(n.at + n.dur, name).toBeLessThanOrEqual(1);
        expect(n.f).toBeGreaterThan(50);
      }
    }
  });

  it("never throws when audio is unavailable or broken", () => {
    setSoundEnabled(true);
    _setAudioFactory(() => {
      throw new Error("no audio");
    });
    expect(() => play("click")).not.toThrow();
  });
});
