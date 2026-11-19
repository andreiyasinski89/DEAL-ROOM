import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Lightbulb, NotebookPen, Pause, PanelBottomOpen, X } from "lucide-react";
import type { ClientNode, GameState, Mood, Outcome, Quality, Scenario } from "../engine/types";
import {
  applyChoice,
  createState,
  currentClientNode,
  currentEnding,
  dealProbability,
  getNode,
  type EndingView,
} from "../engine/engine";
import { T, useI18n } from "../i18n";
import { play } from "../sound";
import { Tour } from "./Tour";
import { CHANNEL_LABEL } from "./labels";
import { Avatar, Gauge, Panel, PulseChart, TypedText, moodLabel, type PulsePoint } from "./parts";

export type FinishedGame = { state: GameState; outcome: Outcome; reason: string; durationSec: number };

type LogItem = { id: number; kind: "client" | "player" | "ending"; text: string; quality?: Quality };

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function shuffle<T>(arr: T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Weak and wrong answers carry a plausible-sounding tag too, so tags do not give the answer away. */
const DECOYS = [T("Аргумент"), T("Убеждение"), T("Объяснение"), T("Предложение"), T("Заверение")];
const decoyTag = (seed: string) => DECOYS[hashStr(seed) % DECOYS.length];

const vibrate = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
};

