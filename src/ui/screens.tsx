import { useEffect } from "react";
import { ArrowLeft, Phone, Target } from "lucide-react";
import type { Scenario } from "../engine/types";
import { useI18n } from "../i18n";
import { Panel } from "./parts";
import { CHANNEL_LABEL } from "./labels";

/* ---------------- Briefing ---------------- */
export type LiveAccess = "ok" | "login" | "off";

export function Briefing({
  scenario,
  onBack,
  onStart,
  live,
  onLive,
}: {
  scenario: Scenario;
  onBack: () => void;
  onStart: () => void;
  live: LiveAccess;
  onLive: () => void;
}) {
  const { tr } = useI18n();
  const p = scenario.persona;
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter") onStart();
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onStart, onBack]);
  return (
    <div className="screen" style={{ maxWidth: 760 }}>
      <button className="icon-btn" onClick={onBack}>
        <ArrowLeft size={14} /> {tr("меню")}
      </button>
      <Panel title={tr("БРИФИНГ МИССИИ")} className="">
        <h1 style={{ marginTop: 4, marginBottom: 0 }} className="t-display">
          <span style={{ fontSize: 22 }}>{scenario.title}</span>
        </h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 14px" }}>
          <span className="tag cyan">{tr("УРОВЕНЬ {n}", { n: scenario.level })}</span>
          <span className="tag">
            <Phone size={10} style={{ display: "inline" }} /> {tr(CHANNEL_LABEL[scenario.channel]).toUpperCase()}
          </span>
          <span className="tag gold">{tr("~{n} ХОДОВ", { n: scenario.estimatedTurns })}</span>
        </div>
        <p>{scenario.briefing}</p>
        <div style={{ margin: "14px 0" }}>
          <div className="dossier-row">
            <span className="dim">{tr("Клиент")}</span>
            <span>
              {p.name}, {p.age}, {p.profession}
            </span>
          </div>
          <div className="dossier-row">
            <span className="dim">{tr("Психотип")}</span>
            <span>{p.psychotype}</span>
          </div>
          <div className="dossier-row">
            <span className="dim">{tr("Известная боль")}</span>
            <span style={{ textAlign: "right" }}>{p.pain}</span>
          </div>
          <div className="dossier-row">
            <span className="dim">
              <Target size={12} style={{ display: "inline" }} /> {tr("Цель")}
            </span>
            <span>{tr("оформить членство или договориться о следующем шаге")}</span>
          </div>
          <div className="locked-box">{tr("▓ СКРЫТЫЙ МОТИВ — ЗАБЛОКИРОВАНО (откроется в разборе)")}</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn gold" onClick={onStart}>
            {tr("Начать диалог")} <span className="t-mono" style={{ opacity: 0.7 }}>[Enter]</span>
          </button>
          <button className="btn" onClick={onLive} disabled={live !== "ok"} title={tr("Свободный текст, ответы генерирует ИИ")}>
            {tr("Живой клиент (ИИ)")}
          </button>
        </div>
        {live !== "ok" && (
          <div className="dim" style={{ fontSize: 12, marginTop: 8 }}>
            {live === "login"
              ? tr("Живой режим (ИИ) доступен после входа в аккаунт: откройте Профиль.")
              : tr("Живой режим (ИИ) требует облака: подключите Supabase (см. README).")}
          </div>
        )}
      </Panel>
    </div>
  );
}
