import { getLevel, getSubtheme } from "./content.js";
import { PRIMARY_BODY_RESULTS, PRIMARY_BODY_STATES } from "./direct-body-copy.js";

export const FEELING_GUIDE_VARIANTS = 500;

export function buildFeelingGuide(themeKey, levelKey, requestedVariant = null) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const index = Number.isInteger(requestedVariant)
    ? ((requestedVariant % FEELING_GUIDE_VARIANTS) + FEELING_GUIDE_VARIANTS) % FEELING_GUIDE_VARIANTS
    : Math.floor(Math.random() * FEELING_GUIDE_VARIANTS);

  const states = PRIMARY_BODY_STATES[themeKey] || PRIMARY_BODY_STATES.lazy;
  const results = PRIMARY_BODY_RESULTS[themeKey] || PRIMARY_BODY_RESULTS.lazy;
  const state = states[index] || states[0] || "Ти відчуваєш напругу в тілі.";
  const result = results[index] || results[0] || "Тепер ти відчуваєш полегшення в тілі.";

  return {
    themeKey,
    levelKey,
    variantIndex: index,
    bodyAnchorIndex: Math.floor(index / 25),
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    text: `💭 *Ти так це відчуваєш?*\n\n${state}\n\n✨ *Тепер ти відчуваєш*\n${result}`
  };
}
