import {
  CONTINUATION_BRIDGES,
  FEELING_INTROS,
  getLevel,
  getRandomLevelKey,
  getRandomRelatedTheme,
  getSubtheme,
  pickRandom
} from "./content.js";

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const pools = theme.pools || {};

  return {
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    text: `${pickRandom(FEELING_INTROS)}

🎯 *${level.articleTitle}*

${level.summary}

🔹 Стан
${pickRandom(pools.states)}

🔹 Проблема
${pickRandom(pools.problems)}

🔹 Вторинна вигода
${pickRandom(pools.secondaryGains)}

🔹 Значення в житті
${pickRandom(pools.meanings)}

🔹 Що зробити зараз
${pickRandom(level.actions)}

🔑 Афірмація
${pickRandom(pools.affirmations)}

Прочитай афірмацію повільно 1–3 рази. За бажанням переформулюй її своїми словами, зберігши головний сенс.

_Це не медичний діагноз. Блок розбирає обраний поведінковий і емоційний патерн та переводить його в конкретну наступну дію._`
  };
}

export function buildContinuation(previousThemeKey) {
  const themeKey = getRandomRelatedTheme(previousThemeKey);
  const levelKey = getRandomLevelKey(themeKey);
  const theme = getSubtheme(themeKey);
  const result = buildResult(themeKey, levelKey);

  if (!theme || !result) return null;

  return {
    ...result,
    text: `🔄 Продовження: ${theme.name}

${pickRandom(CONTINUATION_BRIDGES)}

${result.text}`
  };
}
