import {
  buildResult,
  getFirstLevel,
  getTransitionText,
  pickNextSubtheme
} from "./content.js";

for (const key of ["lazy", "apathy", "procrastination"]) {
  console.log("\n========================================");
  console.log(`DEMO: ${key} / ${getFirstLevel(key)?.name}`);
  console.log("========================================\n");
  console.log(buildResult(key).text);

  const next = pickNextSubtheme(key);
  console.log(`\n→ continuation: ${getTransitionText(key, next)}`);
}
