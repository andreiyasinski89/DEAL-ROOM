import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "./en";
import pl from "./pl";

export type Lang = "ru" | "en" | "pl";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "pl", label: "PL" },
];

/**
 * Russian is the source language: the key IS the Russian text (gettext style).
 * `tr("Меню")` → "Menu" / "Menu". Missing translations fall back to Russian.
 * A test scans the source and fails if a text wrapped in tr()/T() is not translated.
 */
const DICTS: Record<Exclude<Lang, "ru">, Record<string, string>> = { en, pl };

export type Vars = Record<string, string | number>;

export function translate(lang: Lang, text: string, vars?: Vars): string {
  const base = lang === "ru" ? text : DICTS[lang][text] ?? text;
  return vars ? base.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : base;
}

/** Marks a string for translation without translating it now (use at the render site with tr()). */
export const T = (text: string) => text;

const STORAGE = "dr_lang";

export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved === "ru" || saved === "en" || saved === "pl") return saved;
    const n = (navigator.language || "ru").slice(0, 2).toLowerCase();
    if (n === "en" || n === "pl") return n;
  } catch {
    /* private mode */
  }
  return "ru";
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; tr: (text: string, vars?: Vars) => string };
const I18nContext = createContext<Ctx>({ lang: "ru", setLang: () => {}, tr: (t, v) => translate("ru", t, v) });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE, l);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo<Ctx>(() => ({ lang, setLang, tr: (t, v) => translate(lang, t, v) }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
