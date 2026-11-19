import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, LogOut, Mic, Send, Square } from "lucide-react";
import type { DebriefOut } from "../../supabase/functions/_shared/live.ts";
import { LIMITS } from "../../supabase/functions/_shared/live.ts";
import { dealProbability } from "../engine/engine";
import type { SessionRecord } from "../engine/profile";
import type { Scenario } from "../engine/types";
import { newId } from "../features/account/sessions";
import { Avatar, Gauge, Panel, PulseChart, moodLabel, type PulsePoint } from "../ui/parts";
import { T, useI18n } from "../i18n";
import { liveDebrief, liveErrorText, liveTurn } from "./api";
import { DICTATION_LANGS, DICTATION_OF, Dictation, appendText, browserRecognition, loadDictationLang, saveDictationLang, type DictationLang } from "./dictation";
import { applyLiveEval, createLive, debriefRequest, liveMood, liveScore, makeLiveRecord, turnRequest, type LiveState } from "./engine";

const QLABEL = { excellent: T("сильный ход"), good: T("хорошо"), neutral: T("нейтрально"), weak: T("слабо"), critical_error: T("критическая ошибка") } as const;
const QCOLOR = { excellent: "var(--hud-green)", good: "var(--hud-green)", neutral: "var(--text-dim)", weak: "var(--hud-gold)", critical_error: "var(--hud-red)" } as const;
const STATUS = { sale: "SALE CLOSED", partial: "PARTIAL", lost: "MISSION FAILED" } as const;
const OUT_COLOR = { sale: "var(--hud-green)", partial: "var(--hud-gold)", lost: "var(--hud-red)" } as const;

