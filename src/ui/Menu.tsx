import { useMemo, useState } from "react";
import { Bot, Flame, GraduationCap, Lock, User, Users } from "lucide-react";
import type { Scenario } from "../engine/types";
import { LANGS, LOCALE, T, useI18n } from "../i18n";
import { Panel } from "./parts";
import { CHANNEL_LABEL } from "./labels";
import { nextResetLocal, quotaTone, type Quota } from "../live/quota";
import { isLevelUnlocked, UNLOCK_N, type Progress } from "./progress";

const LEVELS = [T("Стажёр"), T("Новичок"), T("Практик"), T("Профи"), T("Акула")];
const OUTCOME_COLOR = { sale: "#3dffa2", partial: "#ffb547", lost: "#ff4d5e" } as const;
const OUTCOME_RU = { sale: T("ПРОДАЖА"), partial: T("ЧАСТИЧНО"), lost: T("ПРОВАЛ") } as const;
const NICHE_RU: Record<string, string> = {
  member_elite: T("Elite"), member_turbo: T("Turbo"), recruiting: T("Бизнес и сеть"), cold: T("Холодный контакт"),
  repeat: T("Действующий клиент"), family: T("Семья"), business: T("Предприниматель"), social: T("Соцсети"),
};

export function Menu({
  scenarios,
  progress,
  free,
  fx,
  onFx,
  onFree,
  onSelect,
  daily,
  dailyDone,
  streak,
  rank,
  onProfile,
  onTeam,
  sound,
  onSound,
  onTutorial,
  quota,
}: {
  scenarios: Scenario[];
  progress: Progress;
  free: boolean;
  fx: boolean;
  onFx: (v: boolean) => void;
  onFree: (v: boolean) => void;
  onSelect: (id: string) => void;
  daily: Scenario;
  dailyDone: boolean;
  streak: number;
  rank: string;
  onProfile: () => void;
  onTeam: () => void;
  sound: boolean;
  onSound: (v: boolean) => void;
  onTutorial: () => void;
  /** Remaining live (AI) games today; null when signed out or not available. */
  quota: Quota | null;
}) {
  const { tr, lang, setLang } = useI18n();
  // start on the highest unlocked level that still has unplayed cases
  const [level, setLevel] = useState<number>(() => {
    for (let l = 5; l >= 1; l--)
      if (isLevelUnlocked(l, scenarios, progress, free) && scenarios.some((s) => s.level === l && !progress[s.id])) return l;
    return 1;
  });
  const list = scenarios.filter((s) => s.level === level);
  const unlocked = isLevelUnlocked(level, scenarios, progress, free);
  const done = scenarios.filter((s) => progress[s.id]).length;

  const dots = useMemo(
    () =>
      scenarios.map((s) => {
        const same = scenarios.filter((x) => x.level === s.level);
        const a = (same.indexOf(s) / same.length) * Math.PI * 2 + s.level * 0.7 - Math.PI / 2;
        const r = 36 + (s.level - 1) * 38;
        return { s, x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r };
      }),
    [scenarios],
  );

  return (
    <div className="screen">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="logo t-display" style={{ fontSize: 26 }}>
          DEAL<b>ROOM</b>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button className="icon-btn" onClick={onTutorial}>
            <GraduationCap size={12} /> {tr("Как играть")}
          </button>
          <button className="icon-btn" onClick={onTeam}>
            <Users size={12} /> {tr("Команда")}
          </button>
          <button className="icon-btn" onClick={onProfile}>
            <User size={12} /> {tr("Профиль")} · {rank}
          </button>
          {quota && (
            <span
              className={`tag quota ${quotaTone(quota)}`}
              role="status"
              title={tr("Живых игр с ИИ осталось сегодня: {left} из {max}. Обновится в {time}.", { left: quota.sessionsLeft, max: quota.sessionsMax, time: nextResetLocal(new Date(), LOCALE[lang]) })}
              aria-label={tr("Живых игр с ИИ осталось сегодня: {left} из {max}. Обновится в {time}.", { left: quota.sessionsLeft, max: quota.sessionsMax, time: nextResetLocal(new Date(), LOCALE[lang]) })}
            >
              <Bot size={11} aria-hidden /> {quota.sessionsLeft}/{quota.sessionsMax}
            </span>
          )}
          <span className="tag cyan">
            {tr("ПРОЙДЕНО")} {done}/{scenarios.length}
          </span>
          <label className="icon-btn" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={free} onChange={(e) => onFree(e.target.checked)} /> {tr("свободная игра")}
          </label>
          <label className="icon-btn" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={!fx} onChange={(e) => onFx(!e.target.checked)} /> {tr("без эффектов")}
          </label>
          <label className="icon-btn" style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={sound} onChange={(e) => onSound(e.target.checked)} /> {tr("звук")}
          </label>
          <div role="group" aria-label={tr("Язык")} style={{ display: "flex", gap: 2 }}>
            {LANGS.map((l) => (
              <button key={l.code} className={`icon-btn ${lang === l.code ? "active" : ""}`} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="menu-grid">
        <Panel title={tr("КАРТА МИССИЙ")}>
          <svg viewBox="0 0 400 400" className="radar" role="group" aria-label={tr("Радар миссий: уровни как кольца, кейсы как точки")}>
            {LEVELS.map((name, i) => (
              <g key={name}>
                <circle
                  cx={200}
                  cy={200}
                  r={36 + i * 38}
                  fill="none"
                  stroke={i + 1 === level ? "rgba(63,224,255,0.6)" : "rgba(63,224,255,0.2)"}
                  strokeDasharray={i + 1 === level ? undefined : "3 5"}
                />
                <text x={200} y={200 - (36 + i * 38) + 12} textAnchor="middle" fontSize={9} fill="#7f93b0" fontFamily="JetBrains Mono">
                  {i + 1} · {tr(name).toUpperCase()}
                </text>
              </g>
            ))}
            <line x1={200} y1={10} x2={200} y2={390} stroke="rgba(63,224,255,0.12)" />
            <line x1={10} y1={200} x2={390} y2={200} stroke="rgba(63,224,255,0.12)" />
            <g className="radar-sweep">
              <path d="M200 200 L200 20 A180 180 0 0 1 270 33 Z" fill="rgba(63,224,255,0.12)" />
              <line x1={200} y1={200} x2={200} y2={20} stroke="#3fe0ff" strokeOpacity={0.7} />
            </g>
            {dots.map(({ s, x, y }) => {
              const open = isLevelUnlocked(s.level, scenarios, progress, free);
              const res = progress[s.id];
              const c = res ? OUTCOME_COLOR[res] : "#3fe0ff";
              return (
                <g
                  key={s.id}
                  className={open ? "radar-dot" : undefined}
                  tabIndex={open ? 0 : -1}
                  role="button"
                  aria-disabled={!open}
                  aria-label={tr("{title}, уровень {n}", { title: s.title, n: s.level })}
                  onClick={() => open && onSelect(s.id)}
                  onKeyDown={(e) => open && (e.key === "Enter" || e.key === " ") && onSelect(s.id)}
                  opacity={open ? 1 : 0.25}
                >
                  <title>{`${s.title} · ${tr(NICHE_RU[s.niche])}`}</title>
                  <circle cx={x} cy={y} r={9} fill="transparent" />
                  <circle cx={x} cy={y} r={3.5} fill={c} style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
                  {res === "lost" && <circle cx={x} cy={y} r={6} fill="none" stroke={c} />}
                </g>
              );
            })}
          </svg>
          <div className="legend" style={{ justifyContent: "center", marginTop: 6 }}>
            <span><i style={{ background: "#3fe0ff" }} />{tr("новый")}</span>
            <span><i style={{ background: "#3dffa2" }} />{tr("продажа")}</span>
            <span><i style={{ background: "#ffb547" }} />{tr("частично")}</span>
            <span><i style={{ background: "#ff4d5e" }} />{tr("провал")}</span>
          </div>
        </Panel>

        <Panel title={tr("МИССИИ")}>
          <button
            className="case-row"
            style={{ width: "100%", marginBottom: 10, borderColor: dailyDone ? "var(--panel-border)" : "var(--hud-gold)" }}
            onClick={() => onSelect(daily.id)}
          >
            <Flame size={16} color={dailyDone ? "#7f93b0" : "#ffb547"} aria-hidden />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="t-ui" style={{ display: "block", color: dailyDone ? undefined : "var(--hud-gold)" }}>
                {tr("Кейс дня")}: {daily.title}
              </span>
              <span className="dim" style={{ fontSize: 12 }}>
                {tr("уровень")} {daily.level} · {daily.persona.name}, {daily.persona.profession}
              </span>
            </span>
            <span className="t-mono" style={{ fontSize: 11 }}>{dailyDone ? tr("СЫГРАН") : `${tr("СЕРИЯ")} ${streak}`}</span>
          </button>
          <div role="tablist" aria-label={tr("Уровни")} style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
            {LEVELS.map((name, i) => {
              const l = i + 1;
              const open = isLevelUnlocked(l, scenarios, progress, free);
              return (
                <button key={name} role="tab" aria-selected={l === level} className={`icon-btn ${l === level ? "active" : ""}`} onClick={() => setLevel(l)}>
                  {open ? l : <Lock size={11} />} {tr(name)}
                </button>
              );
            })}
          </div>
          {!unlocked && (
            <div className="locked-box" style={{ marginBottom: 8 }}>
              {tr("ЗАБЛОКИРОВАНО: пройдите {n} кейса уровня {prev} (продажа или частичный итог) или включите «свободная игра».", { n: UNLOCK_N, prev: level - 1 })}
            </div>
          )}
          <div className="case-list" style={{ opacity: unlocked ? 1 : 0.4 }}>
            {list.map((s) => {
              const res = progress[s.id];
              return (
                <button key={s.id} className="case-row" disabled={!unlocked} onClick={() => onSelect(s.id)}>
                  <span className="dot" style={{ background: res ? OUTCOME_COLOR[res] : "#3fe0ff" }} aria-hidden />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="t-ui" style={{ display: "block" }}>{s.title}</span>
                    <span className="dim" style={{ fontSize: 12 }}>
                      {s.persona.name}, {s.persona.profession} · {tr(NICHE_RU[s.niche])} · {tr(CHANNEL_LABEL[s.channel])}
                    </span>
                  </span>
                  <span className="t-mono dim" style={{ fontSize: 11 }}>{res ? tr(OUTCOME_RU[res]) : ""}</span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
