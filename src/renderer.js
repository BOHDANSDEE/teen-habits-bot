import {
  getLevel,
  getRandomLevelKey,
  getRandomRelatedTheme,
  getSubtheme
} from "./content.js";
import { pickExperience } from "./experience-pools.js";

const formatActions = (actions = []) =>
  actions
    .slice(0, 3)
    .map((action, index) => `${["1️⃣", "2️⃣", "3️⃣"][index]} ${action}`)
    .join("\n");

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

  return `🧭💡 *Що може допомогти далі*\n${next.articleTitle}\n\n${next.summary}\n\nЯкщо це схоже на тебе, натисни «Хочу рішення про це». Наступний розбір прийде окремим повідомленням.`;
}

function formatSolution(solution = "") {
  const value = String(solution || "").trim();
  if (!value) return "Я обираю один маленький крок, який можу зробити сьогодні.";
  if (/^Я\s/u.test(value)) return value;
  return `Я обираю ${value}`;
}

export function buildResult(themeKey, levelKey, preferredMode = null) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const experience = pickExperience(themeKey, preferredMode);
  if (!experience) return null;

  const next = buildNextSuggestion(themeKey);
  const nextSuggestion = formatNextSuggestion(next);
  const safetyNote =
    themeKey === "apathy"
      ? "_Якщо низький настрій, втрата інтересу або виснаження тримаються довго чи сильно заважають повсякденному життю, варто сказати про це дорослому, якому довіряєш, або звернутися до фахівця._"
      : "_Це не діагноз і не оцінка характеру. Це спосіб подивитися на свій сценарій і вибрати наступну дію._";

  return {
    themeKey,
    levelKey,
    mode: experience.mode,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    text: `${experience.text}\n\n🎯 У твоїй конкретній темі фокус такий: ${level.summary}\n\n🚀✅ *Що спробувати зараз*\n${formatActions(level.actions)}\n\n${safetyNote}${nextSuggestion ? `\n\n${nextSuggestion}` : ""}\n\n🔑✨ *Рішення*\n${formatSolution(experience.solution)}\n\n_Не просто перечитай цю фразу. Скажи її своїми словами й підтверди одним маленьким кроком сьогодні._`
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
