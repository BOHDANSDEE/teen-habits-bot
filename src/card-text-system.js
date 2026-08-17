import { CARD_TEXT_THEME_DATA_1 } from "./card-text-data-1.js";
import { CARD_TEXT_THEME_DATA_2 } from "./card-text-data-2.js";
import { CARD_TEXT_THEME_DATA_3 } from "./card-text-data-3.js";
import { CARD_TEXT_THEME_DATA_4 } from "./card-text-data-4.js";

export const POOL_SIZE = 4000;
export const LIFE_THEME_COUNT = 20;
export const LIFE_SUBTOPICS_PER_THEME = 10;
export const LIFE_THEME_POOL_SIZE = 200;
export const LIFE_SUBTOPIC_POOL_SIZE = 20;

const SECTIONS = Object.freeze(["problems", "gains", "meanings", "affirmations", "results"]);
const SPLIT = new Set(["problems", "meanings", "affirmations"]);
const RAW = Object.freeze([
  ...CARD_TEXT_THEME_DATA_1,
  ...CARD_TEXT_THEME_DATA_2,
  ...CARD_TEXT_THEME_DATA_3,
  ...CARD_TEXT_THEME_DATA_4
]);

const OPEN = Object.freeze(["Ти ", "Часом ти ", "Іноді ти ", "Буває, ти ", "Інколи ти ", "Деколи ти ", "Нерідко ти ", "Часто ти ", "У деякі дні ти ", "У звичних ситуаціях ти "]);
const THIRD = Object.freeze(["Так це закріплюється", "З часом це стає звичкою", "Так проблема повторюється", "Через це напруга зростає", "Так ти повертаєшся до того самого", "Цей спосіб закріплюється", "Один вибір тягне наступний", "Це забирає більше сил", "Так реакція стає автоматичною", "Через це змінюватися важче"]);
const GF = Object.freeze(["{area} це дає тобі {benefit}", "{area} на мить це дає тобі {benefit}", "{area} ненадовго це дає тобі {benefit}", "{area} тимчасово це дає тобі {benefit}", "{area} зараз це дає тобі {benefit}", "{area} спершу це дає тобі {benefit}", "{area} у цей момент це дає тобі {benefit}", "{area} на короткий час це дає тобі {benefit}", "{area} поки що це дає тобі {benefit}", "{area} спочатку це дає тобі {benefit}", "{area} так ти отримуєш {benefit}", "{area} на мить ти отримуєш {benefit}", "{area} ненадовго ти отримуєш {benefit}", "{area} тимчасово ти отримуєш {benefit}", "{area} зараз ти отримуєш {benefit}", "{area} спершу ти отримуєш {benefit}", "{area} у цей момент ти отримуєш {benefit}", "{area} на короткий час ти отримуєш {benefit}", "{area} поки що ти отримуєш {benefit}", "{area} спочатку ти отримуєш {benefit}"]);
const MF = Object.freeze(["{area} {principle}", "{area} важливо: {principle}", "{area} видно: {principle}", "{area} працює так: {principle}", "{area} корисно пам’ятати: {principle}", "{area} головне: {principle}", "{area} суть проста: {principle}", "{area} на практиці видно: {principle}", "{area} орієнтир такий: {principle}", "{area} принцип такий: {principle}"]);
const BODY = Object.freeze(["Ти відчуваєш менше напруги в плечах", "Ти відчуваєш, що дихати стало спокійніше", "Ти відчуваєш менше напруги в шиї", "Ти відчуваєш трохи легкості в грудях", "Ти відчуваєш, що живіт трохи розслабився", "Ти відчуваєш менше напруги в щелепі", "Ти відчуваєш, що спина трохи розслабилась", "Ти відчуваєш більше спокою в руках", "Ти відчуваєш, що в горлі стало вільніше", "Ти відчуваєш більше легкості в голові", "Ти відчуваєш, що тіло трохи розслабилось", "Ти відчуваєш, що плечі стали вільнішими", "Ти відчуваєш, що шия трохи розслабилась", "Ти відчуваєш, що дихати трохи легше", "Ти відчуваєш менше стискання в грудях", "Ти відчуваєш менше стискання в животі", "Ти відчуваєш, що щелепа стала м’якшою", "Ти відчуваєш більше легкості в спині", "Ти відчуваєш менше напруги в руках", "Ти відчуваєш більше спокою в голові"]);
const PAIRS = Object.freeze([[0, 1], [0, 2], [0, 3], [1, 0], [1, 2], [1, 3], [2, 0], [2, 1], [2, 3], [3, 0]]);
const TRIPLES = Object.freeze([[0, 1, 2], [0, 1, 3], [0, 2, 1], [0, 2, 3], [0, 3, 1], [1, 0, 2], [1, 0, 3], [1, 2, 0], [2, 0, 1], [3, 0, 1]]);

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const fill = (frame, values) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), frame);

