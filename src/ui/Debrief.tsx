import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, FileDown, GitFork, Image as ImageIcon, LineChart, Lock, RotateCcw, Trophy } from "lucide-react";
import type { Quality, Scenario } from "../engine/types";
import { bestPath, buildDebrief, fmtTime, type Debrief as DebriefData } from "../engine/debrief";
import { getNode } from "../engine/engine";
import { T, useI18n } from "../i18n";
import { Panel, PulseChart, type PulsePoint } from "./parts";
import { download, renderStoryPng } from "./exportImage";
import type { FinishedGame } from "./Deal";

const STATUS = { sale: "SALE CLOSED", partial: "PARTIAL", lost: "MISSION FAILED" } as const;
const OUTCOME_RU = { sale: T("продажа состоялась"), partial: T("договорились о следующем шаге"), lost: T("клиент ушёл") } as const;
const QLABEL: Record<Quality, string> = {
  excellent: T("сильный ход"),
  good: T("хорошо"),
  neutral: T("нейтрально"),
  weak: T("слабо"),
  critical_error: T("критическая ошибка"),
};
const QCOLOR: Record<Quality, string> = {
  excellent: "var(--hud-green)",
  good: "var(--hud-green)",
  neutral: "var(--text-dim)",
  weak: "var(--hud-gold)",
  critical_error: "var(--hud-red)",
};
const OUTCOME_COLOR = { sale: "var(--hud-green)", partial: "var(--hud-gold)", lost: "var(--hud-red)" } as const;

type View = "stories" | "timeline" | "best";

function List({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="dim">{empty}</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10 }}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function Section({ head, color, children }: { head: string; color: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div className="t-mono" style={{ color, fontSize: 12, letterSpacing: "0.14em", marginBottom: 6 }}>
        {head}
      </div>
      {children}
    </div>
  );
}

/** Summary card: used on screen (last story card) and in the printable sheet. */
function Summary({ d, scenario }: { d: DebriefData; scenario: Scenario }) {
  const { tr } = useI18n();
  return (
    <div className="summary">
      <div className="t-display" style={{ fontSize: 14, color: OUTCOME_COLOR[d.outcome] }}>
        {tr("Итог")}: {STATUS[d.outcome]} — {tr(OUTCOME_RU[d.outcome])}
      </div>
      <div className="t-mono" style={{ fontSize: 13, marginTop: 4 }}>
        {scenario.title} · {tr("Очки")}: <b>{d.score.total}</b>/{d.score.max} · {tr("Ходов")}: {d.turns} · {tr("Время")}: {fmtTime(d.durationSec)}
      </div>
      {d.score.riskyWin && <div className="warn-chip" style={{ display: "inline-block", marginTop: 8 }}>{tr("⚠ ПРОДАЖА С РИСКОМ ВОЗВРАТА/ЖАЛОБЫ")}</div>}
      <Section head={tr("✔ ЧТО БЫЛО ХОРОШО")} color="var(--hud-green)">
        <List items={d.good} empty={tr("Сильных ходов не было — это точка роста.")} />
      </Section>
      <Section head={tr("✘ ЧТО БЫЛО ПЛОХО")} color="var(--hud-red)">
        <List items={d.bad} empty={tr("Слабых ходов нет.")} />
      </Section>
      <Section head={tr("↗ ТОЧКИ РОСТА")} color="var(--hud-gold)">
        <List items={d.growth} empty="—" />
      </Section>
      <Section head={tr("🔍 ЧТО СКРЫВАЛ КЛИЕНТ")} color="var(--hud-cyan)">
        <List items={d.hidden} empty="—" />
      </Section>
      {d.fork && (
        <Section head={tr("⑂ КЛЮЧЕВАЯ РАЗВИЛКА: ход {n}", { n: d.fork.turn })} color="var(--hud-gold)">
          <div>{tr("Лучший ответ")}: «{d.fork.best.text}»</div>
        </Section>
      )}
    </div>
  );
}

