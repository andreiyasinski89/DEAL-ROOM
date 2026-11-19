import { useCallback, useEffect, useState } from "react";
import { T, useI18n } from "../i18n";

export type TourStep = { target?: string; title: string; text: string };

/** The guided tour of the deal screen (Russian keys, rendered with tr()). */
export const TOUR_STEPS: TourStep[] = [
  { target: "dialog", title: T("ДИАЛОГ"), text: T("Здесь идёт разговор. Реплики клиента печатаются по символам; клик или пробел пропускает печать.") },
  { target: "dossier", title: T("ДОСЬЕ"), text: T("Кто клиент, его тип и эмоция. Скрытый мотив откроется только в разборе.") },
  { target: "pulse", title: T("ПУЛЬС СДЕЛКИ"), text: T("Три линии по ходам: доверие, интерес и раздражение. Точки на линии показывают качество вашего ответа.") },
  { target: "telemetry", title: T("ТЕЛЕМЕТРИЯ"), text: T("Текущие значения и вероятность сделки. Если раздражение доходит до предела, клиент уходит.") },
  { target: "choices", title: T("ВАРИАНТЫ ОТВЕТА"), text: T("Выберите ответ мышью, касанием или клавишами 1–4. Самый длинный или самый вежливый вариант не всегда лучший.") },
  { target: "hint", title: T("ПОДСКАЗКА"), text: T("Кнопка H даёт намёк, но стоит 10 очков. Без подсказок результат выше.") },
  { title: T("ЦЕЛЬ"), text: T("Ведите клиента к честной продаже или к конкретному следующему шагу. Не обещайте доход, окупаемость и возврат: это критическая ошибка.") },
];

type Box = { x: number; y: number; w: number; h: number };

const find = (t?: string): Box | null => {
  if (!t) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${t}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

export function Tour({ onDone }: { onDone: () => void }) {
  const { tr } = useI18n();
  const [i, setI] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const step = TOUR_STEPS[i];
  const last = i === TOUR_STEPS.length - 1;

  const next = useCallback(() => (last ? onDone() : setI((v) => v + 1)), [last, onDone]);

  const measure = useCallback(() => setBox(find(step.target)), [step.target]);
  useEffect(() => {
    const raf = requestAnimationFrame(measure); // measured after paint, not inside the effect body
    window.addEventListener("resize", measure);
    const id = setInterval(measure, 400); // the answer cards appear a moment after the client has spoken
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      clearInterval(id);
    };
  }, [measure]);

  // the tour owns the keyboard while it is open (the game must not react to the same keys)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (["Enter", "Space", "ArrowRight"].includes(e.code)) next();
      else if (e.code === "Escape") onDone();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [next, onDone]);

  const below = box ? box.y + box.h + 180 < window.innerHeight : true;
  const tip: React.CSSProperties = box
    ? {
        left: Math.min(Math.max(12, box.x), Math.max(12, window.innerWidth - 332)),
        ...(below ? { top: box.y + box.h + 12 } : { top: Math.max(12, box.y - 168) }),
      }
    : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label={tr("Обучение")}>
      {box ? (
        <div className="tour-spot" style={{ left: box.x - 6, top: box.y - 6, width: box.w + 12, height: box.h + 12 }} />
      ) : (
        <div className="tour-dim" />
      )}
      <div className="tour-tip panel" style={tip}>
        <div className="panel-title">{tr(step.title)}</div>
        <p style={{ margin: "0 0 10px", fontSize: 14 }}>{tr(step.text)}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="t-mono dim" style={{ fontSize: 11, flex: 1 }}>
            {i + 1} / {TOUR_STEPS.length}
          </span>
          <button className="btn ghost" onClick={onDone}>{tr("Пропустить")}</button>
          <button className="btn gold" onClick={next} autoFocus>{last ? tr("Начать") : tr("Далее")}</button>
        </div>
      </div>
    </div>
  );
}