if (RAW.length !== LIFE_THEME_COUNT) throw new Error("expected 20 life themes");
for (const theme of RAW) {
  if (theme[5].length !== LIFE_SUBTOPICS_PER_THEME) {
    throw new Error(`${theme[0]} must contain exactly 10 subtopics`);
  }
}

export const LIFE_RANDOM_THEMES = Object.freeze(RAW.map((theme) => Object.freeze({
  key: theme[0],
  name: theme[1],
  area: theme[2],
  subtopics: Object.freeze(theme[5].map((topic) => Object.freeze({
    key: topic[0],
    name: topic[1]
  })))
})));

const byKey = new Map(RAW.map((theme, index) => [theme[0], { theme, index }]));
const topicIndex = (themeIndex, subtopicIndex) =>
  themeIndex * LIFE_SUBTOPICS_PER_THEME + subtopicIndex;

function idx(section, themeIndex, subtopicIndex, style) {
  const normalizedStyle = ((style % LIFE_SUBTOPIC_POOL_SIZE) + LIFE_SUBTOPIC_POOL_SIZE) % LIFE_SUBTOPIC_POOL_SIZE;
  const topic = topicIndex(themeIndex, subtopicIndex);
  if (SPLIT.has(section)) {
    return (normalizedStyle >= 10 ? 2000 : 0) + topic * 10 + (normalizedStyle % 10);
  }
  return topic * LIFE_SUBTOPIC_POOL_SIZE + normalizedStyle;
}

function parts(topic) {
  return {
    key: topic[0],
    name: topic[1],
    behavior: topic[2],
    cost: topic[3],
    benefit: String(topic[4]).replace(/сценарій/giu, "спосіб"),
    principle: topic[5],
    permission: topic[6],
    choice: topic[7],
    alternative: topic[8],
    nextStep: topic[9]
  };
}

function buildProblem(topic, subtopicIndex, style) {
  const value = parts(topic);
  const local = style % 10;
  const first = sentence(`${OPEN[local]}${value.behavior}`);
  const second = sentence(`Через це ти ${value.cost}`);
  return style < 10
    ? `${first} ${second}`
    : `${first} ${second} ${sentence(THIRD[subtopicIndex])}`;
}

function buildGain(theme, topic, style) {
  const value = parts(topic);
  const first = sentence(fill(GF[style], {
    area: theme[2],
    benefit: value.benefit
  }));
  return `${first} Тому тобі вигідно залишатися у такому способі дій.`;
}

function buildMeaning(theme, topic, style) {
  const value = parts(topic);
  const first = sentence(fill(MF[style % 10], {
    area: theme[2],
    principle: value.principle
  }));
  return style < 10 ? first : `${first} ${theme[3]}`;
}

function buildAffirmation(theme, topic, style) {
  const value = parts(topic);
  const options = [
    sentence(`Я можу ${value.alternative}`),
    sentence(`Я маю право ${value.permission}`),
    sentence(`Я обираю ${value.choice}`),
    sentence(theme[4])
  ];
  const combo = style < 10 ? PAIRS[style] : TRIPLES[style - 10];
  return combo.map((index) => options[index]).join(" ");
}

function buildResult(topic, style) {
  const value = parts(topic);
  return [
    sentence(BODY[style]),
    sentence(`Тепер легше побачити інший спосіб дії: ${value.alternative}`),
    sentence(`Наступний крок ясніший: ${value.nextStep}`)
  ].join(" ");
}

const pools = {
  problems: Array(POOL_SIZE),
  gains: Array(POOL_SIZE),
  meanings: Array(POOL_SIZE),
  affirmations: Array(POOL_SIZE),
  results: Array(POOL_SIZE)
};

for (let themeIndex = 0; themeIndex < RAW.length; themeIndex += 1) {
  const theme = RAW[themeIndex];
  for (let subtopicIndex = 0; subtopicIndex < theme[5].length; subtopicIndex += 1) {
    const topic = theme[5][subtopicIndex];
    for (let style = 0; style < LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
      pools.problems[idx("problems", themeIndex, subtopicIndex, style)] =
        buildProblem(topic, subtopicIndex, style);
      pools.gains[idx("gains", themeIndex, subtopicIndex, style)] =
        buildGain(theme, topic, style);
      pools.meanings[idx("meanings", themeIndex, subtopicIndex, style)] =
        buildMeaning(theme, topic, style);
      pools.affirmations[idx("affirmations", themeIndex, subtopicIndex, style)] =
        buildAffirmation(theme, topic, style);
      pools.results[idx("results", themeIndex, subtopicIndex, style)] =
        buildResult(topic, style);
    }
  }
}

