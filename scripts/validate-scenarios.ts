import { allScenarios } from "../src/content";
import { validateScenario } from "../src/engine/validate";

let failed = 0;
for (const sc of allScenarios) {
  const r = validateScenario(sc);
  const errors = r.issues.filter((i) => i.severity === "error");
  const head = errors.length ? "FAIL" : "ok  ";
  const stats = r.stats
    ? ` sale ${(r.stats.sale * 100).toFixed(1)}% / partial ${(r.stats.partial * 100).toFixed(1)}% / lost ${(r.stats.lost * 100).toFixed(1)}% (avg ${r.stats.avgTurns.toFixed(1)} turns)`
    : "";
  const paths = r.paths ? ` paths→sale ${r.paths.sale}` : "";
  console.log(`${head} ${r.id}${paths}${stats}`);
  for (const i of r.issues) console.log(`     ${i.severity.toUpperCase()} [${i.code}] ${i.message}`);
  if (errors.length) failed++;
}
console.log(`\n${allScenarios.length - failed}/${allScenarios.length} scenarios valid`);
process.exit(failed ? 1 : 0);
