import { describe, expect, it } from "vitest";
import { LIMITS } from "../../supabase/functions/_shared/live.ts";
import { nextResetLocal, parseQuota, quotaTone, type Quota } from "./quota";

const q = (over: Partial<Quota> = {}): Quota => ({ sessionsLeft: 10, sessionsMax: 10, turnsLeft: 200, turnsMax: 200, ...over });

describe("parseQuota", () => {
  it("reads the database answer and attaches the app's limits", () => {
    expect(parseQuota({ ok: true, sessions_used: 3, sessions_left: 7, turns_used: 20, turns_left: 180 })).toEqual({
      sessionsLeft: 7, sessionsMax: LIMITS.sessionsPerDay, turnsLeft: 180, turnsMax: LIMITS.turnsPerDay,
    });
  });
  it("clamps odd numbers", () => {
    expect(parseQuota({ ok: true, sessions_left: 99, turns_left: -5 })).toMatchObject({ sessionsLeft: LIMITS.sessionsPerDay, turnsLeft: 0 });
    expect(parseQuota({ ok: true, sessions_left: -3, turns_left: 10 })?.sessionsLeft).toBe(0);
  });
  it.each([null, undefined, {}, { ok: false, error: "unauthorized" }, { ok: true }, { ok: true, sessions_left: "7", turns_left: 1 }, "x", 5])(
    "returns null for an unusable answer: %j",
    (raw) => expect(parseQuota(raw)).toBeNull(),
  );
});

describe("quotaTone", () => {
  it("is ok with plenty left, low near the end, empty at zero", () => {
    expect(quotaTone(q())).toBe("ok");
    expect(quotaTone(q({ sessionsLeft: 4 }))).toBe("ok");
    expect(quotaTone(q({ sessionsLeft: 3 }))).toBe("low");
    expect(quotaTone(q({ sessionsLeft: 1 }))).toBe("low");
    expect(quotaTone(q({ turnsLeft: 49 }))).toBe("low");
    expect(quotaTone(q({ sessionsLeft: 0 }))).toBe("empty");
    expect(quotaTone(q({ turnsLeft: 0 }))).toBe("empty");
  });
});

describe("nextResetLocal", () => {
  it("is the next UTC midnight as a clock time", () => {
    // 2026-11-18 15:00 UTC → next reset 2026-11-19 00:00 UTC; compare with the same instant formatted directly
    const now = new Date(Date.UTC(2026, 10, 18, 15, 0));
    const expected = new Date(Date.UTC(2026, 10, 19)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    expect(nextResetLocal(now, "en-GB")).toBe(expected);
  });
  it("is stable across the day boundary (just before and just after midnight UTC)", () => {
    const a = nextResetLocal(new Date(Date.UTC(2026, 10, 18, 23, 59)), "en-GB");
    const b = nextResetLocal(new Date(Date.UTC(2026, 10, 18, 0, 1)), "en-GB");
    expect(a).toBe(b);
  });
});
