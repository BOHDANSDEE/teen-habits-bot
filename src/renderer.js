import {
  CONTINUATION_BRIDGES,
  FEELING_INTROS,
  getLevel,
  getRandomLevelKey,
  getRandomRelatedTheme,
  getSubtheme,
  pickRandom
} from "./content.js";
import { expandSection } from "./rich-copy.js";

const formatActions = (actions = []) =>
  actions
    .slice(0, 3)
    .map((action, index) => `${["1️⃣", "2️⃣", "3️⃣"][index]} ${action}`)
    .join("\n");

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const pools = theme.pools || {};
  const state = expandSection(themeKey, "states", pickRandom(pools.states));
  const problem = expandSection(themeKey, "problems", pickRandom(pools.problems));
  const secondaryGain = expandSection(
    themeKey,
    "secondaryGains",
    pickRandom(pools.secondaryGains)
  );
  const meaning = expandSection(themeKey, "meanings", pickRandom(pools.meanings));
  const affirmation = expandSection(
    themeKey,
    "affirmations",
    pickRandom(pools.affirmations)
  );

  return {
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    text: `${pickRandom(FEELING_INTROS)}

🎯✨ *${level.articleTitle}*

🧭 ${level.summary}

🌿🧠 *Стан*
${state}

🧩⚠️ *Проблема*
${problem}

🪞🎁 *Вторинна вигода*
${secondaryGain}

🌟🧭 *Значення в житті*
${meaning}

🚀✅ *Що зробити зараз*
${formatActions(level.actions)}

🔑✨ *Афірмація*
${affirmation}

🕯️ Прочитай афірмацію повільно 3 рази. Не поспішай: важливо не просто повторити слова, а співвіднести їх зі своєю реальною ситуацією та наступною дією.

💚 Один розбір не зобов’язує вирішити все одразу. Якщо відчуваєш, що тема зачепила лише частину ситуації, натисни «Хочу ще рішення» — бот продовжить із пов’язаного рівня.

_Це не медичний діагноз. Блок допомагає розібрати обраний поведінковий та емоційний патерн, побачити його функцію і перейти до конкретної дії._`
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
    text: `🔄✨ Продовження: ${theme.name}\n\n${pickRandom(CONTINUATION_BRIDGES)}\n\n${result.text}`
  };
}