export const INDEPENDENT_LIFE_POOLS = Object.freeze(
  Object.fromEntries(Object.entries(pools).map(([key, pool]) => [key, Object.freeze(pool)]))
);

for (const [section, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  if (pool.length !== POOL_SIZE || new Set(pool).size !== POOL_SIZE || pool.some((text) => !text)) {
    throw new Error(`${section} must contain exactly ${POOL_SIZE} unique visible texts`);
  }
}

export function getLifeThemePoolIndices(themeKey, section) {
  const entry = byKey.get(themeKey);
  if (!entry) throw new Error(`unknown life theme: ${themeKey}`);
  if (!SECTIONS.includes(section)) throw new Error(`unknown life pool section: ${section}`);
  return entry.theme[5].flatMap((_, subtopicIndex) =>
    Array.from({ length: LIFE_SUBTOPIC_POOL_SIZE }, (_, style) =>
      idx(section, entry.index, subtopicIndex, style)
    )
  );
}

export function getLifeSubtopicPoolIndices(themeKey, subtopicKey, section) {
  const entry = byKey.get(themeKey);
  if (!entry) throw new Error(`unknown life theme: ${themeKey}`);
  if (!SECTIONS.includes(section)) throw new Error(`unknown life pool section: ${section}`);
  const subtopicIndex = entry.theme[5].findIndex((topic) => topic[0] === subtopicKey);
  if (subtopicIndex < 0) throw new Error(`unknown life subtopic: ${themeKey}/${subtopicKey}`);
  return Array.from({ length: LIFE_SUBTOPIC_POOL_SIZE }, (_, style) =>
    idx(section, entry.index, subtopicIndex, style)
  );
}

const normalize = (value, modulo) => ((value % modulo) + modulo) % modulo;
const randomIndex = (size) => Math.floor(Math.random() * size);
const OFFSETS = Object.freeze({
  problems: 0,
  gains: 3,
  meanings: 7,
  affirmations: 11,
  results: 15
});

export function getIndependentLifeVariant(requestedVariant = null) {
  let themeIndex;
  let subtopicIndex;
  let styles;

  if (Number.isInteger(requestedVariant)) {
    const normalized = normalize(requestedVariant, POOL_SIZE);
    themeIndex = normalized % LIFE_THEME_COUNT;
    subtopicIndex = Math.floor(normalized / LIFE_THEME_COUNT) % LIFE_SUBTOPICS_PER_THEME;
    const baseStyle = Math.floor(normalized / (LIFE_THEME_COUNT * LIFE_SUBTOPICS_PER_THEME)) % LIFE_SUBTOPIC_POOL_SIZE;
    styles = Object.fromEntries(SECTIONS.map((section) => [
      section,
      (baseStyle + OFFSETS[section]) % LIFE_SUBTOPIC_POOL_SIZE
    ]));
  } else {
    themeIndex = randomIndex(LIFE_THEME_COUNT);
    subtopicIndex = randomIndex(LIFE_SUBTOPICS_PER_THEME);
    styles = Object.fromEntries(SECTIONS.map((section) => [
      section,
      randomIndex(LIFE_SUBTOPIC_POOL_SIZE)
    ]));
  }

  const theme = RAW[themeIndex];
  const subtopic = theme[5][subtopicIndex];
  const problemIndex = idx("problems", themeIndex, subtopicIndex, styles.problems);
  const gainIndex = idx("gains", themeIndex, subtopicIndex, styles.gains);
  const meaningIndex = idx("meanings", themeIndex, subtopicIndex, styles.meanings);
  const affirmationIndex = idx("affirmations", themeIndex, subtopicIndex, styles.affirmations);
  const resultIndex = idx("results", themeIndex, subtopicIndex, styles.results);

  return {
    themeIndex,
    themeKey: theme[0],
    themeName: theme[1],
    subtopicIndex,
    subtopicKey: subtopic[0],
    subtopicName: subtopic[1],
    problemIndex,
    gainIndex,
    meaningIndex,
    affirmationIndex,
    resultIndex,
    problem: INDEPENDENT_LIFE_POOLS.problems[problemIndex],
    gain: INDEPENDENT_LIFE_POOLS.gains[gainIndex],
    meaning: INDEPENDENT_LIFE_POOLS.meanings[meaningIndex],
    affirmation: INDEPENDENT_LIFE_POOLS.affirmations[affirmationIndex],
    result: INDEPENDENT_LIFE_POOLS.results[resultIndex]
  };
}
