import { extras } from "./extras";
import type { ContentPack } from "../types";
import { beats } from "./beats";
import { mini } from "./mini";
import { personas } from "./personas";
import { tpl } from "./tpl";
import { vocab } from "./vocab";

export const enPack: ContentPack = { lang: "en", beats, vocab, personas, tpl, mini, extras };
