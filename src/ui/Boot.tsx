import { useEffect, useState } from "react";
import { T, useI18n } from "../i18n";

const BOOT_LINES = [T("ИНИЦИАЛИЗАЦИЯ DEAL ROOM…"), T("ЗАГРУЗКА ПРОФИЛЯ…"), T("КАЛИБРОВКА ШКАЛ ДОВЕРИЯ…"), T("ГОТОВ")];

export function Boot({ onDone }: { onDone: () => void }) {
  const { tr } = useI18n();
  const [n, setN] = useState(1);
  useEffect(() => {
    if (n > BOOT_LINES.length) {
      const t = setTimeout(onDone, 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((v) => v + 1), 380);
    return () => clearTimeout(t);
  }, [n, onDone]);
  useEffect(() => {
    const h = () => onDone();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onDone]);
  return (
    <div className="boot" onClick={onDone} role="button" tabIndex={0} aria-label={tr("Пропустить загрузку")}>
      <div>
        <div className="logo t-display">
          DEAL<b>ROOM</b>
        </div>
        <div className="boot-lines" style={{ marginTop: 20 }}>
          {BOOT_LINES.slice(0, n).map((l, i) => (
            <div key={l} className={i === BOOT_LINES.length - 1 ? "ok" : ""}>
              {i === BOOT_LINES.length - 1 ? "✔ " : "› "}
              {tr(l)}
            </div>
          ))}
        </div>
        <div className="boot-bar">
          <i />
        </div>
        <div className="dim t-mono" style={{ fontSize: 11, marginTop: 10 }}>
          {tr("нажмите любую клавишу, чтобы пропустить")}
        </div>
      </div>
    </div>
  );
}

