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
  "коротка користь є одразу, а зміну можна відкласти",
  "зараз так легше, а змінювати звичку можна пізніше",
  "полегшення є зараз, а складніший крок можна лишити на потім",
  "користь відчувається відразу, тому старий спосіб легко зберігати",
  "цей спосіб дає щось потрібне зараз, а зміни можна відкласти",
  "зараз він простіший, а нову дію можна залишити на потім",
  "коротке полегшення приходить швидко, а зміни потребують більше зусиль",
  "так простіше зараз, навіть якщо потім цей спосіб заважає",
  "користь помітна одразу, а незручність зміни — пізніше",
  "зараз цей спосіб дає полегшення, тому міняти його не хочеться",
  "так ти отримуєш швидку користь і можеш не міняти звичку одразу",
  "цей спосіб працює як швидке полегшення, а зміну можна відкласти",
  "зараз він дає потрібне відчуття, а складнішу дію можна не починати",
  "так легше пережити цей момент, не переходячи до зміни одразу",
  "коротка користь приходить зараз, а рішення щось міняти можна відкласти",
  "цей спосіб одразу щось полегшує, тому відмовлятися від нього складніше",
  "так зараз зручніше, а новий спосіб дії можна спробувати пізніше",
  "користь є прямо зараз, тому звичний спосіб легко залишити без змін",
  "цей спосіб швидко полегшує момент, а зміна потребує окремого зусилля",
  "зараз він дає коротке полегшення, а мінуси стають помітні пізніше"
]);

const GOALS_MANY_REASONS = Object.freeze([
  "нова ціль одразу дає інтерес, а вибирати одну головну поки не треба",
  "можна знову захопитися новим і ще не звужувати список цілей",
  "новизна приємна зараз, а рішення від чого відмовитися можна відкласти",
  "почати ще одну ціль цікаво одразу, а пріоритет можна не обирати",
  "новий старт дає енергію, а одну головну ціль можна поки не визначати",
  "можна додати ще одну ідею, не вирішуючи, що справді головне",
  "нова ціль швидко захоплює, а від другорядних поки не треба відмовлятися",
  "цікавість з’являється одразу, а звужувати вибір можна пізніше",
  "можна тримати багато напрямів відкритими й не обирати один зараз",
  "нові ідеї дають швидкий заряд, а пріоритет можна відкласти",
  "можна починати нове, не ставлячи крапку в інших цілях",
  "новизна відчувається приємно, а вибір головного напряму можна відкласти",
  "кожна нова ціль дає інтерес, тому одну головну можна ще не обирати",
  "можна лишити всі ідеї активними й поки не скорочувати список",
  "новий напрям одразу захоплює, а рішення про пріоритет можна не приймати",
  "можна знову відчути старт, не відмовляючись від інших цілей",
  "нова ідея швидко додає енергії, а звужувати цілі можна пізніше",
  "можна ще трохи збирати нові цілі, не вирішуючи, яка з них головна",
  "інтерес приходить одразу, а обирати меншу кількість цілей можна потім",
  "новий старт приємний зараз, а завершення зайвих напрямів можна відкласти"
]);

const SPECIAL_REASONS = Object.freeze({
  "goals/many": GOALS_MANY_REASONS
});

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

function normalizeBenefit(value = "") {
  let text = String(value || "").trim();
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
    ? sentence(`У такому способі дії ти ${firstCore} у ситуації «${topic[1]}»`)
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
