import type { Opt } from "../data/beats";
import type { Mv } from "./types";

/** A strong answer (with a technique) and a weak one (with a mistake): short constructors for the pack data files. */
export const g = (t: string, tech: string, note: string): Opt => ({ t, tech, note });
export const x = (t: string, mistake: string, note: string): Opt => ({ t, mistake, note });

/** An answer of an extra move: label = technique (strong answers) or mistake (weak ones). */
export const m = (t: string, label: string, note: string): Mv => ({ t, label, note });
