import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Mood, Quality } from "../engine/types";
import { T, useI18n } from "../i18n";

export function Panel({ title, children, className = "", tour }: { title?: string; children: ReactNode; className?: string; tour?: string }) {
  return (
    <section className={`panel ${className}`} data-tour={tour}>
      {title && <div className="panel-title">{title}</div>}
      {children}
    </section>
  );
}

/* ---------------- Gauge ---------------- */
const R = 26;
const C = 2 * Math.PI * R;

export function Gauge({
  label,
  value,
  color,
  delta,
  deltaKey,
  invert = false,
}: {
  label: string;
  value: number;
  color: string;
  delta: number;
  deltaKey: number;
  /** For scales where a rise is bad (irritation). */
  invert?: boolean;
}) {
  const ticks = Array.from({ length: 20 }, (_, i) => i);
  return (
    <div className="gauge" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <svg viewBox="0 0 64 64" aria-hidden>
        {ticks.map((i) => {
          const a = (i / 20) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={32 + Math.cos(a) * 29}
              y1={32 + Math.sin(a) * 29}
              x2={32 + Math.cos(a) * 31}
              y2={32 + Math.sin(a) * 31}
              stroke="rgba(127,147,176,0.5)"
              strokeWidth={1}
            />
          );
        })}
        <circle cx={32} cy={32} r={R} fill="none" stroke="rgba(127,147,176,0.2)" strokeWidth={4} />
        <motion.circle
          cx={32}
          cy={32}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="butt"
          strokeDasharray={C}
          transform="rotate(-90 32 32)"
          initial={false}
          animate={{ strokeDashoffset: C * (1 - value / 100) }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div>
        <div className="g-label">{label}</div>
        <div className="g-val" style={{ color }}>
          {value}
        </div>
      </div>
      <AnimatePresence>
        {delta !== 0 && (
          <motion.span
            key={deltaKey}
            className="gauge-delta"
            style={{ color: delta > 0 === !invert ? "var(--hud-green)" : "var(--hud-red)" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: -4 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {delta > 0 ? `+${delta}` : delta}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Pulse chart ---------------- */
export type PulsePoint = { trust: number; interest: number; irritation: number; quality?: Quality };

const QCOLOR: Record<Quality, string> = {
  excellent: "var(--hud-green)",
  good: "var(--hud-green)",
  neutral: "var(--text-dim)",
  weak: "var(--hud-gold)",
  critical_error: "var(--hud-red)",
};

export function PulseChart({
  points,
  height = 120,
  markers = [],
}: {
  points: PulsePoint[];
  height?: number;
  /** Vertical marker lines at point indices (e.g. key forks). */
  markers?: { index: number; color: string }[];
}) {
  const { tr } = useI18n();
  const W = 300;
  const H = 120;
  const pad = 8;
  const steps = Math.max(6, points.length - 1);
  const x = (i: number) => pad + (i / steps) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / 100) * (H - pad * 2);
  const path = (k: "trust" | "interest" | "irritation") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const series = [
    ["trust", "var(--hud-cyan)", T("доверие")],
    ["interest", "var(--hud-gold)", T("интерес")],
    ["irritation", "var(--hud-red)", T("раздраж.")],
  ] as const;
  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="pulse-svg"
        style={{ height }}
        preserveAspectRatio="none"
        role="img"
        aria-label={tr("Пульс сделки: доверие {a}, интерес {b}, раздражение {c}", { a: last.trust, b: last.interest, c: last.irritation })}
      >
        {[0, 50, 100].map((v) => (
          <line key={v} x1={0} x2={W} y1={y(v)} y2={y(v)} stroke="rgba(120,200,255,0.12)" strokeDasharray="3 4" />
        ))}
        {markers.map((m) => (
          <line key={`${m.index}-${m.color}`} x1={x(m.index)} x2={x(m.index)} y1={0} y2={H} stroke={m.color} strokeOpacity={0.55} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        ))}
        {series.map(([k, color]) => (
          <motion.path
            key={`${k}-${points.length}`}
            d={path(k)}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
        {points.map((p, i) =>
          p.quality || i === 0 ? (
            <circle key={i} cx={x(i)} cy={y(p.trust)} r={i === points.length - 1 ? 4 : 2.5} fill={p.quality ? QCOLOR[p.quality] : "var(--hud-cyan)"}>
              {i === points.length - 1 && <animate attributeName="r" values="3;6;3" dur="1.4s" repeatCount="indefinite" />}
            </circle>
          ) : null,
        )}
      </svg>
      <div className="legend">
        {series.map(([k, color, name]) => (
          <span key={k}>
            <i style={{ background: color }} />
            {tr(name)} {last[k]}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Avatar ---------------- */
const MOOD_LABEL: Record<Mood, string> = {
  neutral: T("нейтральный настрой"),
  interested: T("интерес"),
  doubtful: T("сомнение"),
  irritated: T("раздражение"),
  warm: T("тепло"),
  reset: T("ищет кнопку сброса"),
};
const MOOD_COLOR: Record<Mood, string> = {
  neutral: "#3fe0ff",
  interested: "#ffb547",
  doubtful: "#3fe0ff",
  irritated: "#ff4d5e",
  warm: "#3dffa2",
  reset: "#ff4d5e",
};
const MOUTH: Record<Mood, string> = {
  neutral: "M44 78 L66 78",
  interested: "M44 77 Q55 83 66 77",
  doubtful: "M44 80 Q55 74 66 80",
  irritated: "M44 82 Q55 74 66 82",
  warm: "M42 76 Q55 88 68 76",
  reset: "M44 82 L66 80",
};
const BROW: Record<Mood, [string, string]> = {
  neutral: ["M38 48 L50 48", "M60 48 L72 48"],
  interested: ["M38 46 L50 47", "M60 47 L72 46"],
  doubtful: ["M38 49 L50 46", "M60 48 L72 48"],
  irritated: ["M38 44 L50 49", "M60 49 L72 44"],
  warm: ["M38 47 Q44 45 50 47", "M60 47 Q66 45 72 47"],
  reset: ["M38 44 L50 50", "M60 50 L72 44"],
};

export function moodLabel(m: Mood) {
  return MOOD_LABEL[m];
}

export function Avatar({ mood }: { mood: Mood }) {
  const { tr } = useI18n();
  const [glitch, setGlitch] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setGlitch(true);
    const t = setTimeout(() => setGlitch(false), 120);
    return () => clearTimeout(t);
  }, [mood]);
  const c = MOOD_COLOR[mood];
  return (
    <div className={`avatar-wrap ${glitch ? "glitch" : ""}`} role="img" aria-label={`${tr("Клиент")}: ${tr(MOOD_LABEL[mood])}`}>
      <svg viewBox="0 0 110 110" width="100%" height="100%">
        <defs>
          <linearGradient id="av-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} stopOpacity="0.28" />
            <stop offset="1" stopColor={c} stopOpacity="0.04" />
          </linearGradient>
          <pattern id="av-scan" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="1" fill={c} opacity="0.18" />
          </pattern>
        </defs>
        <circle cx="55" cy="55" r="52" fill="none" stroke={c} strokeOpacity="0.35" strokeDasharray="2 5" />
        <path d="M14 108 Q16 88 55 88 Q94 88 96 108 Z" fill="url(#av-fill)" stroke={c} strokeOpacity="0.8" />
        <ellipse cx="55" cy="58" rx="24" ry="30" fill="url(#av-fill)" stroke={c} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 5px ${c})` }} />
        <ellipse cx="55" cy="58" rx="24" ry="30" fill="url(#av-scan)" />
        <path d="M30 52 Q30 24 55 24 Q80 24 80 52 Q70 36 55 36 Q40 36 30 52Z" fill={c} fillOpacity="0.2" stroke={c} strokeOpacity="0.7" />
        <path d={BROW[mood][0]} stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d={BROW[mood][1]} stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="57" r="2.6" fill={c} />
        <circle cx="66" cy="57" r="2.6" fill={c} />
        <path d={MOUTH[mood]} stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ---------------- Typewriter ---------------- */
export function useTypewriter(text: string, enabled: boolean, skipTick: number, onDone: () => void) {
  const [base] = useState(skipTick); // skips that happened before this message appeared don't count
  const [prog, setProg] = useState({ text, n: 0 });
  const n = prog.text === text ? prog.n : 0;
  const finished = !enabled || skipTick > base || n >= text.length;

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setProg((s) => ({ text, n: (s.text === text ? s.n : 0) + 1 })), 20);
    return () => clearInterval(id);
  }, [text, finished]);

  const cb = useRef(onDone);
  useEffect(() => {
    cb.current = onDone;
  });
  useEffect(() => {
    if (finished) cb.current();
  }, [finished]);

  return finished ? text : text.slice(0, n);
}

export function TypedText({
  text,
  animate,
  skipTick,
  onDone,
}: {
  text: string;
  animate: boolean;
  skipTick: number;
  onDone: () => void;
}) {
  const shown = useTypewriter(text, animate, skipTick, onDone);
  return <span className={shown.length < text.length ? "caret" : ""}>{shown}</span>;
}
