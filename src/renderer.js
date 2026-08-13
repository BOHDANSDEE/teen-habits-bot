import {
  getLevel,
  getRandomLevelKey,
  getRandomRelatedTheme,
  getSubtheme,
  pickRandom
} from "./content.js";
import { expandSection } from "./rich-copy.js";

const CORE_COUNT = 25;
const CORE_PREFIXES = {
  states: /^Стан зараз виглядає так:\s*/u,
  secondaryGains: /^Вторинна вигода цього патерну —\s*/u,
  meanings: /^Значення цього досвіду в житті —\s*/u,
  affirmations: /^Я обираю\s*/u
};

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

function splitSentences(text = "") {
  return String(text || "")
    .trim()
    .split(/(?<=[.!?…])\s+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureSentence(text = "") {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
}

function firstThree(text = "") {
  return splitSentences(text).slice(0, 3).join(" ");
}

function richTail(themeKey, sectionKey, rawText) {
  const expanded = makeUserFacing(expandSection(themeKey, sectionKey, rawText));
  return splitSentences(expanded).slice(1, 3);
}

function lowerFirst(text = "") {
  const value = String(text || "").trim();
  if (!value) return value;
  return `${value.charAt(0).toLocaleLowerCase("uk-UA")}${value.slice(1)}`;
}

function cleanLevelName(name = "") {
  return String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
}

function buildThreeSentenceSection(lead, tail = []) {
  return firstThree([ensureSentence(lead), ...tail].filter(Boolean).join(" "));
}

function pickCore(pool = [], prefix) {
  const index = Math.floor(Math.random() * CORE_COUNT);
  return makeUserFacing(String(pool[index] || ""))
    .replace(prefix, "")
    .trim();
}

function buildState(themeKey, pools) {
  const raw = pools.states[Math.floor(Math.random() * CORE_COUNT)] || pickRandom(pools.states);
  const core = pickCore(pools.states, CORE_PREFIXES.states);
  const tail = richTail(themeKey, "states", raw);
  return buildThreeSentenceSection(`Ти можеш відчувати, що ${lowerFirst(core)}`, tail);
}

function buildProblem(themeKey, pools, level) {
  const raw = pickRandom(pools.problems);
  const tail = richTail(themeKey, "problems", raw);
  const focus = String(level.summary || "")
    .replace(/^Фокус\s*—\s*/u, "")
    .replace(/[.!?…]+$/u, "")
    .trim();
  return buildThreeSentenceSection(`У цій проблемі важливо ${lowerFirst(focus)}`, tail);
}

function buildSecondaryGain(themeKey, pools) {
  const raw = pools.secondaryGains[Math.floor(Math.random() * CORE_COUNT)] || pickRandom(pools.secondaryGains);
  const core = pickCore(pools.secondaryGains, CORE_PREFIXES.secondaryGains);
  const tail = richTail(themeKey, "secondaryGains", raw);
  return buildThreeSentenceSection(
    `Тобі може бути по-своєму вигідно залишатися в цьому сценарії, бо він дозволяє ${lowerFirst(core)}`,
    tail
  );
}

function buildMeaning(themeKey, pools) {
  const raw = pools.meanings[Math.floor(Math.random() * CORE_COUNT)] || pickRandom(pools.meanings);
  const core = pickCore(pools.meanings, CORE_PREFIXES.meanings);
  const tail = richTail(themeKey, "meanings", raw);
  return buildThreeSentenceSection(
    `У житті ця тема проявляється через те, як ти вчишся ${lowerFirst(core)}`,
    tail
  );
}

function buildSolution(themeKey, pools) {
  const raw = pools.affirmations[Math.floor(Math.random() * CORE_COUNT)] || pickRandom(pools.affirmations);
  const expanded = makeUserFacing(expandSection(themeKey, "affirmations", raw));
  return firstThree(expanded);
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

function randomReadCount() {
  return 3 + Math.floor(Math.random() * 7);
}

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const pools = theme.pools || {};
  const state = buildState(themeKey, pools);
  const problem = buildProblem(themeKey, pools, level);
  const secondaryGain = buildSecondaryGain(themeKey, pools);
  const meaning = buildMeaning(themeKey, pools);
  const solution = buildSolution(themeKey, pools);
  const readCount = randomReadCount();
  const next = buildNextSuggestion(themeKey);
  const problemName = cleanLevelName(level.name) || level.articleTitle;
  const safetyNote =
    themeKey === "apathy"
      ? "_Якщо цей стан тримається довго або сильно заважає повсякденному життю, варто сказати про це дорослому, якому довіряєш, або звернутися до фахівця._\n\n"
      : "";

  return {
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    readCount,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${secondaryGain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n${safetyNote}🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це ${readCount} разів не поспішаючи.`
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
