import * as base from "./card-text-clarity-v3.js";
import { CARD_TEXT_THEME_DATA_1 } from "./card-text-data-1.js";
import { CARD_TEXT_THEME_DATA_2 } from "./card-text-data-2.js";
import { CARD_TEXT_THEME_DATA_3 } from "./card-text-data-3.js";
import { CARD_TEXT_THEME_DATA_4 } from "./card-text-data-4.js";

export * from "./card-text-clarity-v3.js";

const RAW = Object.freeze([
  ...CARD_TEXT_THEME_DATA_1,
  ...CARD_TEXT_THEME_DATA_2,
  ...CARD_TEXT_THEME_DATA_3,
  ...CARD_TEXT_THEME_DATA_4
]);

const BENEFIT_REPLACEMENTS = Object.freeze([
  ["постійний новий стимул", "можливість постійно бачити щось нове"],
  ["швидкий стимул без зусиль", "можливість одразу побачити щось нове"],
  ["можливість швидко отримувати новий стимул", "можливість швидко побачити щось нове"],
  ["можливість отримувати легкі стимули без зусиль", "можливість без зусиль бачити щось нове"],
  ["швидкий потік нових стимулів", "можливість одразу перемкнутися на щось нове"],
  ["можливість не переривати приємний стимул", "можливість ще трохи не зупиняти приємний перегляд"],
  ["можливість не залишатися без стимулу", "можливість не залишатися без нових картинок і повідомлень"],
  ["можливість не переривати потік", "можливість не відриватися від екрана"],
  ["готовий зовнішній критерій успіху", "готову чужу мірку успіху"],
  ["готову зовнішню мірку", "готову чужу мірку"],
  ["простий видимий критерій", "просту видиму мірку"],
  ["можливість тримати всі справи вище за себе", "можливість не відчувати провину за паузу"],
  ["можливість ставити всі справи вище за себе", "можливість не відчувати провину за паузу"],
  ["тримати всі справи вище за себе", "можливість не відчувати провину за паузу"]
]);

const GENERIC_REASONS = Object.freeze([
  "користь є зараз, а зміну можна відкласти",
  "зараз так легше, а міняти звичку можна пізніше",
  "полегшення є зараз, а складніший крок — потім",
  "користь приходить одразу, а зміна може зачекати",
  "зараз так простіше, а зміну можна лишити на потім",
  "цей спосіб дає полегшення зараз, а зміна — пізніше",
  "користь видно одразу, а наслідки — пізніше",
  "зараз він зручніший, а нову дію можна відкласти",
  "полегшення приходить швидко, тому спосіб тримається",
  "зараз так легше, навіть якщо потім це заважає",
  "користь є одразу, тому міняти спосіб не хочеться",
  "зараз він допомагає, а зміна потребує більше сил",
  "цей спосіб дає щось зараз, а зміна може зачекати",
  "так легше зараз, а новий крок можна зробити пізніше",
  "користь приходить зараз, а рішення про зміну — потім",
  "зараз цей спосіб простіший, тому його легко зберігати",
  "користь є зараз, а пробувати нове можна пізніше",
  "цей спосіб полегшує момент, а зміна може зачекати",
  "зараз так зручніше, а мінуси стають помітні пізніше",
  "полегшення є одразу, а змінюватися можна пізніше"
]);

const GOALS_MANY_REASONS = Object.freeze([
  "нова ціль цікава одразу, а головну можна не обирати",
  "можна захопитися новим і не звужувати список цілей",
  "новизна приємна, а відмовлятися від цілей не треба",
  "нова ціль захоплює, а пріоритет можна відкласти",
  "новий старт дає енергію, а головну ціль можна не обирати",
  "можна додати ідею, не вирішуючи, що справді головне",
  "нова ціль захоплює, а другорядні можна поки лишити",
  "цікавість є одразу, а звужувати вибір можна пізніше",
  "можна тримати кілька напрямів і не обирати один зараз",
  "нові ідеї дають заряд, а пріоритет можна відкласти",
  "можна починати нове, не закриваючи інші цілі",
  "новизна приємна, а вибір головного можна відкласти",
  "нова ціль дає інтерес, тому головну можна ще не обирати",
  "можна лишити ідеї активними й не скорочувати список",
  "новий напрям захоплює, а пріоритет можна не визначати",
  "можна відчути новий старт, не відмовляючись від інших цілей",
  "нова ідея додає енергії, а звужувати цілі можна пізніше",
  "можна збирати нові цілі й ще не вирішувати, яка головна",
  "інтерес є одразу, а менше цілей можна обрати потім",
  "новий старт приємний, а зайві напрями можна закрити пізніше"
]);