export function Deal({
  scenario,
  fx,
  onFinish,
  onExit,
  tour = false,
  onTourDone,
}: {
  scenario: Scenario;
  fx: boolean;
  onFinish: (g: FinishedGame) => void;
  onExit: () => void;
  /** Show the guided tour on top of the game. */
  tour?: boolean;
  onTourDone?: () => void;
}) {
  const [tourOpen, setTourOpen] = useState(tour);
  const { tr } = useI18n();
  const startNode = getNode(scenario, scenario.startNodeId) as ClientNode;
  const [st, setSt] = useState<GameState>(() => createState(scenario));
  const [log, setLog] = useState<LogItem[]>([{ id: 0, kind: "client", text: startNode.text }]);
  const [phase, setPhase] = useState<"typing" | "choosing" | "thinking" | "ended">("typing");
  const [mood, setMood] = useState<Mood>(startNode.mood ?? "neutral");
  const [points, setPoints] = useState<PulsePoint[]>([
    { trust: st.trust, interest: st.interest, irritation: st.irritation },
  ]);
  const [deltas, setDeltas] = useState({ trust: 0, interest: 0, irritation: 0, key: 0 });
  const [probDir, setProbDir] = useState(0);
  const [flash, setFlash] = useState<null | "red" | "green">(null);
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState<{ nodeId: string; text: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [notes, setNotes] = useState("");
  const [skipTick, setSkipTick] = useState(0);
  const [announce, setAnnounce] = useState("");
  const [ending, setEnding] = useState<EndingView | null>(null);

  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const [startedAt] = useState(() => Date.now());
  const idRef = useRef(1);
  const timers = useRef<number[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const node = currentClientNode(scenario, st);
  const choices = useMemo(
    () => (node ? shuffle(node.choices, hashStr(node.id) ^ seed) : []),
    [node, seed],
  );

  // irritation tint for the whole HUD
  useEffect(() => {
    const v = Math.max(0, (st.irritation - 60) / 40);
    const root = document.documentElement;
    root.style.setProperty("--alert", String(v));
    root.classList.toggle("alert-on", st.irritation > 60);
    return () => {
      root.style.setProperty("--alert", "0");
      root.classList.remove("alert-on");
    };
  }, [st.irritation]);

  // keep the log scrolled to the end while text is typed
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    if (phase !== "typing") return;
    const id = setInterval(() => (el.scrollTop = el.scrollHeight), 80);
    return () => clearInterval(id);
  }, [log.length, phase]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const choose = useCallback(
    (choiceId: string) => {
      if (phase !== "choosing" || paused || !node) return;
      const choice = node.choices.find((c) => c.id === choiceId);
      if (!choice) return;
      const prevProb = dealProbability(st);
      const next = applyChoice(scenario, st, choiceId);
      const last = next.history[next.history.length - 1];

      setSt(next);
      setPoints((p) => [...p, { ...last.after, quality: choice.quality }]);
      setDeltas((d) => ({ ...last.delta, key: d.key + 1 }));
      setProbDir(Math.sign(dealProbability(next) - prevProb));
      setLog((l) => [...l, { id: idRef.current++, kind: "player", text: choice.text, quality: choice.quality }]);
      setPhase("thinking");
      setHint(null);

      play(choice.quality === "critical_error" ? "error" : choice.quality === "excellent" || choice.quality === "good" ? "strong" : "click");
      if (choice.quality === "critical_error") {
        setFlash("red");
        setShake(true);
        vibrate([70, 40, 70]);
        later(() => setShake(false), 400);
      } else if (choice.quality === "excellent" || choice.quality === "good") {
        setFlash("green");
        vibrate(30);
      }
      later(() => setFlash(null), 450);

      later(() => {
        const end = currentEnding(scenario, next);
        if (end) {
          setEnding(end);
          play(end.outcome === "sale" ? "win" : end.outcome === "partial" ? "partial" : "lose");
          setMood(end.mood ?? "neutral");
          setLog((l) => [...l, { id: idRef.current++, kind: "ending", text: end.text }]);
        } else {
          const n = getNode(scenario, next.nodeId) as ClientNode;
          setMood(n.mood ?? "neutral");
          setLog((l) => [...l, { id: idRef.current++, kind: "client", text: n.text }]);
        }
        setPhase("typing");
      }, fx ? 900 : 100);
    },
    [phase, paused, node, st, scenario, fx],
  );

  const requestHint = useCallback(() => {
    if (phase !== "choosing" || !node) return;
    if (hint?.nodeId === node.id) return;
    setHint({ nodeId: node.id, text: node.hint ?? tr("Для этого хода подсказки нет.") });
    if (node.hint) setSt((s) => ({ ...s, hintsUsed: s.hintsUsed + 1 }));
  }, [phase, node, hint, tr]);

  const finish = useCallback(() => {
    if (!ending) return;
    onFinish({ state: st, outcome: ending.outcome, reason: ending.reason, durationSec: Math.round((Date.now() - startedAt) / 1000) });
  }, [ending, st, onFinish, startedAt]);

  const openNotes = useCallback(() => {
    const el = notesRef.current;
    if (el && el.offsetParent !== null) el.focus();
    else setSheet(true);
  }, []);

  // keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") {
        if (e.code === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (e.code === "Escape") {
        if (sheet) setSheet(false);
        else setPaused((p) => !p);
        return;
      }
      if (paused) return;
      if (/^Digit[1-4]$/.test(e.code)) {
        const c = choices[Number(e.code.slice(5)) - 1];
        if (c) choose(c.id);
      } else if (e.code === "KeyH") requestHint();
      else if (e.code === "KeyN") {
        e.preventDefault();
        openNotes();
      } else if (e.code === "Space" || e.code === "Enter") {
        if (phase === "typing") {
          e.preventDefault();
          setSkipTick((t) => t + 1);
        } else if (phase === "ended") finish();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [choices, choose, requestHint, openNotes, finish, phase, paused, sheet]);

  const prob = dealProbability(st);
  const lastId = log[log.length - 1].id;
  const showTags = scenario.level <= 2;
  const turnNo = Math.min(st.history.length + 1, 99);
  const p = scenario.persona;

  const onTyped = (item: LogItem) => () => {
    if (item.id !== lastId) return;
    setAnnounce(item.text);
    setPhase(item.kind === "ending" ? "ended" : "choosing");
  };

  const Dossier = (
    <div>
      <Avatar mood={mood} />
      <div style={{ textAlign: "center" }}>
        <div className="t-display" style={{ fontSize: 16 }}>
          {p.name}, {p.age}
        </div>
        <div className="dim" style={{ fontSize: 13 }}>
          {p.profession}
        </div>
        <div className="t-mono" style={{ fontSize: 11, color: "var(--hud-cyan)", marginTop: 4 }}>
          ● {tr(moodLabel(mood))}
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="dossier-row">
          <span className="dim">{tr("Психотип")}</span>
          <span>{p.psychotype}</span>
        </div>
        <div className="dossier-row">
          <span className="dim">{tr("Канал")}</span>
          <span>{tr(CHANNEL_LABEL[scenario.channel])}</span>
        </div>
      </div>
      <div className="locked-box">{tr("▓ СКРЫТЫЙ МОТИВ [ЗАБЛОКИРОВАНО]")}</div>
    </div>
  );

  const Notes = (
    <textarea
      ref={notesRef}
      className="notes"
      placeholder={tr("Заметки игрока… (N)")}
      aria-label={tr("Заметки игрока")}
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  );

  const Telemetry = (
    <div className={shake ? "shake" : ""}>
      <div className="gauges">
        <Gauge label={tr("ДОВЕРИЕ")} value={st.trust} color="var(--hud-cyan)" delta={deltas.trust} deltaKey={deltas.key} />
        <Gauge label={tr("ИНТЕРЕС")} value={st.interest} color="var(--hud-gold)" delta={deltas.interest} deltaKey={deltas.key} />
        <Gauge label={tr("РАЗДРАЖ.")} invert value={st.irritation} color="var(--hud-red)" delta={deltas.irritation} deltaKey={deltas.key} />
      </div>
    </div>
  );

  const Probability = (
    <div className="prob">
      <div className="panel-title" style={{ justifyContent: "center" }}>
        {tr("ВЕРОЯТНОСТЬ СДЕЛКИ")}
      </div>
      <motion.div
        key={prob}
        className="big"
        style={{ color: prob >= 60 ? "var(--hud-green)" : prob >= 35 ? "var(--hud-gold)" : "var(--hud-red)" }}
        initial={{ scale: 1.25 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {prob}%
        <span style={{ fontSize: 20, marginLeft: 6 }} aria-label={probDir > 0 ? tr("растёт") : probDir < 0 ? tr("падает") : ""}>
          {probDir > 0 ? "▲" : probDir < 0 ? "▼" : ""}
        </span>
      </motion.div>
      <div className="t-mono dim" style={{ fontSize: 12, marginTop: 10, display: "flex", justifyContent: "space-between" }}>
        <span>
          {tr("КОМБО")}{" "}
          <b style={{ color: st.combo > 0 ? "var(--hud-gold)" : undefined }}>
            x{Math.max(1, st.combo)} {st.combo >= 2 && <Flame size={12} style={{ display: "inline" }} />}
          </b>
        </span>
        <span>
          {tr("ХОД")} {turnNo} / ~{scenario.estimatedTurns}
        </span>
      </div>
    </div>
  );

  return (
    <div className="deal">
      {tourOpen && (
        <Tour
          onDone={() => {
            setTourOpen(false);
            onTourDone?.();
          }}
        />
      )}
      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
      <AnimatePresence>
        {flash && (
          <motion.div
            className={`flash ${flash}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <div className="deal-top">
        <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
          <button className="icon-btn" onClick={() => setPaused(true)} aria-label={tr("Пауза (Esc)")}>
            <Pause size={14} /> <span className="desktop-only" style={{ display: undefined }}>Esc</span>
          </button>
          <span className="t-display" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {scenario.title}
          </span>
          {st.irritation > 60 && <span className="warn-chip">{tr("⚠ КЛИЕНТ НА ГРАНИ")}</span>}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="icon-btn" data-tour="hint" onClick={requestHint} disabled={phase !== "choosing"} aria-label={tr("Подсказка Джарвиса, минус 10 очков")}>
            <Lightbulb size={14} /> H · −10
          </button>
          <button className="icon-btn" onClick={openNotes} aria-label={tr("Заметки")}>
            <NotebookPen size={14} /> N
          </button>
          <button className="icon-btn mobile-only" onClick={() => setSheet(true)} aria-label={tr("Досье и пульс сделки")}>
            <PanelBottomOpen size={14} />
          </button>
        </div>
      </div>

      {/* mobile status strip */}
      <div className="mobile-only">
        <div className="panel" style={{ padding: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ ["--av" as string]: "52px", width: 52, flex: "none" }}>
            <Avatar mood={mood} />
          </div>
          <div style={{ flex: 1, display: "grid", gap: 4 }}>
            <MiniBar label={tr("ДОВЕРИЕ")} v={st.trust} color="var(--hud-cyan)" />
            <MiniBar label={tr("ИНТЕРЕС")} v={st.interest} color="var(--hud-gold)" />
            <MiniBar label={tr("РАЗДРАЖ.")} v={st.irritation} color="var(--hud-red)" />
          </div>
          <div className="t-display" style={{ fontSize: 22, color: prob >= 60 ? "var(--hud-green)" : prob >= 35 ? "var(--hud-gold)" : "var(--hud-red)" }}>
            {prob}%
          </div>
        </div>
      </div>

      <div className="deal-main">
        <div className="col desktop-only" style={{ flexDirection: "column" }}>
          <Panel title={tr("ДОСЬЕ")} tour="dossier">{Dossier}</Panel>
          <Panel title={tr("ЗАМЕТКИ")}>{Notes}</Panel>
        </div>

        <div className="col">
          <Panel title={tr("ПУЛЬС СДЕЛКИ")} className="desktop-only" tour="pulse">
            <div style={{ width: "100%" }}>
              <PulseChart points={points} />
            </div>
          </Panel>
          <Panel title={tr("ДИАЛОГ")} className="grow" tour="dialog">
            <div
              ref={logRef}
              className="log"
              style={{ maxHeight: "none" }}
              onClick={() => phase === "typing" && setSkipTick((t) => t + 1)}
            >
              {log.map((m) => (
                <motion.div
                  key={m.id}
                  className={`msg ${m.kind} ${m.quality ? `q-${m.quality}` : ""}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="who">{m.kind === "player" ? tr("◇ Ты") : `◆ ${p.name}`}</div>
                  {m.kind === "player" ? (
                    m.text
                  ) : (
                    <TypedText
                      text={m.text}
                      animate={fx && m.id === lastId && phase === "typing"}
                      skipTick={skipTick}
                      onDone={onTyped(m)}
                    />
                  )}
                </motion.div>
              ))}
              {phase === "thinking" && (
                <div className="scan" aria-hidden>
                  <i />
                  <i />
                  <i /> {tr("анализирует…")}
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="col desktop-only" style={{ flexDirection: "column" }}>
          <Panel title={tr("ТЕЛЕМЕТРИЯ")} tour="telemetry">{Telemetry}</Panel>
          <Panel>{Probability}</Panel>
        </div>
      </div>

      <AnimatePresence>
        {hint && node && hint.nodeId === node.id && phase === "choosing" && (
          <motion.div
            className="panel jarvis"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="note"
          >
            ◈ {tr("ДЖАРВИС")}: {hint.text}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "choosing" && node && (
        <div className="choices" role="group" aria-label={tr("Варианты ответа")} data-tour="choices">
          {choices.map((c, i) => (
            <button key={c.id} className="choice" onClick={() => choose(c.id)}>
              {showTags && <span className="ctag">{c.technique ?? tr(decoyTag(c.id + c.text.length))}</span>}
              <span className="ctext">
                <span className="key">[{i + 1}]</span>
                {c.text}
              </span>
            </button>
          ))}
        </div>
      )}
      {phase === "ended" && ending && (
        <Panel className="">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="t-mono" style={{ color: ending.outcome === "sale" ? "var(--hud-green)" : ending.outcome === "partial" ? "var(--hud-gold)" : "var(--hud-red)" }}>
              {ending.reason}
            </span>
            <button className="btn gold" onClick={finish} autoFocus>
              {tr("Разбор полётов")} [Enter]
            </button>
          </div>
        </Panel>
      )}
      {(phase === "typing" || phase === "thinking") && (
        <div className="dim t-mono" style={{ fontSize: 11, textAlign: "center", minHeight: 20 }}>
          {phase === "typing" ? tr("клик или пробел — пропустить печать") : ""}
        </div>
      )}

      {/* mobile bottom sheet */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
            <motion.div
              className="sheet"
              role="dialog"
              aria-label="Досье и пульс сделки"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="icon-btn" onClick={() => setSheet(false)} aria-label={tr("Закрыть")}>
                  <X size={14} />
                </button>
              </div>
              <Panel title={tr("ПУЛЬС СДЕЛКИ")}>
                <PulseChart points={points} />
              </Panel>
              <div style={{ height: 10 }} />
              <Panel title={tr("ДОСЬЕ")}>{Dossier}</Panel>
              <div style={{ height: 10 }} />
              <Panel title={tr("ЗАМЕТКИ")}>{Notes}</Panel>
              <div style={{ height: 10 }} />
              <Panel>{Probability}</Panel>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* pause */}
      {paused && (
        <div className="sheet-backdrop" style={{ display: "grid", placeItems: "center", zIndex: 60 }}>
          <Panel title={tr("ПАУЗА")}>
            <div style={{ display: "flex", gap: 10, flexDirection: "column", minWidth: 240 }}>
              <button className="btn" onClick={() => setPaused(false)} autoFocus>
                {tr("Продолжить")} [Esc]
              </button>
              <button className="btn ghost" onClick={onExit}>
                {tr("Выйти в меню")}
              </button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

function MiniBar({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }} role="meter" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <span className="t-mono dim" style={{ fontSize: 9, width: 52 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 5, background: "rgba(127,147,176,0.2)" }}>
        <motion.div style={{ height: "100%", background: color, boxShadow: `0 0 6px ${color}` }} initial={false} animate={{ width: `${v}%` }} transition={{ duration: 0.4, ease: "easeOut" }} />
      </div>
      <span className="t-mono" style={{ fontSize: 10, width: 22, textAlign: "right" }}>
        {v}
      </span>
    </div>
  );
}
