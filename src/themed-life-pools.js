import {
  POOL_SIZE,
  INDEPENDENT_LIFE_POOLS as BASE_POOLS
} from "./independent-life-pools-v4.js";

const BASE_ROW_COUNT = 40;
const SECTION_KEYS = Object.freeze([
  "problems",
  "gains",
  "meanings",
  "affirmations",
  "results"
]);

const freezePair = (pair) => Object.freeze([...pair]);

const makeTheme = (key, name, corePair, meaningPair = corePair) => Object.freeze({
  key,
  name,
  subpools: Object.freeze({
    problems: freezePair(corePair),
    gains: freezePair(corePair),
    meanings: freezePair(meaningPair),
    affirmations: freezePair(corePair),
    results: freezePair(corePair)
  })
});

export const LIFE_RANDOM_THEMES = Object.freeze([
  makeTheme("friends", "Друзі", [0, 1]),
  makeTheme("family", "Сім’я", [2, 3]),
  makeTheme("study", "Навчання", [4, 5]),
  makeTheme("money", "Гроші", [6, 7]),
  makeTheme("health", "Здоров’я", [8, 9]),
  makeTheme("sleep", "Сон", [10, 11]),
  makeTheme("household", "Побут", [12, 13]),
  makeTheme("self-esteem", "Самооцінка", [14, 15]),
  makeTheme("future", "Майбутнє", [16, 17]),
  makeTheme("rest", "Відпочинок", [18, 19]),
  makeTheme("social-media", "Соцмережі", [20, 21]),
  makeTheme("work", "Робота", [22, 23]),
  makeTheme("sport", "Спорт", [24, 25]),
  makeTheme("boundaries", "Особисті межі", [26, 27]),
  makeTheme("communication", "Спілкування", [28, 33], [28, 29]),
  makeTheme("decisions", "Рішення", [29, 31], [30, 31]),
  makeTheme("goals", "Цілі", [30, 37], [32, 33]),
  makeTheme("emotions", "Емоції", [32, 38], [34, 35]),
  makeTheme("responsibility", "Відповідальність", [34, 35], [36, 37]),
  makeTheme("development", "Особистий розвиток", [36, 39], [38, 39])
]);

export const LIFE_THEME_COUNT = LIFE_RANDOM_THEMES.length;
export const LIFE_THEME_POOL_SIZE = POOL_SIZE / LIFE_THEME_COUNT;

if (!Number.isInteger(LIFE_THEME_POOL_SIZE) || LIFE_THEME_POOL_SIZE !== 200) {
  throw new Error("the 4000-text pool must split evenly into 20 themes of 200 texts");
}

for (const section of SECTION_KEYS) {
  const baseRows = LIFE_RANDOM_THEMES.flatMap((theme) => theme.subpools[section]);
  const sortedRows = [...baseRows].sort((a, b) => a - b);
  if (
    baseRows.length !== BASE_ROW_COUNT ||
    new Set(baseRows).size !== BASE_ROW_COUNT ||
    sortedRows.some((value, index) => value !== index)
  ) {
    throw new Error(`${section}: thematic subpools must partition all ${BASE_ROW_COUNT} semantic rows exactly once`);
  }
}

export const INDEPENDENT_LIFE_POOLS = BASE_POOLS;
export { POOL_SIZE };

const normalize = (value, modulo) => ((value % modulo) + modulo) % modulo;

function indexInsideTheme(theme, section, slot) {
  const normalizedSlot = normalize(slot, LIFE_THEME_POOL_SIZE);
  const pair = theme.subpools[section];
  const baseIndex = pair[normalizedSlot % pair.length];
  const stylePosition = Math.floor(normalizedSlot / pair.length);
  return baseIndex + BASE_ROW_COUNT * stylePosition;
}

export function getLifeThemePoolIndices(themeKey, section) {
  const theme = LIFE_RANDOM_THEMES.find((item) => item.key === themeKey);
  if (!theme) throw new Error(`unknown life theme: ${themeKey}`);
  if (!SECTION_KEYS.includes(section)) throw new Error(`unknown life pool section: ${section}`);

  return Array.from(
    { length: LIFE_THEME_POOL_SIZE },
    (_, slot) => indexInsideTheme(theme, section, slot)
  );
}

const randomIndex = (size) => Math.floor(Math.random() * size);
const DETERMINISTIC_OFFSETS = Object.freeze({
  problems: 0,
  gains: 37,
  meanings: 74,
  affirmations: 111,
  results: 148
});

export function getIndependentLifeVariant(requestedVariant = null) {
  let themeIndex;
  let slots;

  if (Number.isInteger(requestedVariant)) {
    const normalized = normalize(requestedVariant, POOL_SIZE);
    themeIndex = normalized % LIFE_THEME_COUNT;
    const baseSlot = Math.floor(normalized / LIFE_THEME_COUNT) % LIFE_THEME_POOL_SIZE;
    slots = Object.fromEntries(
      SECTION_KEYS.map((section) => [
        section,
        (baseSlot + DETERMINISTIC_OFFSETS[section]) % LIFE_THEME_POOL_SIZE
      ])
    );
  } else {
    themeIndex = randomIndex(LIFE_THEME_COUNT);
    slots = Object.fromEntries(
      SECTION_KEYS.map((section) => [section, randomIndex(LIFE_THEME_POOL_SIZE)])
    );
  }

  const theme = LIFE_RANDOM_THEMES[themeIndex];
  const problemIndex = indexInsideTheme(theme, "problems", slots.problems);
  const gainIndex = indexInsideTheme(theme, "gains", slots.gains);
  const meaningIndex = indexInsideTheme(theme, "meanings", slots.meanings);
  const affirmationIndex = indexInsideTheme(theme, "affirmations", slots.affirmations);
  const resultIndex = indexInsideTheme(theme, "results", slots.results);

  return {
    themeIndex,
    themeKey: theme.key,
    themeName: theme.name,
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
