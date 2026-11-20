import { extras } from "./extras";
import { ghost } from "./ghost";
import type { ContentPack } from "../types";
import { beats } from "./beats";
import { mini } from "./mini";
import { personas } from "./personas";
import { tpl } from "./tpl";
import { vocab } from "./vocab";

export const ukPack: ContentPack = { lang: "uk", beats, vocab, personas, tpl, mini, extras, ghost };
