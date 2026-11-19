import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Flame, Lock, Target } from "lucide-react";
import type { Scenario } from "../engine/types";
import {
  ACHIEVEMENTS, fmtOutcome, levelStats, rankFor, recommend, streakDays, tagStats, totalPoints, unlockedAchievements,
  type SessionRecord,
} from "../engine/profile";
import { TAG_LABEL } from "../content/data/beats";
import { Panel } from "./parts";
import { AuthPanel } from "../features/account/AuthPanel";
import type { AuthState } from "../features/account/useAuth";

const LEVELS = ["Стажёр", "Новичок", "Практик", "Профи", "Акула"];
const OUT_COLOR = { sale: "var(--hud-green)", partial: "var(--hud-gold)", lost: "var(--hud-red)" } as const;

/** Radar of success rate per objection tag (outer ring = 100% good answers). */
function WeakRadar({ stats }: { stats: ReturnType<typeof tagStats> }) {
  const items = [...stats].sort((a, b) => b.attempts - a.attempts).slice(0, 8);
  if (items.length < 3)
    return <p className="dim" style={{ fontSize: 13 }}>Сыграйте ещё пару кейсов: карта слабых мест строится по вашим ответам на возражения (нужно минимум три разных возражения).</p>;
  const R = 90;
  const c = 130;
  const pts = items.map((t, i) => {
    const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
    const v = 1 - t.failRate;
    const side: "start" | "end" | "middle" = Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
    return { t, a, side, x: c + Math.cos(a) * R * v, y: c + Math.sin(a) * R * v, lx: c + Math.cos(a) * (R + 10), ly: c + Math.sin(a) * (R + 12) + 3 };
  });
  return (
    <>
      <svg viewBox="-90 0 440 260" style={{ width: "100%", maxWidth: 480, display: "block", margin: "0 auto" }} role="img" aria-label={`Карта слабых мест: ${items.map((t) => `${TAG_LABEL[t.tag] ?? t.tag} ${Math.round((1 - t.failRate) * 100)}%`).join(", ")}`}>
        {[0.25, 0.5, 0.75, 1].map((k) => (
          <circle key={k} cx={c} cy={c} r={R * k} fill="none" stroke="rgba(63,224,255,0.18)" strokeDasharray={k === 1 ? undefined : "2 4"} />
        ))}
        {pts.map((p) => (
          <line key={p.t.tag} x1={c} y1={c} x2={c + Math.cos(p.a) * R} y2={c + Math.sin(p.a) * R} stroke="rgba(63,224,255,0.15)" />
        ))}
        <motion.polygon
          points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(63,224,255,0.22)"
          stroke="#3fe0ff"
          strokeWidth={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        {pts.map((p) => (
          <g key={p.t.tag}>
            <circle cx={p.x} cy={p.y} r={3.5} fill={p.t.failRate > 0.5 ? "#ff4d5e" : "#3dffa2"} />
            <text x={p.lx} y={p.ly} textAnchor={p.side} fontSize={8} fill="#a9bbd6" fontFamily="JetBrains Mono">
              {(TAG_LABEL[p.t.tag] ?? p.t.tag).replace(/[«»]/g, "").slice(0, 26)}
            </text>
          </g>
        ))}
      </svg>
      <div className="legend" style={{ justifyContent: "center" }}>
        <span>центр = часто ошибаетесь, край = отвечаете хорошо</span>
      </div>
    </>
  );
}

export function Profile({
  records,
  scenarios,
  auth,
  syncNote,
  onBack,
  onOpenCase,
}: {
  records: SessionRecord[];
  scenarios: Scenario[];
  auth: AuthState;
  syncNote: string;
  onBack: () => void;
  onOpenCase: (id: string) => void;
}) {
  const points = totalPoints(records);
  const rank = rankFor(points);
  const levels = useMemo(() => levelStats(records), [records]);
  const tags = useMemo(() => tagStats(records, scenarios), [records, scenarios]);
  const recs = useMemo(() => recommend(records, scenarios), [records, scenarios]);
  const unlocked = useMemo(() => new Set(unlockedAchievements(records)), [records]);
  const byId = useMemo(() => new Map(scenarios.map((s) => [s.id, s])), [scenarios]);
  const history = useMemo(() => [...records].reverse().slice(0, 15), [records]);
  const streak = streakDays(records);

  return (
    <div className="screen" style={{ maxWidth: 980 }}>
      <button className="icon-btn" onClick={onBack}>
        <ArrowLeft size={14} /> меню
      </button>

      <div className="menu-grid" style={{ marginTop: 12 }}>
        <div className="col">
          <Panel title="ЗВАНИЕ">
            <div className="t-display" style={{ fontSize: 30, color: "var(--hud-gold)", textShadow: "0 0 18px rgba(255,181,71,0.5)" }}>{rank.name}</div>
            <div className="t-mono" style={{ fontSize: 13, margin: "6px 0" }}>
              Очки: <b>{points}</b> · Игр: {records.length} · <Flame size={12} style={{ display: "inline" }} /> серия {streak} дн.
            </div>
            <div role="progressbar" aria-valuenow={Math.round(rank.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Прогресс до следующего звания" style={{ height: 6, background: "rgba(127,147,176,0.25)" }}>
              <motion.div style={{ height: "100%", background: "var(--hud-gold)", boxShadow: "0 0 8px var(--hud-gold)" }} initial={false} animate={{ width: `${rank.progress * 100}%` }} />
            </div>
            <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>{rank.next ? `До ${rank.next}: ${rank.toNext} очков` : "Максимальное звание"}</div>
          </Panel>

          <Panel title="АККАУНТ">
            <AuthPanel auth={auth} syncNote={syncNote} />
          </Panel>

          <Panel title="ПОБЕДЫ ПО УРОВНЯМ">
            {levels.map((l) => (
              <div key={l.level} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <span className="t-ui" style={{ width: 128, whiteSpace: "nowrap" }}>{l.level} · {LEVELS[l.level - 1]}</span>
                <div style={{ flex: 1, height: 6, background: "rgba(127,147,176,0.25)" }}>
                  <div style={{ width: `${l.winRate * 100}%`, height: "100%", background: "var(--hud-green)" }} />
                </div>
                <span className="t-mono" style={{ fontSize: 11, width: 74, textAlign: "right" }}>{l.sale}/{l.played} · {Math.round(l.winRate * 100)}%</span>
              </div>
            ))}
          </Panel>
        </div>

        <div className="col">
          <Panel title="КАРТА СЛАБЫХ МЕСТ">
            <WeakRadar stats={tags} />
          </Panel>

          <Panel title="РЕКОМЕНДАЦИИ">
            {recs.length === 0 ? (
              <p className="dim" style={{ fontSize: 13 }}>Пока нечего советовать: сыграйте несколько кейсов, и здесь появятся возражения, которые стоит потренировать.</p>
            ) : (
              recs.map((r) => (
                <div key={r.tag} style={{ marginBottom: 10 }}>
                  <div className="t-ui" style={{ color: "var(--hud-gold)" }}>
                    <Target size={12} style={{ display: "inline", marginRight: 6 }} />
                    Потренируйте {TAG_LABEL[r.tag] ?? r.tag} — ошибок {Math.round(r.failRate * 100)}%
                  </div>
                  <div className="case-list" style={{ maxHeight: "none", marginTop: 6 }}>
                    {r.cases.map((s) => (
                      <button key={s.id} className="case-row" onClick={() => onOpenCase(s.id)}>
                        <span className="dot" style={{ background: "#3fe0ff" }} aria-hidden />
                        <span style={{ flex: 1 }}>
                          <span className="t-ui" style={{ display: "block" }}>{s.title}</span>
                          <span className="dim" style={{ fontSize: 12 }}>уровень {s.level} · {s.persona.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>

      <Panel title="ДОСТИЖЕНИЯ" className="">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.has(a.key);
            return (
              <div key={a.key} style={{ padding: 8, border: `1px solid ${on ? "var(--hud-gold)" : "var(--panel-border)"}`, opacity: on ? 1 : 0.55 }}>
                <div className="t-ui" style={{ color: on ? "var(--hud-gold)" : undefined }}>
                  {on ? <Award size={12} style={{ display: "inline", marginRight: 6 }} /> : <Lock size={12} style={{ display: "inline", marginRight: 6 }} />}
                  {a.title}
                </div>
                <div className="dim" style={{ fontSize: 12 }}>{a.description}</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div style={{ height: 12 }} />
      <Panel title="ИСТОРИЯ ИГР">
        {history.length === 0 ? (
          <p className="dim" style={{ fontSize: 13 }}>Здесь появятся ваши игры.</p>
        ) : (
          history.map((r) => {
            const isLive = r.scenarioId.startsWith("live:");
            const s = byId.get(isLive ? r.scenarioId.slice(5) : r.scenarioId);
            return (
              <div className="turn" key={r.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span className="q-badge" style={{ color: OUT_COLOR[r.outcome] }}>{fmtOutcome(r.outcome)}</span>
                <span style={{ flex: 1, minWidth: 160 }}>{s ? s.title : r.scenarioId} <span className="dim" style={{ fontSize: 12 }}>· ур. {r.level}{isLive ? " · живой клиент (ИИ)" : ""}</span></span>
                <span className="t-mono dim" style={{ fontSize: 11 }}>{r.score} очк · {r.turns} ходов · {new Date(r.at).toLocaleDateString("ru-RU")}</span>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}
