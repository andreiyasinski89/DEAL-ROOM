import { buildLibrary } from "./library";
import { ruPack } from "./packs/ru";

/** The Russian library: the source of truth and what the tests use. Other languages: see bundle.ts. */
const ru = buildLibrary(ruPack);

export const allScenarios = ru.allScenarios;
export const scenarioById = ru.scenarioById;
