import { buildContinuation } from "./concise-result-v3.js";

export function buildFeelingContinuation(previousThemeKey, targetThemeKey = null, targetLevelKey = null) {
  return buildContinuation(previousThemeKey, targetThemeKey, targetLevelKey);
}
