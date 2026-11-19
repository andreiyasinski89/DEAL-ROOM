import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { translate } from "./index";
import en from "./en";
import pl from "./pl";

const root = join(__dirname, "..");

function files(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) files(p, out);
    else if (/\.(ts|tsx)$/.test(f) && !/\.test\./.test(f) && !p.includes(join("src", "i18n"))) out.push(p);
  }
  return out;
}

/** Every string literal passed to tr("…") or T("…") in the app source. */
function usedKeys(): Set<string> {
  const keys = new Set<string>();
  const re = /\b(?:tr|T)\(\s*("(?:[^"\\]|\\.)*")/g;
  for (const f of files(root)) {
    const src = readFileSync(f, "utf-8");
    for (const m of src.matchAll(re)) keys.add(JSON.parse(m[1]) as string);
  }
  return keys;
}

const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

describe("translations", () => {
  const keys = usedKeys();

  it("finds the translatable texts", () => {
    expect(keys.size).toBeGreaterThan(100);
  });

  it.each([["en", en], ["pl", pl]] as const)("%s has a translation for every text used in the app", (_l, dict) => {
    const missing = [...keys].filter((k) => !(k in dict) || !dict[k].trim());
    expect(missing).toEqual([]);
  });

  it.each([["en", en], ["pl", pl]] as const)("%s keeps the {placeholders} of the original", (_l, dict) => {
    const bad = [...keys].filter((k) => k in dict && vars(k) !== vars(dict[k]));
    expect(bad).toEqual([]);
  });

  it.each([["en", en], ["pl", pl]] as const)("%s has no stale entries (texts nobody uses)", (_l, dict) => {
    expect(Object.keys(dict).filter((k) => !keys.has(k))).toEqual([]);
  });

  it("English and Polish texts contain no Cyrillic letters, except where the original is a proper name", () => {
    const allowed = new Set<string>();
    for (const [name, dict] of [["en", en], ["pl", pl]] as const)
      for (const [k, v] of Object.entries(dict)) if (/[А-Яа-яЁё]/.test(v) && !allowed.has(k)) throw new Error(`${name}: "${k}" → "${v}"`);
  });
});

describe("translate()", () => {
  it("returns Russian as is and fills variables", () => {
    expect(translate("ru", "Ход {n}", { n: 3 })).toBe("Ход 3");
  });
  it("falls back to the Russian text when a translation is missing", () => {
    expect(translate("en", "нет такого перевода")).toBe("нет такого перевода");
  });
  it("leaves unknown placeholders untouched", () => {
    expect(translate("ru", "a {x} b {y}", { x: 1 })).toBe("a 1 b {y}");
  });
});
