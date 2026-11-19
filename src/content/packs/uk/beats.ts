import type { Beat, BeatTag } from "../../data/beats";
import { beats1 } from "./beats1";
import { beats2 } from "./beats2";
import { beats3 } from "./beats3";

/** All 23 objection beats in this language (the tests check that none is missing). */
export const beats = { ...beats1, ...beats2, ...beats3 } as Record<BeatTag, Beat>;
