import { fmtTime, type Debrief } from "../engine/debrief";

const COLORS = { bg: "#05070D", cyan: "#3FE0FF", gold: "#FFB547", red: "#FF4D5E", green: "#3DFFA2", text: "#E6F1FF", dim: "#7F93B0" };
const STATUS = { sale: "SALE CLOSED", partial: "PARTIAL", lost: "MISSION FAILED" } as const;
const STATUS_COLOR = { sale: COLORS.green, partial: COLORS.gold, lost: COLORS.red } as const;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      out.push(line);
      line = w;
    } else line = test;
  }
  if (line) out.push(line);
  return out;
}

/** Renders the summary card as a 1080×1920 (9:16) PNG story image. */
export function renderStoryPng(d: Debrief, title: string, clientName: string): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  const g = ctx.createRadialGradient(W / 2, 600, 80, W / 2, 600, 1100);
  g.addColorStop(0, "#0B1B2E");
  g.addColorStop(1, COLORS.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(63,224,255,0.06)";
  for (let x = 0; x < W; x += 60) ctx.strokeRect(x, 0, 0.5, H);
  for (let y = 0; y < H; y += 60) ctx.strokeRect(0, y, W, 0.5);
  ctx.strokeStyle = "rgba(63,224,255,0.5)";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  const pad = 90;
  let y = 150;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COLORS.cyan;
  ctx.font = "500 30px 'JetBrains Mono', monospace";
  ctx.fillText("DEAL ROOM · РАЗБОР ПОЛЁТОВ", pad, y);

  y += 120;
  ctx.fillStyle = STATUS_COLOR[d.outcome];
  ctx.shadowColor = STATUS_COLOR[d.outcome];
  ctx.shadowBlur = 30;
  ctx.font = "900 96px Orbitron, 'Rajdhani', sans-serif";
  ctx.fillText(STATUS[d.outcome], pad, y);
  ctx.shadowBlur = 0;

  y += 60;
  ctx.fillStyle = COLORS.dim;
  ctx.font = "400 32px Inter, sans-serif";
  for (const l of wrap(ctx, `${title} · ${clientName}`, W - pad * 2)) {
    ctx.fillText(l, pad, y);
    y += 44;
  }

  y += 30;
  ctx.fillStyle = COLORS.gold;
  ctx.font = "700 44px Rajdhani, sans-serif";
  ctx.fillText(`Очки ${d.score.total}/${d.score.max}   ·   Ходов ${d.turns}   ·   ${fmtTime(d.durationSec)}`, pad, y);
  y += 30;

  const section = (head: string, color: string, items: string[]) => {
    if (!items.length || y > H - 200) return;
    y += 50;
    ctx.fillStyle = color;
    ctx.font = "600 34px 'JetBrains Mono', monospace";
    ctx.fillText(head, pad, y);
    y += 14;
    ctx.fillStyle = COLORS.text;
    ctx.font = "400 30px Inter, sans-serif";
    for (const it of items.slice(0, 3)) {
      for (const l of wrap(ctx, `• ${it}`, W - pad * 2).slice(0, 3)) {
        y += 42;
        if (y > H - 140) return;
        ctx.fillText(l, pad, y);
      }
      y += 8;
    }
  };
  section("✔ ЧТО БЫЛО ХОРОШО", COLORS.green, d.good);
  section("✘ ЧТО БЫЛО ПЛОХО", COLORS.red, d.bad);
  section("↗ ТОЧКИ РОСТА", COLORS.gold, d.growth);
  if (d.score.riskyWin) section("⚠ ВНИМАНИЕ", COLORS.red, ["Продажа с риском возврата или жалобы"]);

  ctx.fillStyle = COLORS.dim;
  ctx.font = "400 26px 'JetBrains Mono', monospace";
  ctx.fillText("deal-room · тренажёр продаж", pad, H - 90);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}

export function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
