// Generates the PWA icons (PNG) without any image library: HUD-style ring on a dark background.
// Run: node scripts/make-icons.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** size px square; safe = fraction of the canvas the artwork may use (maskable icons need ~0.62). */
function png(size, safe = 1) {
  const bg = [5, 7, 13];
  const cyan = [63, 224, 255];
  const gold = [255, 181, 71];
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const aa = 1.5 / size;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      // coordinates in [-1, 1], scaled so the artwork fits the safe zone
      const px = (((x + 0.5) / size) * 2 - 1) / safe;
      const py = (((y + 0.5) / size) * 2 - 1) / safe;
      const r = Math.hypot(px, py);
      let col = mix(bg, [12, 30, 48], smooth(1.1, 0, r) * 0.9); // soft glow
      const ring = (rad, w, c, a = 1) => {
        const d = Math.abs(r - rad);
        col = mix(col, c, (1 - smooth(w - aa * 2, w + aa * 2, d)) * a);
      };
      ring(0.78, 0.035, cyan); // outer ring
      ring(0.6, 0.012, cyan, 0.5); // inner thin ring
      // gold diamond in the middle (rotated square), cyan crosshair ticks
      const dia = Math.abs(px) + Math.abs(py);
      col = mix(col, gold, 1 - smooth(0.3 - aa * 2, 0.3 + aa * 2, dia));
      const tick = (Math.abs(px) < 0.02 && Math.abs(py) > 0.5 && Math.abs(py) < 0.95) || (Math.abs(py) < 0.02 && Math.abs(px) > 0.5 && Math.abs(px) < 0.95);
      if (tick) col = mix(col, cyan, 0.9);
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = Math.round(col[0]);
      raw[o + 1] = Math.round(col[1]);
      raw[o + 2] = Math.round(col[2]);
      raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", png(192));
writeFileSync("public/icons/icon-512.png", png(512));
writeFileSync("public/icons/maskable-512.png", png(512, 0.78));
writeFileSync("public/icons/apple-touch-icon.png", png(180, 0.92));
writeFileSync(
  "public/favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#05070D"/><circle cx="32" cy="32" r="22" fill="none" stroke="#3FE0FF" stroke-width="3"/><path d="M32 22l10 10-10 10-10-10z" fill="#FFB547"/></svg>`,
);
console.log("icons written");
