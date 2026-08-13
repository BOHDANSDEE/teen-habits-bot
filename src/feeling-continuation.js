import { getLevel, getRandomLevelKey, getRandomRelatedTheme, getSubtheme } from "./content.js";
import { buildFeelingGuide } from "./feeling-guide.js";

export function buildFeelingContinuation(previousThemeKey, targetThemeKey = null, targetLevelKey = null) {
  const requestedTheme = targetThemeKey ? getSubtheme(targetThemeKey) : null;
  const requestedLevel = requestedTheme && targetLevelKey ? getLevel(targetThemeKey, targetLevelKey) : null;
  const themeKey = requestedTheme && requestedLevel ? targetThemeKey : getRandomRelatedTheme(previousThemeKey);
  const levelKey = requestedTheme && requestedLevel ? targetLevelKey : getRandomLevelKey(themeKey);
  const guide = buildFeelingGuide(themeKey, levelKey);
  if (!guide) return null;

  const nextThemeKey = getRandomRelatedTheme(themeKey);
  const nextLevelKey = getRandomLevelKey(nextThemeKey);
  const nextTheme = getSubtheme(nextThemeKey);
  const nextLevel = getLevel(nextThemeKey, nextLevelKey);
  const next = nextTheme && nextLevel ? {
    themeKey: nextThemeKey,
    levelKey: nextLevelKey,
    themeName: nextTheme.name,
    articleTitle: nextLevel.articleTitle,
    summary: nextLevel.summary
  } : null;

  return { ...guide, next };
}