const SPECIAL_REASONS = Object.freeze({
  "goals/many": GOALS_MANY_REASONS
});

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

function normalizeBenefit(value = "") {
  let text = String(value || "")
    .trim()
    .replace(/патерн/giu, "звичку")
    .replace(/сценарій/giu, "спосіб")
    .replace(/механізм/giu, "спосіб")
    .replace(/когнітив\w*/giu, "розумовий")
    .replace(/соматич\w*/giu, "тілесний");
  for (const [from, to] of BENEFIT_REPLACEMENTS) text = text.replaceAll(from, to);
  return text;
}

function benefitClause(value = "") {
  const benefit = normalizeBenefit(value);
  if (/^можливість\s+/u.test(benefit)) {
    return `можеш ${benefit.replace(/^можливість\s+/u, "")}`;
  }
  return `отримуєш ${benefit}`;
}

function topicIndex(themeIndex, subtopicIndex) {
  return themeIndex * base.LIFE_SUBTOPICS_PER_THEME + subtopicIndex;
}

function gainIndex(themeIndex, subtopicIndex, style) {
  return topicIndex(themeIndex, subtopicIndex) * base.LIFE_SUBTOPIC_POOL_SIZE + style;
}

function buildGain(theme, topic, style, disambiguate = false) {
  const key = `${theme[0]}/${topic[0]}`;
  const reasons = SPECIAL_REASONS[key] || GENERIC_REASONS;
  const firstCore = benefitClause(topic[4]);
  const first = disambiguate
    ? sentence(`У такому способі дії ти ${firstCore} — «${topic[1]}»`)
    : sentence(`У такому способі дії ти ${firstCore}`);
  const second = sentence(`Тому тобі вигідно залишатися у такому способі дій — ${reasons[style]}`);
  return `${first} ${second}`;
}

const gains = Array(base.POOL_SIZE);
for (let themeIndex = 0; themeIndex < RAW.length; themeIndex += 1) {
  const theme = RAW[themeIndex];
  for (let subtopicIndex = 0; subtopicIndex < theme[5].length; subtopicIndex += 1) {
    const topic = theme[5][subtopicIndex];
    for (let style = 0; style < base.LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
      const index = gainIndex(themeIndex, subtopicIndex, style);
      gains[index] = buildGain(theme, topic, style);
    }
  }
}

const seen = new Set();
for (let themeIndex = 0; themeIndex < RAW.length; themeIndex += 1) {
  const theme = RAW[themeIndex];
  for (let subtopicIndex = 0; subtopicIndex < theme[5].length; subtopicIndex += 1) {
    const topic = theme[5][subtopicIndex];
    for (let style = 0; style < base.LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
      const index = gainIndex(themeIndex, subtopicIndex, style);
      const text = gains[index];
      if (!seen.has(text)) {
        seen.add(text);
        continue;
      }
      const clarified = buildGain(theme, topic, style, true);
      if (seen.has(clarified)) throw new Error(`gains: duplicate remained for ${theme[0]}/${topic[0]}/${style}`);
      gains[index] = clarified;
      seen.add(clarified);
    }
  }
}

if (gains.length !== base.POOL_SIZE || new Set(gains).size !== base.POOL_SIZE || gains.some((text) => !text)) {
  throw new Error(`gains must contain exactly ${base.POOL_SIZE} unique visible texts`);
}

export const INDEPENDENT_LIFE_POOLS = Object.freeze({
  ...base.INDEPENDENT_LIFE_POOLS,
  gains: Object.freeze(gains)
});

export function getIndependentLifeVariant(requestedVariant = null) {
  const variant = base.getIndependentLifeVariant(requestedVariant);
  return {
    ...variant,
    gain: INDEPENDENT_LIFE_POOLS.gains[variant.gainIndex]
  };
}
