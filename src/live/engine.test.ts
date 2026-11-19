import { describe, expect, it } from "vitest";
import { allScenarios } from "../content";
import { LIMITS, type ClientEval } from "../../supabase/functions/_shared/live.ts";
import { applyLiveEval, createLive, debriefRequest, liveMood, liveScore, makeLiveRecord, openingLine, toLiveScenario, turnRequest } from "./engine";

const sc = allScenarios.find((s) => s.level === 3)!;
const ev = (over: Partial<ClientEval> = {}): ClientEval => ({
  reply: "Понятно.", trustDelta: 5, interestDelta: 3, irritationDelta: -2, quality: "good", coachNote: "ок", isEnding: false, ...over,
});

describe("live game state", () => {
  it("starts with the scripted opening line and the scenario's scales", () => {
    const st = createLive(sc);
    expect(st.transcript).toEqual([{ role: "client", text: openingLine(sc) }]);
    expect([st.trust, st.interest, st.irritation]).toEqual([sc.initialState.trust, sc.initialState.interest, sc.initialState.irritation]);
    expect(st.turn).toBe(0);
  });

  it("applies an evaluation: scales, transcript, eval list, deltas", () => {
    const st = applyLiveEval(createLive(sc), sc, "Добрый день!", ev());
    expect(st.turn).toBe(1);
    expect(st.trust).toBe(sc.initialState.trust + 5);
    expect(st.transcript.slice(-2)).toEqual([{ role: "player", text: "Добрый день!" }, { role: "client", text: "Понятно." }]);
    expect(st.evals[0].delta).toEqual({ trust: 5, interest: 3, irritation: -2 });
    expect(st.ended).toBeUndefined();
  });

  it("clamps the scales to 0..100", () => {
    const st = applyLiveEval(createLive(sc), sc, "x", ev({ trustDelta: 25, interestDelta: 25, irritationDelta: -25 }));
    expect(st.irritation).toBeGreaterThanOrEqual(0);
    const big = { ...createLive(sc), trust: 95, interest: 95 };
    expect(applyLiveEval(big, sc, "x", ev({ trustDelta: 25 })).trust).toBe(100);
  });

  it("ends by thresholds like the scripted mode", () => {
    const angry = { ...createLive(sc), irritation: 90 };
    const r = applyLiveEval(angry, sc, "x", ev({ quality: "weak", trustDelta: 0, irritationDelta: 20 }));
    expect(r.ended).toMatchObject({ outcome: "lost" });
    expect(r.ended!.reason).toMatch(/Раздражение/);
    const mistrust = { ...createLive(sc), trust: 10 };
    expect(applyLiveEval(mistrust, sc, "x", ev({ quality: "critical_error", trustDelta: -25 })).ended!.reason).toMatch(/Доверие/);
  });

  it("ends when the client ends, and at the turn cap", () => {
    expect(applyLiveEval(createLive(sc), sc, "x", ev({ isEnding: true, outcome: "partial" })).ended).toMatchObject({ outcome: "partial" });
    let st = createLive(sc);
    for (let i = 0; i < LIMITS.maxTurns; i++) st = applyLiveEval(st, sc, "x", ev({ trustDelta: 2, interestDelta: 2, irritationDelta: 0 }));
    expect(st.turn).toBe(LIMITS.maxTurns);
    expect(st.ended).toBeDefined();
    expect(["partial", "lost"]).toContain(st.ended!.outcome);
  });

  it("scoring matches the scripted formula and flags risky wins", () => {
    let st = createLive(sc);
    st = applyLiveEval(st, sc, "a", ev({ quality: "excellent" }));
    st = applyLiveEval(st, sc, "b", ev({ quality: "critical_error", trustDelta: -1, irritationDelta: 1 }));
    expect(liveScore(st, "sale")).toMatchObject({ base: 100, moves: 10 - 15, total: 95, riskyWin: true });
    expect(liveScore(st, "lost").total).toBe(0);
  });

  it("makes a history record for the profile", () => {
    let st = createLive(sc);
    st = applyLiveEval(st, sc, "a", ev({ quality: "excellent", isEnding: true, outcome: "partial" }));
    const r = makeLiveRecord(sc, st, 33, "id1", new Date("2026-11-19T10:00:00Z"));
    expect(r).toMatchObject({ id: "id1", scenarioId: `live:${sc.id}`, level: sc.level, outcome: "partial", turns: 1, durationSec: 33, score: 60 });
    expect(r.moves).toEqual([{ nodeId: "live-1", quality: "excellent" }]);
  });

  it("builds requests the server accepts and keeps the transcript within limits", () => {
    let st = createLive(sc);
    for (let i = 0; i < 30; i++) st = { ...st, transcript: [...st.transcript, { role: "player", text: "p" }] };
    expect(turnRequest(sc, st, "hi").transcript.length).toBeLessThanOrEqual(LIMITS.transcriptMessages);
    expect(turnRequest(sc, st, "hi")).toMatchObject({ action: "turn", player: "hi", scenario: { id: sc.id, level: sc.level } });
    const d = debriefRequest(sc, { ...st, turn: 99 });
    expect(d.action).toBe("debrief");
    expect(d.turn).toBe(LIMITS.maxTurns);
    expect(JSON.stringify(toLiveScenario(sc))).not.toContain("nodes");
  });

  it("maps scales to avatar moods", () => {
    expect(liveMood({ trust: 50, interest: 30, irritation: 90 })).toBe("reset");
    expect(liveMood({ trust: 50, interest: 30, irritation: 65 })).toBe("irritated");
    expect(liveMood({ trust: 80, interest: 30, irritation: 10 })).toBe("warm");
    expect(liveMood({ trust: 50, interest: 70, irritation: 10 })).toBe("interested");
    expect(liveMood({ trust: 20, interest: 30, irritation: 10 })).toBe("doubtful");
    expect(liveMood({ trust: 50, interest: 30, irritation: 10 })).toBe("neutral");
  });
});
