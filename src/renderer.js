import {
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

const LEVEL_LANGUAGE_REPLACEMENTS = [
  [/У цьому рівні/gu, "У цій ситуації"],
  [/Ключова ознака цього рівня/gu, "Ключова ознака цього стану"],
  [/Цей рівень відчувається так/gu, "Ця ситуація відчувається так"],
  [/Проблемний вузол цього рівня/gu, "Проблемний вузол цієї ситуації"],
  [/Цей рівень стає важчим/gu, "Ця ситуація стає важчою"],
  [/Цей рівень вчить/gu, "Цей досвід вчить"],
  [/Робота з цим рівнем/gu, "Робота з цим станом"],
  [/Цей рівень показує/gu, "Цей досвід показує"],
  [/Результат роботи з цим рівнем/gu, "Результат роботи з цим станом"]
];

function makeUserFacing(text = "") {
  return LEVEL_LANGUAGE_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    String(text || "")
  );
}

function buildNextSuggestion(currentThemeKey) {
  const themeKey = getRandomRelatedTheme(currentThemeKey);
  const levelKey = getRandomLevelKey(themeKey);
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);

  if (!theme || !level) return null;

  return {
    themeKey,
    levelKey,
    themeName: theme.name,
    articleTitle: level.articleTitle,
    summary: level.summary
  };
}

function formatNextSuggestion(next) {
  if (!next) return "";

  return `\n\n🧭💡 *Що може допомогти далі*\n${next.articleTitle}\n\n${next.summary}\n\nЯкщо це схоже на твою ситуацію, натисни «Хочу рішення про це». Наступний розбір прийде окремим повідомленням, а цей залишиться в історії.`;
}

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const pools = theme.pools || {};
  const state = makeUserFacing(
    expandSection(themeKey, "states", pickRandom(pools.states))
  );
  const problem = makeUserFacing(
    expandSection(themeKey, "problems", pickRandom(pools.problems))
  );
  const secondaryGain = makeUserFacing(
    expandSection(themeKey, "secondaryGains", pickRandom(pools.secondaryGains))
  );
  const meaning = makeUserFacing(
    expandSection(themeKey, "meanings", pickRandom(pools.meanings))
  );
  const solution = makeUserFacing(
    expandSection(themeKey, "affirmations", pickRandom(pools.affirmations))
  );
  const next = buildNextSuggestion(themeKey);

  return {
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Що заважає*\n${problem}\n\n🪞🎁 *Що тримає цей сценарій*\n${secondaryGain}\n\n🌟🧭 *Навіщо це змінювати*\n${meaning}\n\n🚀✅ *Що зробити зараз*\n${formatActions(level.actions)}\n\n🔑✨ *Рішення*\n${solution}\n\n🕯️ Не просто перечитай рішення. Обери з нього одну думку, яку підтвердиш конкретною дією сьогодні.\n\n_Це не медичний діагноз. Блок допомагає розібрати обраний поведінковий та емоційний патерн, побачити його функцію і перейти до конкретної дії._${formatNextSuggestion(next)}`
  };
}

export function buildContinuation(
  previousThemeKey,
  targetThemeKey = null,
  targetLevelKey = null
) {
  const requestedTheme = targetThemeKey ? getSubtheme(targetThemeKey) : null;
  const requestedLevel =
    requestedTheme && targetLevelKey
      ? getLevel(targetThemeKey, targetLevelKey)
      : null;

  const themeKey =
    requestedTheme && requestedLevel
      ? targetThemeKey
      : getRandomRelatedTheme(previousThemeKey);
  const levelKey =
    requestedTheme && requestedLevel
      ? targetLevelKey
      : getRandomLevelKey(themeKey);

  return buildResult(themeKey, levelKey);
}
