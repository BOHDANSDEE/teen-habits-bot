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

🔹 Можлива вторинна вигода
${pickRandom(pools.secondaryGains)}

🔹 Значення в житті
${pickRandom(pools.meanings)}

🔹 Що зробити зараз
${pickRandom(level.actions)}

🔑 Афірмація
${pickRandom(pools.affirmations)}

Прочитай афірмацію 1–3 рази, якщо вона тобі підходить. Якщо ні — сформулюй її своїми словами.

_Це не діагноз і не оцінка характеру. Блок допомагає перевірити одну з можливих причин і вибрати наступну дію._`
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
