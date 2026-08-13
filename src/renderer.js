import {
  getLevel,
  getRandomLevelKey,
  getRandomRelatedTheme,
  getSubtheme,
  pickRandom
} from "./content.js";

const SUPPORT_COPY = {
  lazy: {
    state: [
      "Ти хочеш рухатися, але старт забирає більше сил, ніж сама дія.",
      "Коли перший крок стає ясним і невеликим, внутрішній опір слабшає."
    ],
    gain: [
      "Так ти швидко знімаєш напругу перед стартом.",
      "Але коротке полегшення залишає саму справу поруч і повертає її пізніше з більшим тиском."
    ],
    meaning: [
      "Це проявляється у навчанні, роботі, побуті та особистих цілях — скрізь, де треба почати без ідеального настрою.",
      "Коли ти керуєш стартом, у тебе з’являється більше довіри до власних дій."
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
    gain: [
      "Так ти захищаєш залишок ресурсу від нових вимог.",
      "Але коли уникнення стає єдиним способом берегти сили, контакт із життям звужується ще більше."
    ],
    meaning: [
      "Це проявляється у тому, як ти ставишся до свого ресурсу, відпочинку, підтримки й щоденного ритму.",
      "Коли ти помічаєш реальні потреби, повернення до звичного життя стає послідовнішим."
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
    gain: [
      "Так ти отримуєш полегшення прямо зараз і переносиш дискомфорт на потім.",
      "Саме ця швидка винагорода закріплює цикл відкладання."
    ],
    meaning: [
      "Це проявляється у дедлайнах, телефоні, навчанні, побуті та великих цілях.",
      "Коли ти перестаєш чекати терміновості, у твоїх рішеннях з’являється більше свободи."
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

function threeSentences(first, tail = []) {
  return [ensureSentence(first), ...tail.map(ensureSentence)].filter(Boolean).slice(0, 3).join(" ");
}

function buildState(themeKey, pools) {
  return threeSentences(pickDirect(pools.states), SUPPORT_COPY[themeKey]?.state || []);
}

function buildProblem(themeKey, pools, level) {
  const raw = pickDirect(pools.problems);
  const focus = String(level.summary || "")
    .replace(/^Фокус\s*—\s*/u, "")
    .replace(/[.!?…]+$/u, "")
    .trim();
  const focusSentence = `Щоб змінити цей сценарій, тобі важливо ${lowerFirst(focus)}.`;
  const consequence = "Через це сценарій повторюється й забирає в тебе більше ресурсу.";
  const safety =
    "Якщо цей стан тримається довго або сильно заважає повсякденному життю, скажи про це дорослому, якому довіряєш, або звернися до фахівця.";

  return threeSentences(raw, themeKey === "apathy" ? [focusSentence, safety] : [consequence, focusSentence]);
}

function buildSecondaryGain(themeKey, pools) {
  return threeSentences(pickDirect(pools.secondaryGains), SUPPORT_COPY[themeKey]?.gain || []);
}

function buildMeaning(themeKey, pools) {
  return threeSentences(pickDirect(pools.meanings), SUPPORT_COPY[themeKey]?.meaning || []);
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
  return `➡️ *Далі* Наступний розбір допоможе тобі ${lowerFirst(focus)}.`;
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
