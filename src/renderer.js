import {
  getLevel,
  getRandomLevelKey,
  getRandomRelatedTheme,
  getSubtheme,
  pickRandom
} from "./content.js";
import {
  getLevelLifeMeaningPool,
  getLevelSecondaryGainPool,
  getProblemFact
} from "./level-context-pools.js";

const SUPPORT_COPY = {
  lazy: {
    state: [
      "Ти хочеш рухатися, але старт забирає більше сил, ніж сама дія.",
      "Коли перший крок стає ясним і невеликим, внутрішній опір слабшає."
    ],
    solution: [
      "Я не чекаю ідеального моменту, щоб повернути собі рух.",
      "Я підтверджую це рішення одним посильним кроком сьогодні."
    ]
  },
  apathy: {
    state: [
      "Твій ресурс зараз нижчий, тому звичні речі відчуваються важчими.",
      "Тут важливо не тиснути на себе, а повертати базові опори, ритм і підтримку."
    ],
    solution: [
      "Я ставлюся до свого ресурсу уважно й не вимагаю від себе неможливого.",
      "Я повертаю опору через одну просту дію й підтримку, коли вона потрібна."
    ]
  },
  procrastination: {
    state: [
      "Ти знаєш, що справа важлива, але коротке полегшення перемагає довший результат.",
      "Чим довше ти відкладаєш, тим важчим здається сам момент старту."
    ],
    solution: [
      "Я не віддаю керування терміновості й швидкій винагороді.",
      "Я починаю з конкретного кроку й повертаюся після відволікання."
    ]
  }
};

function ensureSentence(text = "") {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
}

function lowerFirst(text = "") {
  const value = String(text || "").trim();
  if (!value) return value;
  return `${value.charAt(0).toLocaleLowerCase("uk-UA")}${value.slice(1)}`;
}

function cleanLevelName(name = "") {
  return String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
}

function pickDirect(pool = []) {
  return ensureSentence(pickRandom(pool));
}

function shuffle(items = []) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickContextTriplet(pool = []) {
  if (pool.length !== 500) return shuffle([...new Set(pool)]).slice(0, 3);
  const tagGroups = shuffle([0, 1, 2, 3, 4]).slice(0, 3);
  return tagGroups.map((tagGroup) => {
    const frameIndex = Math.floor(Math.random() * 20);
    const variantIndex = Math.floor(Math.random() * 5);
    const coreIndex = tagGroup * 5 + variantIndex;
    return pool[frameIndex * 25 + coreIndex];
  });
}

function threeSentences(first, tail = []) {
  return [ensureSentence(first), ...tail.map(ensureSentence)].filter(Boolean).slice(0, 3).join(" ");
}

function buildState(themeKey, pools) {
  return threeSentences(pickDirect(pools.states), SUPPORT_COPY[themeKey]?.state || []);
}

function buildProblem(themeKey, levelKey, level) {
  const fact = getProblemFact(themeKey, levelKey) || `Ти обрав конкретну проблему: ${cleanLevelName(level.name)}.`;
  const focus = String(level.summary || "")
    .replace(/^Фокус\s*—\s*/u, "")
    .replace(/[.!?…]+$/u, "")
    .trim();
  const objective = "Це опис того, що відбувається зараз, а не оцінка твого характеру.";
  const focusSentence = `У цьому розборі фокус конкретний: ${lowerFirst(focus)}.`;
  const safety =
    "Якщо цей стан тримається довго або сильно заважає повсякденному життю, скажи про це дорослому, якому довіряєш, або звернися до фахівця.";

  return threeSentences(fact, themeKey === "apathy" ? [focusSentence, safety] : [objective, focusSentence]);
}

function buildSecondaryGain(themeKey, levelKey) {
  const pool = getLevelSecondaryGainPool(themeKey, levelKey);
  return pickContextTriplet(pool).map(ensureSentence).join(" ");
}

function buildMeaning(themeKey, levelKey) {
  const pool = getLevelLifeMeaningPool(themeKey, levelKey);
  return pickContextTriplet(pool).map(ensureSentence).join(" ");
}

function buildSolution(themeKey, pools) {
  return threeSentences(pickDirect(pools.affirmations), SUPPORT_COPY[themeKey]?.solution || []);
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

function nextBenefit(next) {
  if (!next?.summary) return "";
  const focus = String(next.summary)
    .replace(/^Фокус\s*—\s*/u, "")
    .replace(/[.!?…]+$/u, "")
    .trim();
  if (!focus) return "";
  return `➡️ *Хочеш продовжити?* Наступний розбір допоможе тобі ${lowerFirst(focus)}.`;
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
  const problem = buildProblem(themeKey, levelKey, level);
  const secondaryGain = buildSecondaryGain(themeKey, levelKey);
  const meaning = buildMeaning(themeKey, levelKey);
  const solution = buildSolution(themeKey, pools);
  const readCount = randomReadCount();
  const next = buildNextSuggestion(themeKey);
  const benefit = nextBenefit(next);
  const problemName = cleanLevelName(level.name) || level.articleTitle;

  return {
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    readCount,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${secondaryGain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${readCount} разів не поспішаючи.${benefit ? `\n\n${benefit}` : ""}`
  };
}

export function buildContinuation(
  previousThemeKey,
  targetThemeKey = null,
  targetLevelKey = null
) {
  const requestedTheme = targetThemeKey ? getSubtheme(targetThemeKey) : null;
  const requestedLevel = requestedTheme && targetLevelKey ? getLevel(targetThemeKey, targetLevelKey) : null;

  const themeKey =
    requestedTheme && requestedLevel ? targetThemeKey : getRandomRelatedTheme(previousThemeKey);
  const levelKey =
    requestedTheme && requestedLevel ? targetLevelKey : getRandomLevelKey(themeKey);

  return buildResult(themeKey, levelKey);
}
