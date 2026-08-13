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

const REFERRAL_PATTERN = /фахів|лікар|професійн\w*\s+оцінк|медичн\w*\s+оцінк/iu;

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

function cleanFocus(text = "") {
  const cleaned = String(text || "")
    .replace(/^Фокус\s*—\s*/u, "")
    .replace(/(?:,|\s)+(?:і|й|та)?\s*професійн\w*\s+оцінк\w*/giu, "")
    .replace(/(?:,|\s)+(?:і|й|та)?\s*медичн\w*\s+оцінк\w*/giu, "")
    .replace(/(?:,|\s)+(?:і|й|та)?\s*звернен\w*\s+(?:до|по)\s+(?:фахів\w*|лікар\w*)/giu, "")
    .replace(/[.!?…]+$/u, "")
    .replace(/\s{2,}/gu, " ")
    .trim();
  return REFERRAL_PATTERN.test(cleaned) ? "" : cleaned;
}

function pickDirect(pool = [], fallback = "") {
  const safe = pool.filter((item) => !REFERRAL_PATTERN.test(String(item || "")));
  return ensureSentence(pickRandom(safe) || fallback);
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
  const safePool = pool.filter((item) => !REFERRAL_PATTERN.test(String(item || "")));
  if (pool.length !== 500) return shuffle([...new Set(safePool)]).slice(0, 3);

  const tagGroups = shuffle([0, 1, 2, 3, 4]);
  const result = [];
  for (const tagGroup of tagGroups) {
    const candidates = [];
    for (let frameIndex = 0; frameIndex < 20; frameIndex += 1) {
      for (let variantIndex = 0; variantIndex < 5; variantIndex += 1) {
        const coreIndex = tagGroup * 5 + variantIndex;
        const item = pool[frameIndex * 25 + coreIndex];
        if (item && !REFERRAL_PATTERN.test(item)) candidates.push(item);
      }
    }
    if (candidates.length) result.push(pickRandom(candidates));
    if (result.length === 3) break;
  }

  return result.length === 3 ? result : shuffle([...new Set(safePool)]).slice(0, 3);
}

function threeSentences(first, tail = []) {
  return [ensureSentence(first), ...tail.map(ensureSentence)].filter(Boolean).slice(0, 3).join(" ");
}

function buildState(themeKey, pools) {
  return threeSentences(
    pickDirect(pools.states, "Ти відчуваєш, що ця ситуація зараз забирає частину твого ресурсу."),
    SUPPORT_COPY[themeKey]?.state || []
  );
}

function buildProblem(themeKey, levelKey, level) {
  const rawFact = getProblemFact(themeKey, levelKey);
  const fact = rawFact && !REFERRAL_PATTERN.test(rawFact)
    ? rawFact
    : `Ти бачиш конкретну проблему: ${cleanLevelName(level.name)}.`;
  const focus = cleanFocus(level.summary);
  const objective = "Це опис того, що відбувається зараз, а не оцінка твого характеру.";
  const focusSentence = focus
    ? `У цьому розборі фокус конкретний: ${lowerFirst(focus)}.`
    : "У цьому розборі фокус на конкретній зміні цієї ситуації.";

  return threeSentences(fact, [objective, focusSentence]);
}

function buildSecondaryGain(themeKey, levelKey) {
  const pool = getLevelSecondaryGainPool(themeKey, levelKey);
  const picked = pickContextTriplet(pool);
  return threeSentences(
    picked[0] || "Тобі вигідно лишати цей сценарій без змін, бо так не треба перебудовувати звичну реакцію прямо зараз.",
    picked.slice(1)
  );
}

function buildMeaning(themeKey, levelKey) {
  const pool = getLevelLifeMeaningPool(themeKey, levelKey);
  const picked = pickContextTriplet(pool);
  return threeSentences(
    picked[0] || "У твоєму житті цей сценарій повторюється в щоденних рішеннях і забирає частину уваги.",
    picked.slice(1)
  );
}

function buildSolution(themeKey, pools) {
  return threeSentences(
    pickDirect(pools.affirmations, "Я обираю змінювати цей сценарій конкретними діями."),
    SUPPORT_COPY[themeKey]?.solution || []
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

function nextBenefit(next) {
  const focus = cleanFocus(next?.summary);
  if (!focus) return "➡️ *Хочеш продовжити?* Наступний розбір допоможе тобі побачити ще одну конкретну частину цієї ситуації.";
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
