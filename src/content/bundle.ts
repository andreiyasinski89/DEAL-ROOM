import type { Lang } from "../i18n";
import { buildLibrary } from "./library";
import { ruPack } from "./packs/ru";
import type { ContentPack } from "./packs/types";

export type Library = ReturnType<typeof buildLibrary>;

/** The pack of a language, loaded on demand (each pack is a separate chunk). */
async function loadPack(lang: Lang): Promise<ContentPack> {
  switch (lang) {
    case "en":
      return (await import("./packs/en")).enPack;
    case "pl":
      return (await import("./packs/pl")).plPack;
    case "uk":
      return (await import("./packs/uk")).ukPack;
    default:
      return ruPack; // Russian is the source language: it is part of the builder chunk anyway
  }
}

const cache = new Map<Lang, Library>();

/** Everything that needs the scenario library, for one language. Cached per language. */
export async function loadLibrary(lang: Lang): Promise<Library> {
  const hit = cache.get(lang);
  if (hit) return hit;
  const lib = buildLibrary(await loadPack(lang));
  cache.set(lang, lib);
  return lib;
}
