import * as base from "./card-text-system.js";
import { CARD_TEXT_THEME_DATA_1 } from "./card-text-data-1.js";
import { CARD_TEXT_THEME_DATA_2 } from "./card-text-data-2.js";
import { CARD_TEXT_THEME_DATA_3 } from "./card-text-data-3.js";
import { CARD_TEXT_THEME_DATA_4 } from "./card-text-data-4.js";

export * from "./card-text-system.js";

const RAW = Object.freeze([
  ...CARD_TEXT_THEME_DATA_1,
  ...CARD_TEXT_THEME_DATA_2,
  ...CARD_TEXT_THEME_DATA_3,
  ...CARD_TEXT_THEME_DATA_4
]);

const GAIN_FRAMES = Object.freeze([
  "{benefit}",
  "Зараз {benefit}",
  "Спочатку {benefit}",
  "На короткий час {benefit}",
  "У цій ситуації {benefit}",
  "Коли дієш по-старому, {benefit}",
  "Поки все лишається як є, {benefit}",
  "Поки нічого не змінюєш, {benefit}",
  "Через звичний спосіб {benefit}",
  "У знайомому способі {benefit}",
  "Одразу {benefit}",
  "Ненадовго {benefit}",
  "На мить {benefit}",
  "Поки не робиш інакше, {benefit}",
  "Якщо нічого не міняти, {benefit}",
  "Коли лишаєш усе як є, {benefit}",
  "Поки тримаєшся старого способу, {benefit}",
  "У цей момент {benefit}",
  "Перед зміною {benefit}",
  "Поки не робиш нового кроку, {benefit}"
]);

const MEANING_LINKS = Object.freeze([
  "інакше",
  "без цього",
  "якщо все лишається як є,",
  "якщо нічого не змінювати,",
  "коли старий спосіб повторюється,",
  "якщо звичка не змінюється,",
  "коли це триває далі,",
  "якщо лишати все по-старому,",
  "без зміни",
  "з часом без зміни"
]);

const THEME_CONTEXT = Object.freeze({
  friends: "У дружбі",
  family: "Вдома",
  study: "Під час навчання",
  money: "Коли йдеться про гроші,",
  health: "Коли дбаєш про здоров’я,",
  sleep: "Коли готуєшся до сну,",
  household: "У домашніх справах",
  "self-esteem": "Коли оцінюєш себе,",
  future: "Коли думаєш про майбутнє,",
  rest: "Коли відпочиваєш,",
  "social-media": "У соцмережах",
  work: "Під час роботи",
  sport: "Під час тренувань",
  boundaries: "У стосунках з іншими",
  communication: "У розмовах",
  decisions: "Коли треба щось вирішити,",
  goals: "Коли працюєш над ціллю,",
  emotions: "Коли емоції сильні,",
  responsibility: "Коли береш на себе обов’язки,",
  development: "Коли вчишся новому,"
});

const THEME_IMPACT = Object.freeze({
  friends: "у дружбі стає менше довіри",
  family: "вдома стає більше напруги",
  study: "навчання забирає більше сил",
  money: "з грошима стає більше напруги",
  health: "свої потреби легше пропустити",
  sleep: "режим сну збивається",
  household: "домашні справи накопичуються",
  "self-esteem": "ти частіше знецінюєш себе",
  future: "думки про майбутнє забирають більше сил",
  rest: "на наступні справи лишається менше сил",
  "social-media": "менше часу лишається на сон і справи",
  work: "робочий день виснажує сильніше",
  sport: "тримати регулярний рух стає важче",
  boundaries: "відстоювати свої межі стає важче",
  communication: "у розмовах стає більше непорозумінь",
  decisions: "вибір забирає більше часу й сил",
  goals: "рух до цілі частіше збивається",
  emotions: "емоція довше керує реакцією",
  responsibility: "домовленості стають менш надійними",
  development: "прогрес частіше йде ривками"
});

const CLARITY_REPLACEMENTS = Object.freeze([
  ["постійний новий стимул", "можливість постійно бачити щось нове"],
  ["швидкий стимул без зусиль", "можливість одразу побачити щось нове"],
  ["можливість швидко отримувати новий стимул", "можливість швидко побачити щось нове"],
  ["можливість отримувати легкі стимули без зусиль", "можливість без зусиль бачити щось нове"],
  ["швидкий потік нових стимулів", "можливість одразу перемкнутися на щось нове"],
  ["можливість не переривати приємний стимул", "можливість ще трохи не зупиняти приємний перегляд"],
  ["можливість не залишатися без стимулу", "можливість не залишатися без нових картинок і повідомлень"],
  ["відпочинок не завжди потребує нового стимулу щосекунди", "відпочинок не обов’язково має бути заповнений новими картинками й повідомленнями"],
  ["зменшувати зайві стимули перед сном", "прибирати зайві екрани й активні справи перед сном"],
  ["можливість не переривати потік", "можливість не відриватися від екрана"],
  ["дозволяти собі неідеальний контент", "дозволяти собі неідеальні публікації"],
  ["не тримати контент, який постійно шкодить настрою", "не залишати в стрічці те, що постійно псує настрій"],
  ["залишатися з фантазією замість досвіду", "залишатися лише з уявленням замість реального досвіду"],
  ["готовий зовнішній критерій успіху", "готову чужу мірку успіху"],
  ["готову зовнішню мірку", "готову чужу мірку"],
  ["простий видимий критерій", "просту видиму мірку"],
  ["можливість тримати всі справи вище за себе", "можливість не відчувати провину за паузу"],
  ["можливість ставити всі справи вище за себе", "можливість не відчувати провину за паузу"],
  ["тримати всі справи вище за себе", "не відчувати провину за паузу"]
]);

