import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
export type Lang = "ru" | "en" | "pl" | "uk";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
  { code: "uk", label: "UA" },
];

/** BCP-47 locales for dates, numbers and clock times. */
export const LOCALE: Record<Lang, string> = { ru: "ru-RU", en: "en-GB", pl: "pl-PL", uk: "uk-UA" };

/** Language names, each in its own language (for selectors and docs). */
export const LANG_NAME: Record<Lang, string> = { ru: "Русский", en: "English", pl: "Polski", uk: "Українська" };

/**
 * Russian is the source language: the key IS the Russian text (gettext style).
 * `tr("Меню")` → "Menu" / "Menu". Missing translations fall back to Russian.
 * A test scans the source and fails if a text wrapped in tr()/T() is not translated.
 */
type Dict = Record<string, string>;
const LOADERS: Record<Exclude<Lang, "ru">, () => Promise<{ default: Dict }>> = {
  en: () => import("./en"),
  pl: () => import("./pl"),
  uk: () => import("./uk"),
};
/** Dictionaries are separate chunks: only the language in use is downloaded. */
const DICTS: Partial<Record<Exclude<Lang, "ru">, Dict>> = {};

/** Loads the dictionary of a language (Russian needs none). Resolves when translate() can use it. */
export async function loadDict(lang: Lang): Promise<void> {
  if (lang === "ru" || DICTS[lang]) return;
  DICTS[lang] = (await LOADERS[lang]()).default;
}

export type Vars = Record<string, string | number>;
/** The translate function bound to a language (what `useI18n().tr` returns). */
export type Tr = (text: string, vars?: Vars) => string;

export function translate(lang: Lang, text: string, vars?: Vars): string {
  const base = lang === "ru" ? text : DICTS[lang]?.[text] ?? text;
  return vars ? base.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : base;
}

/** Marks a string for translation without translating it now (use at the render site with tr()). */
export const T = (text: string) => text;

const STORAGE = "dr_lang";

/** The browser tab title, per language. */
const TITLES: Record<Lang, string> = {
  ru: "DEAL ROOM — тренажёр продаж",
  en: "DEAL ROOM — sales trainer",
  pl: "DEAL ROOM — trener sprzedaży",
  uk: "DEAL ROOM — тренажер продажів",
};

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved === "ru" || saved === "en" || saved === "pl" || saved === "uk") return saved;
    const n = (navigator.language || "ru").slice(0, 2).toLowerCase();
    if (n === "en" || n === "pl" || n === "uk") return n;
  } catch {
    /* private mode */
  }
  return "ru";
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; tr: (text: string, vars?: Vars) => string };
const I18nContext = createContext<Ctx>({ lang: "ru", setLang: () => {}, tr: (t, v) => translate("ru", t, v) });

export function I18nProvider({ children }: { children: ReactNode }) {
  // main.tsx loads the dictionary of the saved language before the first render
  const [lang, setLangState] = useState<Lang>(detectLang);
  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem(STORAGE, l);
    } catch {
      /* ignore */
    }
    // the old language stays on screen until the new dictionary has arrived: no flash of untranslated text
    void loadDict(l).then(() => setLangState(l));
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = TITLES[lang];
  }, [lang]);
  const value = useMemo<Ctx>(() => ({ lang, setLang, tr: (t, v) => translate(lang, t, v) }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