function List({ items }: { items: string[] }) {
  if (!items.length) return <p className="dim" style={{ fontSize: 13 }}>—</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function LiveDeal({
  scenario,
  onFinish,
  onExit,
  onReplay,
  onScripted,
}: {
  scenario: Scenario;
  onFinish: (rec: SessionRecord) => void;
  onExit: () => void;
  onReplay: () => void;
  onScripted: () => void;
}) {
  const { tr, lang } = useI18n();
  const [st, setSt] = useState<LiveState>(() => createLive(scenario, tr));
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sessionsLeft, setSessionsLeft] = useState<number | undefined>();
  const [debrief, setDebrief] = useState<DebriefOut | null>(null);
  const [debriefState, setDebriefState] = useState<"idle" | "loading" | "failed">("idle");
  const [startedAt] = useState(() => Date.now());
  const [points, setPoints] = useState<PulsePoint[]>(() => [{ trust: st.trust, interest: st.interest, irritation: st.irritation }]);
  const logRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const last = st.evals[st.evals.length - 1];
  const mood = liveMood(st);
  const prob = dealProbability(st);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [st.transcript.length, sending]);

  // ---- voice dictation (browser speech recognition) ----
  const recognition = useMemo(() => browserRecognition(), []);
  const [dLang, setDLang] = useState<DictationLang>(() => loadDictationLang(DICTATION_OF[lang]));
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [dictError, setDictError] = useState<string | null>(null);
  const dictRef = useRef<Dictation | null>(null);

  useEffect(() => {
    if (!recognition) return;
    const d = new Dictation(
      recognition,
      {
        onFinal: (t) => setInput((v) => appendText(v, t, LIMITS.playerChars)),
        onInterim: setInterim,
        onState: (s) => {
          setListening(s.listening);
          setDictError(s.error);
        },
      },
      loadDictationLang(DICTATION_OF[lang]),
    );
    dictRef.current = d;
    return () => {
      d.stop();
      dictRef.current = null;
    };
  }, [recognition, lang]);

  const toggleMic = useCallback(() => {
    const d = dictRef.current;
    if (!d) return;
    if (d.listening) d.stop();
    else {
      d.start();
      taRef.current?.focus();
    }
  }, []);

  const changeDictLang = (l: DictationLang) => {
    setDLang(l);
    saveDictationLang(l);
    dictRef.current?.setLang(l);
  };

  // Alt+M toggles the microphone, also while the text field has focus
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyM") {
        e.preventDefault();
        toggleMic();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toggleMic]);

  const send = useCallback(async () => {
    // words heard but not yet final are included, then dictation stops (it starts again with the mic button / Alt+M)
    const wasListening = dictRef.current?.listening ?? false;
    const text = (wasListening && interim ? appendText(input, interim, LIMITS.playerChars) : input).trim();
    dictRef.current?.stop();
    if (!text || sending || st.ended) return;
    setSending(true);
    setError("");
    try {
      const { eval: ev, sessionsLeft: left } = await liveTurn(turnRequest(scenario, st, text, lang));
      const next = applyLiveEval(st, scenario, text, ev);
      setSt(next);
      setPoints((p) => [...p, { trust: next.trust, interest: next.interest, irritation: next.irritation, quality: ev.quality }]);
      setSessionsLeft(left);
      setInput("");
    } catch (e) {
      setError(liveErrorText(e, tr));
    } finally {
      setSending(false);
      taRef.current?.focus();
    }
  }, [input, interim, sending, st, scenario, tr, lang]);

  // game over: save the record once and ask for the written debrief
  const ended = st.ended;
  useEffect(() => {
    if (!ended || savedRef.current) return;
    savedRef.current = true;
    onFinish(makeLiveRecord(scenario, st, Math.round((Date.now() - startedAt) / 1000), newId()));
    setDebriefState("loading");
    liveDebrief(debriefRequest(scenario, st, lang))
      .then((d) => {
        setDebrief(d);
        setDebriefState("idle");
      })
      .catch(() => setDebriefState("failed"));
  }, [ended, st, scenario, startedAt, onFinish, lang]);

  const score = useMemo(() => (ended ? liveScore(st, ended.outcome) : null), [ended, st]);
  const p = scenario.persona;

  return (
    <div className="deal">
      <div className="deal-top">
        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
          <button className="icon-btn" onClick={onExit} aria-label={tr("Выйти в меню")}>
            <LogOut size={14} />
          </button>
          <span className="t-display" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{scenario.title}</span>
          <span className="tag cyan"><Bot size={10} style={{ display: "inline" }} /> {tr("ЖИВОЙ КЛИЕНТ · ИИ")}</span>
          {st.irritation > 60 && !ended && <span className="warn-chip">⚠ {tr("КЛИЕНТ НА ГРАНИ")}</span>}
        </div>
        <span className="t-mono dim" style={{ fontSize: 12 }}>
          {tr("ход")} {Math.min(st.turn + 1, LIMITS.maxTurns)}/{LIMITS.maxTurns}
          {sessionsLeft !== undefined ? ` · ${tr("игр сегодня осталось: {n}", { n: sessionsLeft })}` : ""}
        </span>
      </div>

      <div className="deal-main">
        <div className="col desktop-only" style={{ flexDirection: "column" }}>
          <Panel title={tr("ДОСЬЕ")}>
            <Avatar mood={mood} />
            <div style={{ textAlign: "center" }}>
              <div className="t-display" style={{ fontSize: 16 }}>{p.name}, {p.age}</div>
              <div className="dim" style={{ fontSize: 13 }}>{p.profession}</div>
              <div className="t-mono" style={{ fontSize: 11, color: "var(--hud-cyan)", marginTop: 4 }}>● {tr(moodLabel(mood))}</div>
            </div>
            <div className="locked-box">▓ {tr("СКРЫТЫЙ МОТИВ [ЗАБЛОКИРОВАНО]")}</div>
          </Panel>
          <Panel title={tr("ТЕЛЕМЕТРИЯ")}>
            <div className="gauges">
              <Gauge label={tr("ДОВЕРИЕ")} value={st.trust} color="var(--hud-cyan)" delta={last?.delta.trust ?? 0} deltaKey={st.turn} />
              <Gauge label={tr("ИНТЕРЕС")} value={st.interest} color="var(--hud-gold)" delta={last?.delta.interest ?? 0} deltaKey={st.turn} />
              <Gauge label={tr("РАЗДРАЖ.")} value={st.irritation} color="var(--hud-red)" delta={last?.delta.irritation ?? 0} deltaKey={st.turn} />
            </div>
          </Panel>
        </div>

        <div className="col" style={{ gridColumn: "span 2" }}>
          <div className="mobile-only">
            <div className="panel" style={{ padding: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ ["--av" as string]: "52px", width: 52, flex: "none" }}><Avatar mood={mood} /></div>
              <div className="t-mono" style={{ fontSize: 11, flex: 1 }}>
                {tr("доверие")} {st.trust} · {tr("интерес")} {st.interest} · {tr("раздраж.")} {st.irritation}
              </div>
              <div className="t-display" style={{ fontSize: 22, color: prob >= 60 ? "var(--hud-green)" : prob >= 35 ? "var(--hud-gold)" : "var(--hud-red)" }}>{prob}%</div>
            </div>
          </div>
          <Panel title={tr("ПУЛЬС СДЕЛКИ")} className="desktop-only">
            <PulseChart points={points} />
          </Panel>

          <Panel title={tr("ДИАЛОГ")} className="grow">
            <div ref={logRef} className="log" aria-live="polite">
              {st.transcript.map((m, i) => {
                const evalIdx = m.role === "player" ? st.transcript.slice(0, i + 1).filter((x) => x.role === "player").length - 1 : -1;
                const q = evalIdx >= 0 ? st.evals[evalIdx]?.quality : undefined;
                return (
                  <div key={i} className={`msg ${m.role} ${q ? `q-${q}` : ""}`}>
                    <div className="who">{m.role === "player" ? `◇ ${tr("Ты")}` : `◆ ${p.name}`}</div>
                    {m.text}
                  </div>
                );
              })}
              {sending && (
                <div className="scan" aria-hidden><i /><i /><i /> {tr("клиент думает…")}</div>
              )}
            </div>
          </Panel>

          {!ended && (
            <div>
              {error && <div role="alert" style={{ color: "var(--hud-gold)", fontSize: 13, marginBottom: 6 }}>{error}</div>}
              <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <textarea
                  ref={taRef}
                  className="notes"
                  style={{ minHeight: 64, flex: 1 }}
                  placeholder={tr("Ваш ответ клиенту… (Enter — отправить, Shift+Enter — новая строка)")}
                  aria-label={tr("Ваш ответ клиенту")}
                  maxLength={LIMITS.playerChars}
                  value={input}
                  disabled={sending}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  autoFocus
                />
                {recognition && (
                  <button
                    className={`btn ${listening ? "rec" : ""}`}
                    onClick={toggleMic}
                    disabled={sending}
                    aria-pressed={listening}
                    aria-label={listening ? tr("Остановить диктовку (Alt+M)") : tr("Диктовать голосом (Alt+M)")}
                    title={listening ? tr("Остановить диктовку (Alt+M)") : tr("Диктовать голосом (Alt+M). Речь распознаёт браузер.")}
                  >
                    {listening ? <Square size={16} /> : <Mic size={16} />}
                  </button>
                )}
                <button className="btn gold" onClick={() => void send()} disabled={sending || (!input.trim() && !interim)} aria-label={tr("Отправить")}>
                  <Send size={16} />
                </button>
              </div>
              {recognition && (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 6, fontSize: 12 }}>
                  <label className="t-mono dim" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                    {tr("Язык диктовки")}
                    <select className="notes" style={{ minHeight: 0, height: 26, width: 64, padding: "0 4px" }} value={dLang} onChange={(e) => changeDictLang(e.target.value as DictationLang)} aria-label={tr("Язык диктовки")}>
                      {DICTATION_LANGS.map((l) => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </label>
                  {listening && (
                    <span role="status" style={{ color: "var(--hud-red)" }}>
                      ● {tr("Слушаю… говорите")} <span className="dim">({tr("речь распознаёт браузер")})</span>
                      {interim && <em style={{ color: "var(--text)", marginLeft: 6 }}>{interim}</em>}
                    </span>
                  )}
                  {!listening && dictError && <span role="alert" style={{ color: "var(--hud-gold)" }}>{tr(dictError)}</span>}
                </div>
              )}
              {!recognition && <div className="dim" style={{ fontSize: 11, marginTop: 4 }}>{tr("Голосовой ввод доступен в Chrome, Edge и Safari.")}</div>}
              <div className="t-mono dim" style={{ fontSize: 11, marginTop: 4 }}>{input.length}/{LIMITS.playerChars} · {tr("суммы называйте в $ или € · не обещайте доход и гарантии — ИИ-клиент это заметит")}</div>
            </div>
          )}
        </div>
      </div>

      {ended && score && (
        <Panel title={tr("РАЗБОР ПОЛЁТОВ · ЖИВОЙ РЕЖИМ")}>
          <div style={{ maxHeight: "44vh", overflowY: "auto" }}>
            <div className="t-display" style={{ fontSize: 26, color: OUT_COLOR[ended.outcome] }}>{STATUS[ended.outcome]}</div>
            <div className="dim" style={{ fontSize: 13 }}>{tr(ended.reason)}</div>
            <div className="t-mono" style={{ fontSize: 13, margin: "6px 0" }}>
              {tr("Очки")}: <b style={{ color: "var(--hud-gold)" }}>{score.total}</b> · {tr("ходов")} {st.turn}
              {score.riskyWin && <span className="warn-chip" style={{ marginLeft: 8 }}>⚠ {tr("ПРОДАЖА С РИСКОМ ВОЗВРАТА/ЖАЛОБЫ")}</span>}
            </div>

            {debriefState === "loading" && <div className="scan"><i /><i /><i /> {tr("тренер пишет разбор…")}</div>}
            {debriefState === "failed" && <p className="dim" style={{ fontSize: 12 }}>{tr("Письменный разбор не удалось получить; ниже — оценки по ходам.")}</p>}
            {debrief && (
              <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                <div><div className="t-mono" style={{ color: "var(--hud-green)", fontSize: 12 }}>✔ {tr("ЧТО БЫЛО ХОРОШО")}</div><List items={debrief.good} /></div>
                <div><div className="t-mono" style={{ color: "var(--hud-red)", fontSize: 12 }}>✘ {tr("ЧТО БЫЛО ПЛОХО")}</div><List items={debrief.bad} /></div>
                <div><div className="t-mono" style={{ color: "var(--hud-gold)", fontSize: 12 }}>↗ {tr("ТОЧКИ РОСТА")}</div><List items={debrief.growth} /></div>
                <div><div className="t-mono" style={{ color: "var(--hud-cyan)", fontSize: 12 }}>🔍 {tr("ЧТО СКРЫВАЛ КЛИЕНТ")}</div><List items={debrief.hidden} /></div>
                {debrief.forkTurn && <div><div className="t-mono" style={{ color: "var(--hud-gold)", fontSize: 12 }}>⑂ {tr("КЛЮЧЕВАЯ РАЗВИЛКА")}: {tr("ход")} {debrief.forkTurn}</div><p style={{ margin: "4px 0" }}>{debrief.forkAdvice}</p></div>}
              </div>
            )}

            <div className="t-mono" style={{ color: "var(--hud-cyan)", fontSize: 12, margin: "12px 0 4px" }}>{tr("ОЦЕНКИ ПО ХОДАМ")}</div>
            {st.evals.map((e, i) => (
              <div className="turn" key={i}>
                <span className="t-mono dim" style={{ fontSize: 12 }}>{tr("Ход")} {i + 1} </span>
                <span className="q-badge" style={{ color: QCOLOR[e.quality] }}>{tr(QLABEL[e.quality])}</span>
                {e.mistake && <span className="tag" style={{ color: "var(--hud-red)", borderColor: "var(--hud-red)", marginLeft: 6 }}>{e.mistake}</span>}
                {e.technique && <span className="tag cyan" style={{ marginLeft: 6 }}>{e.technique}</span>}
                <div className="dim" style={{ fontSize: 13, marginTop: 2 }}>{e.coachNote}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            <button className="btn gold" onClick={onReplay}>{tr("Ещё раз с живым клиентом")}</button>
            <button className="btn" onClick={onScripted}>{tr("Скриптовый режим")}</button>
            <button className="btn ghost" onClick={onExit}>{tr("В меню")}</button>
          </div>
        </Panel>
      )}
    </div>
  );
}
