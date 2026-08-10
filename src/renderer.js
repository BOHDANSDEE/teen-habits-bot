import {
  CONTINUATION_BRIDGES,
  FEELING_INTROS,
  getFirstLevelKey,
  getLevel,
  getRandomRelatedTheme,
  getSubtheme,
  pickRandom
} from "./content.js";

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  return {
    themeKey,
    levelKey,
    text: `${pickRandom(FEELING_INTROS)}

${level.summary}

🔹 Стан
${pickRandom(level.states)}

🔹 Проблема
${pickRandom(level.problems)}

🔹 Можлива вторинна вигода
${pickRandom(level.secondaryGains)}

🔹 Значення в житті
${pickRandom(level.meanings)}

🔹 Що зробити зараз
${pickRandom(level.actions)}

🔑 Афірмація
${pickRandom(level.affirmations)}

Прочитай афірмацію 1–3 рази, якщо вона тобі підходить. Якщо ні — сформулюй її своїми словами.

_Це не діагноз і не оцінка характеру. Блок допомагає перевірити одну з можливих причин і вибрати наступну дію._`
  };
}

export function buildContinuation(previousThemeKey) {
  const themeKey = getRandomRelatedTheme(previousThemeKey);
  const levelKey = getFirstLevelKey(themeKey);
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