export function Debrief({
  scenario,
  game,
  attempts,
  fx,
  onReplay,
  onMenu,
  onLive,
}: {
  scenario: Scenario;
  game: FinishedGame;
  attempts: number;
  fx: boolean;
  onReplay: () => void;
  onMenu: () => void;
  /** Present only when the AI mode is available (signed in, cloud configured). */
  onLive?: () => void;
}) {
  const d = useMemo(
    () => buildDebrief(scenario, game.state, game.outcome, game.reason, game.durationSec),
    [scenario, game],
  );
  const best = useMemo(() => bestPath(scenario), [scenario]);
  const bestLocked = scenario.level >= 4 && attempts < 2;

  const { tr } = useI18n();
  const [view, setView] = useState<View>("stories");
  const [intro, setIntro] = useState(fx);
  const [idx, setIdx] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!intro) return;
    const t = setTimeout(() => setIntro(false), 1500);
    return () => clearTimeout(t);
  }, [intro]);

  const cards = useMemo(() => {
    const list: { key: string; title: string; color: string; body: ReactNode }[] = [
      {
        key: "result",
        title: tr("ИТОГ МИССИИ"),
        color: OUTCOME_COLOR[d.outcome],
        body: (
          <div style={{ textAlign: "center" }}>
            <div className="t-display" style={{ fontSize: 34, color: OUTCOME_COLOR[d.outcome], textShadow: `0 0 24px ${OUTCOME_COLOR[d.outcome]}` }}>
              {STATUS[d.outcome]}
            </div>
            <p className="dim">{d.reason}</p>
            <div className="t-display" style={{ fontSize: 44, color: "var(--hud-gold)" }}>
              {d.score.total}
              <span className="dim" style={{ fontSize: 18 }}>
                /{d.score.max}
              </span>
            </div>
            <div className="t-mono dim" style={{ fontSize: 13 }}>
              {tr("ходов")} {d.turns} · {tr("время")} {fmtTime(d.durationSec)} · {tr("подсказок")} {game.state.hintsUsed}
            </div>
            {d.score.riskyWin && <div className="warn-chip" style={{ display: "inline-block", marginTop: 10 }}>{tr("⚠ ПРОДАЖА С РИСКОМ ВОЗВРАТА/ЖАЛОБЫ")}</div>}
          </div>
        ),
      },
      { key: "good", title: tr("✔ ЧТО БЫЛО ХОРОШО"), color: "var(--hud-green)", body: <List items={d.good} empty={tr("Сильных ходов не было — это точка роста.")} /> },
      { key: "bad", title: tr("✘ ЧТО БЫЛО ПЛОХО"), color: "var(--hud-red)", body: <List items={d.bad} empty={tr("Слабых ходов нет. Чисто!")} /> },
      { key: "growth", title: tr("↗ ТОЧКИ РОСТА"), color: "var(--hud-gold)", body: <List items={d.growth} empty="—" /> },
      { key: "hidden", title: tr("🔍 ЧТО СКРЫВАЛ КЛИЕНТ"), color: "var(--hud-cyan)", body: <List items={d.hidden} empty="—" /> },
    ];
    if (d.fork) {
      const f = d.fork;
      list.push({
        key: "fork",
        title: tr("⑂ КЛЮЧЕВАЯ РАЗВИЛКА · ХОД {n}", { n: f.turn }),
        color: "var(--hud-gold)",
        body: (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="dim">{tr("Клиент")}: «{f.clientText}»</div>
            <div>
              <span className="q-badge" style={{ color: QCOLOR[f.chosen.quality] }}>{tr("ваш ответ")} · {tr(QLABEL[f.chosen.quality])}</span>
              <div style={{ margin: "4px 0" }}>«{f.chosen.text}»</div>
              <div className="dim" style={{ fontSize: 13 }}>{f.chosen.coachNote}</div>
            </div>
            <div>
              <span className="q-badge" style={{ color: "var(--hud-green)" }}>{tr("лучший ответ")} · {tr(QLABEL[f.best.quality])}</span>
              <div style={{ margin: "4px 0" }}>«{f.best.text}»</div>
              <div className="dim" style={{ fontSize: 13 }}>{f.best.coachNote}</div>
            </div>
          </div>
        ),
      });
    }
    list.push({ key: "summary", title: tr("РАЗБОР ПОЛЁТОВ"), color: "var(--hud-cyan)", body: <Summary d={d} scenario={scenario} /> });
    return list;
  }, [d, game.state.hintsUsed, scenario, tr]);

  const next = useCallback(() => setIdx((i) => Math.min(cards.length - 1, i + 1)), [cards.length]);
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  const savePng = useCallback(async () => {
    try {
      const blob = await renderStoryPng(d, scenario.title, scenario.persona.name);
      download(blob, `deal-room-${scenario.id}.png`);
      setMsg(tr("Картинка 9:16 сохранена"));
    } catch {
      setMsg(tr("Не удалось создать картинку"));
    }
  }, [d, scenario, tr]);
  const savePdf = useCallback(() => {
    setMsg(tr("В окне печати выберите «Сохранить как PDF»"));
    window.print();
  }, [tr]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (intro) return setIntro(false);
      if (e.code === "Escape" && view !== "stories") return setView("stories");
      if (e.code === "ArrowRight" && view === "stories") next();
      else if (e.code === "ArrowLeft" && view === "stories") prev();
      else if (e.code === "KeyR") onReplay();
      else if (e.code === "KeyT") setView((v) => (v === "timeline" ? "stories" : "timeline"));
      else if (e.code === "KeyB") setView((v) => (v === "best" ? "stories" : "best"));
      else if (e.code === "KeyS") savePdf();
      else if (e.code === "KeyI") savePng();
      else if (e.code === "KeyN" || e.code === "KeyM" || (e.code === "Escape" && view === "stories")) onMenu();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [intro, view, next, prev, onReplay, onMenu, savePdf, savePng]);

  // timeline data
  const points: PulsePoint[] = useMemo(
    () => [
      { trust: scenario.initialState.trust, interest: scenario.initialState.interest, irritation: scenario.initialState.irritation },
      ...game.state.history.map((h) => ({ ...h.after, quality: h.quality })),
    ],
    [scenario, game.state.history],
  );
  const markers = useMemo(
    () => [
      ...game.state.history.filter((h) => h.quality === "weak" || h.quality === "critical_error").map((h) => ({ index: h.turn, color: "#FF4D5E" })),
      ...(d.fork ? [{ index: d.fork.turn, color: "#FFB547" }] : []),
    ],
    [game.state.history, d.fork],
  );

  const card = cards[idx];
  const color = OUTCOME_COLOR[d.outcome];

  if (intro)
    return (
      <div className="boot" onClick={() => setIntro(false)} role="button" tabIndex={0} aria-label={tr("Продолжить")}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`result-status t-display ${d.outcome}`}
        >
          {STATUS[d.outcome]}
        </motion.div>
      </div>
    );

  return (
    <>
      <div className="screen no-print" style={{ maxWidth: 860 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div className="t-display" style={{ color, fontSize: 18 }}>
            {STATUS[d.outcome]}
          </div>
          {view !== "stories" && (
            <button className="icon-btn" onClick={() => setView("stories")}>
              <ArrowLeft size={14} /> {tr("к разбору")} [Esc]
            </button>
          )}
        </div>

        {view === "stories" && (
          <>
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }} role="tablist" aria-label={tr("Карточки разбора")}>
              {cards.map((c, i) => (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={c.title}
                  onClick={() => setIdx(i)}
                  style={{ flex: 1, height: 4, border: 0, padding: 0, background: i <= idx ? card.color : "rgba(127,147,176,0.3)" }}
                />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={card.key}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, i) => (i.offset.x < -60 ? next() : i.offset.x > 60 ? prev() : undefined)}
              >
                <Panel title={card.title}>
                  <div style={{ minHeight: 220, fontSize: 16 }} aria-live="polite">
                    {card.body}
                  </div>
                </Panel>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <button className="icon-btn" onClick={prev} disabled={idx === 0} aria-label={tr("Назад")}>
                <ChevronLeft size={14} />
              </button>
              <span className="t-mono dim" style={{ fontSize: 12 }}>
                {idx + 1} / {cards.length}
              </span>
              <button className="icon-btn" onClick={next} disabled={idx === cards.length - 1} aria-label={tr("Дальше")}>
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}

        {view === "timeline" && (
          <Panel title={tr("ТАЙМЛАЙН ДИАЛОГА")}>
            <PulseChart points={points} height={220} markers={markers} />
            <div className="legend" style={{ marginTop: 6 }}>
              <span><i style={{ background: "var(--hud-red)" }} />{tr("слабый ход / ошибка")}</span>
              <span><i style={{ background: "var(--hud-gold)" }} />{tr("ключевая развилка")}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              {game.state.history.map((h) => {
                const node = getNode(scenario, h.nodeId);
                return (
                  <div className="turn" key={h.turn} style={{ borderLeft: `3px solid ${QCOLOR[h.quality]}`, paddingLeft: 10 }}>
                    <div className="dim" style={{ fontSize: 13 }}>◆ {scenario.persona.name}: {node.type === "client" ? node.text : ""}</div>
                    <div style={{ margin: "4px 0" }}>◇ «{h.choiceText}»</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <span className="t-mono dim" style={{ fontSize: 12 }}>{tr("Ход")} {h.turn}</span>
                      <span className="q-badge" style={{ color: QCOLOR[h.quality] }}>{QLABEL[h.quality]}</span>
                      <span className="t-mono" style={{ fontSize: 12 }}>
                        {tr("доверие")} {h.delta.trust >= 0 ? "+" : ""}{h.delta.trust} · {tr("интерес")} {h.delta.interest >= 0 ? "+" : ""}{h.delta.interest} · {tr("раздраж.")} {h.delta.irritation >= 0 ? "+" : ""}{h.delta.irritation}
                      </span>
                    </div>
                    <div className="dim" style={{ fontSize: 13, marginTop: 4 }}>{h.coachNote}</div>
                  </div>
                );
              })}
              <div className="turn" style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10 }}>
                <div className="dim" style={{ fontSize: 13 }}>{d.reason}</div>
              </div>
            </div>
          </Panel>
        )}

        {view === "best" && (
          <Panel title={tr("ЛУЧШИЙ ПУТЬ")}>
            {bestLocked ? (
              <div className="locked-box" style={{ fontSize: 13 }}>
                <Lock size={14} style={{ display: "inline", marginRight: 6 }} />
                {tr("На уровнях 4–5 лучший путь открывается после 2 попыток. Ваших попыток: {n}.", { n: attempts })}
              </div>
            ) : !best ? (
              <p className="dim">{tr("Оптимальный путь не найден.")}</p>
            ) : (
              <>
                <p className="dim">
                  {tr("Финал")}: <b style={{ color: OUTCOME_COLOR[best.outcome] }}>{STATUS[best.outcome]}</b> · {tr("ходов")}: {best.steps.length}
                </p>
                {best.steps.map((s, i) => (
                  <div className="turn" key={s.nodeId + s.choiceId}>
                    <div className="dim" style={{ fontSize: 13 }}>◆ {scenario.persona.name}: {s.clientText}</div>
                    <div style={{ margin: "4px 0" }}>◇ «{s.text}»</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span className="t-mono dim" style={{ fontSize: 12 }}>{tr("Ход")} {i + 1}</span>
                      <span className="q-badge" style={{ color: QCOLOR[s.quality] }}>{QLABEL[s.quality]}</span>
                      {s.technique && <span className="tag cyan">{s.technique}</span>}
                    </div>
                    <div className="dim" style={{ fontSize: 13, marginTop: 4 }}>{s.coachNote}</div>
                  </div>
                ))}
              </>
            )}
          </Panel>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <button className="btn gold" onClick={onReplay}>
            <RotateCcw size={14} style={{ display: "inline", marginRight: 6 }} />{tr("Переиграть")} [R]
          </button>
          {onLive && (
            <button className="btn" onClick={onLive}>
              {tr("Переиграть с живым клиентом (ИИ)")}
            </button>
          )}
          <button className="btn" onClick={() => setView((v) => (v === "timeline" ? "stories" : "timeline"))}>
            <LineChart size={14} style={{ display: "inline", marginRight: 6 }} />{tr("Таймлайн")} [T]
          </button>
          <button className="btn" onClick={() => setView((v) => (v === "best" ? "stories" : "best"))}>
            <GitFork size={14} style={{ display: "inline", marginRight: 6 }} />{tr("Лучший путь")} [B]
          </button>
          <button className="btn ghost" onClick={savePdf}>
            <FileDown size={14} style={{ display: "inline", marginRight: 6 }} />PDF [S]
          </button>
          <button className="btn ghost" onClick={savePng}>
            <ImageIcon size={14} style={{ display: "inline", marginRight: 6 }} />{tr("Сторис 9:16")} [I]
          </button>
          <button className="btn ghost" onClick={onMenu}>
            <Trophy size={14} style={{ display: "inline", marginRight: 6 }} />{tr("Следующий кейс")} [N]
          </button>
        </div>
        <div className="t-mono dim" style={{ fontSize: 12, marginTop: 8, minHeight: 18 }} role="status">
          {msg}
        </div>
      </div>

      <div className="print-only">
        <h1>DEAL ROOM — {tr("Разбор полётов")}</h1>
        <Summary d={d} scenario={scenario} />
      </div>
    </>
  );
}