const normalizePhrase = (value = "") => {
  let text = String(value || "").trim().replace(/сценарій/giu, "спосіб");
  for (const [from, to] of CLARITY_REPLACEMENTS) text = text.replaceAll(from, to);
  return text;
};

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const capitalize = (value = "") => {
  const text = String(value || "").trim();
  return text ? text[0].toUpperCase() + text.slice(1) : text;
};

const lowerFirst = (value = "") => {
  const text = String(value || "").trim();
  return text ? text[0].toLowerCase() + text.slice(1) : text;
};

const contextFor = (theme) => THEME_CONTEXT[theme[0]] || theme[2] || `У темі «${theme[1]}»`;

function topicParts(topic) {
  return {
    key: topic[0],
    name: topic[1],
    benefit: normalizePhrase(topic[4]),
    principle: normalizePhrase(topic[5])
  };
}

function gainBenefitClause(benefit) {
  const value = normalizePhrase(benefit);
  if (/вище за себе/iu.test(value)) return "тобі легше не відчувати провину за паузу";
  if (/^можливість\s+/u.test(value)) return `тобі легше ${value.replace(/^можливість\s+/u, "")}`;
  if (/^відчуття(?:,|\s)/u.test(value)) return `ти зберігаєш ${value}`;
  return `ти отримуєш ${value}`;
}

function topicIndex(themeIndex, subtopicIndex) {
  return themeIndex * base.LIFE_SUBTOPICS_PER_THEME + subtopicIndex;
}

function idx(section, themeIndex, subtopicIndex, style) {
  const normalizedStyle = ((style % base.LIFE_SUBTOPIC_POOL_SIZE) + base.LIFE_SUBTOPIC_POOL_SIZE) % base.LIFE_SUBTOPIC_POOL_SIZE;
  const topic = topicIndex(themeIndex, subtopicIndex);
  if (section === "meanings") {
    return (normalizedStyle >= 10 ? 2000 : 0) + topic * 10 + (normalizedStyle % 10);
  }
  return topic * base.LIFE_SUBTOPIC_POOL_SIZE + normalizedStyle;
}

function buildGain(theme, topic, style, clarifyTopic = false) {
  const value = topicParts(topic);
  const core = GAIN_FRAMES[style].replace("{benefit}", gainBenefitClause(value.benefit));
  const first = clarifyTopic
    ? sentence(`${contextFor(theme)} — «${value.name}»: ${lowerFirst(core)}`)
    : sentence(capitalize(core));
  return `${first} Тому тобі вигідно залишатися у такому способі дій.`;
}

function buildMeaning(theme, topic, style, clarifyTopic = false) {
  const value = topicParts(topic);
  const local = style % 10;
  const context = clarifyTopic
    ? `${contextFor(theme)} — «${value.name}»:`
    : contextFor(theme);
  const principle = lowerFirst(value.principle);
  const impact = THEME_IMPACT[theme[0]] || "ця сфера забирає більше сил";
  const link = MEANING_LINKS[local];
  const first = sentence(`${context} ${principle}`);
  const consequence = sentence(`${capitalize(link)} ${impact}`);
  return style < 10
    ? sentence(`${context} ${principle}; ${link} ${impact}`)
    : `${first} ${consequence}`;
}

const gains = Array(base.POOL_SIZE);
const meanings = Array(base.POOL_SIZE);

for (let themeIndex = 0; themeIndex < RAW.length; themeIndex += 1) {
  const theme = RAW[themeIndex];
  for (let subtopicIndex = 0; subtopicIndex < theme[5].length; subtopicIndex += 1) {
    const topic = theme[5][subtopicIndex];
    for (let style = 0; style < base.LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
      gains[idx("gains", themeIndex, subtopicIndex, style)] = buildGain(theme, topic, style);
      meanings[idx("meanings", themeIndex, subtopicIndex, style)] = buildMeaning(theme, topic, style);
    }
  }
}

function dedupe(pool, section, builder) {
  const seen = new Set();
  for (let themeIndex = 0; themeIndex < RAW.length; themeIndex += 1) {
    const theme = RAW[themeIndex];
    for (let subtopicIndex = 0; subtopicIndex < theme[5].length; subtopicIndex += 1) {
      const topic = theme[5][subtopicIndex];
      for (let style = 0; style < base.LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
        const index = idx(section, themeIndex, subtopicIndex, style);
        const text = pool[index];
        if (!seen.has(text)) {
          seen.add(text);
          continue;
        }
        const clarified = builder(theme, topic, style, true);
        pool[index] = clarified;
        if (seen.has(clarified)) throw new Error(`${section}: duplicate remained after clarification`);
        seen.add(clarified);
      }
    }
  }
}

dedupe(gains, "gains", buildGain);
dedupe(meanings, "meanings", buildMeaning);

export const INDEPENDENT_LIFE_POOLS = Object.freeze({
  ...base.INDEPENDENT_LIFE_POOLS,
  gains: Object.freeze(gains),
  meanings: Object.freeze(meanings)
});

for (const section of ["gains", "meanings"]) {
  const pool = INDEPENDENT_LIFE_POOLS[section];
  if (pool.length !== base.POOL_SIZE || new Set(pool).size !== base.POOL_SIZE || pool.some((text) => !text)) {
    throw new Error(`${section} must contain exactly ${base.POOL_SIZE} unique visible texts`);
  }
}

export function getIndependentLifeVariant(requestedVariant = null) {
  const variant = base.getIndependentLifeVariant(requestedVariant);
  return {
    ...variant,
    gain: INDEPENDENT_LIFE_POOLS.gains[variant.gainIndex],
    meaning: INDEPENDENT_LIFE_POOLS.meanings[variant.meaningIndex]
  };
}
