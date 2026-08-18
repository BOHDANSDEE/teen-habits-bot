import { CARD_TEXT_THEME_DATA_1 } from "./card-text-data-1.js";
import { CARD_TEXT_THEME_DATA_2 } from "./card-text-data-2.js";
import { CARD_TEXT_THEME_DATA_3 } from "./card-text-data-3.js";
import { CARD_TEXT_THEME_DATA_4 } from "./card-text-data-4.js";

export const POOL_SIZE = 4000;
export const LIFE_THEME_COUNT = 20;
export const LIFE_SUBTOPICS_PER_THEME = 10;
export const LIFE_THEME_POOL_SIZE = 200;
export const LIFE_SUBTOPIC_POOL_SIZE = 20;
export const ACCEPTANCE_YES_CHANCE = 0.5;
export const ACCEPTANCE_MAX_ATTEMPTS = LIFE_THEME_COUNT;

const SECTIONS = Object.freeze(["problems", "gains", "meanings", "affirmations", "results"]);
const SPLIT = new Set(["problems", "meanings", "affirmations"]);
const RAW = Object.freeze([
  ...CARD_TEXT_THEME_DATA_1,
  ...CARD_TEXT_THEME_DATA_2,
  ...CARD_TEXT_THEME_DATA_3,
  ...CARD_TEXT_THEME_DATA_4
]);

const PROBLEM_OPENERS = Object.freeze([
  "ти ",
  "іноді ти ",
  "часом ти ",
  "буває, ти ",
  "інколи ти ",
  "часто ти ",
  "буває так, що ти ",
  "час від часу ти ",
  "іноді буває, що ти ",
  "у деякі моменти ти "
]);

const GAIN_PREFIXES = Object.freeze([
  "",
  "на мить ",
  "зараз ",
  "одразу ",
  "спочатку ",
  "ненадовго ",
  "у цей момент ",
  "поки нічого не змінюєш, ",
  "коли дієш як звик, ",
  "якщо залишити все як є, "
]);

const GAIN_ENDINGS = Object.freeze([
  "Тому тобі вигідно залишатися у такому способі дій — так зараз легше нічого не змінювати.",
  "Тому тобі вигідно залишатися у такому способі дій — зміни можна відкласти ще трохи."
]);

const MEANING_FRAMES = Object.freeze([
  "{label}: {cost}",
  "{label}: через це {cost}",
  "{label}: з часом {cost}",
  "{label}: у таких ситуаціях {cost}",
  "{label}: коли це повторюється, {cost}",
  "{label}: через цю звичку {cost}",
  "{label}: у підсумку {cost}",
  "{label}: так {cost}",
  "{label}: якщо нічого не змінювати, {cost}",
  "{label}: коли це стає звичкою, {cost}"
]);

const BODY = Object.freeze([
  "Ти відчуваєш менше напруги в плечах",
  "Ти відчуваєш, що дихати стало спокійніше",
  "Ти відчуваєш менше напруги в шиї",
  "Ти відчуваєш трохи легкості в грудях",
  "Ти відчуваєш, що живіт трохи розслабився",
  "Ти відчуваєш менше напруги в щелепі",
  "Ти відчуваєш, що спина трохи розслабилась",
  "Ти відчуваєш більше спокою в руках",
  "Ти відчуваєш, що в горлі стало вільніше",
  "Ти відчуваєш більше легкості в голові",
  "Ти відчуваєш, що тіло трохи розслабилось",
  "Ти відчуваєш, що плечі стали вільнішими",
  "Ти відчуваєш, що шия трохи розслабилась",
  "Ти відчуваєш, що дихати трохи легше",
  "Ти відчуваєш менше стискання в грудях",
  "Ти відчуваєш менше стискання в животі",
  "Ти відчуваєш, що щелепа стала м’якшою",
  "Ти відчуваєш більше легкості в спині",
  "Ти відчуваєш менше напруги в руках",
  "Ти відчуваєш більше спокою в голові"
]);

const PAIRS = Object.freeze([
  [0, 1], [0, 2], [0, 3], [1, 0], [1, 2],
  [1, 3], [2, 0], [2, 1], [2, 3], [3, 0]
]);
const TRIPLES = Object.freeze([
  [0, 1, 2], [0, 1, 3], [0, 2, 1], [0, 2, 3], [0, 3, 1],
  [1, 0, 2], [1, 0, 3], [1, 2, 0], [2, 0, 1], [3, 0, 1]
]);

const THEME_CONTEXT = Object.freeze({
  friends: "У дружбі",
  family: "У сім’ї",
  study: "Під час навчання",
  money: "Коли йдеться про гроші,",
  health: "Коли дбаєш про здоров’я,",
  sleep: "Коли йдеться про сон,",
  household: "У побуті",
  "self-esteem": "Коли оцінюєш себе,",
  future: "Коли думаєш про майбутнє,",
  rest: "Під час відпочинку",
  "social-media": "У соцмережах",
  work: "У роботі",
  sport: "У спорті",
  boundaries: "Коли йдеться про твої межі,",
  communication: "У спілкуванні",
  decisions: "Коли треба зробити вибір,",
  goals: "Коли працюєш над ціллю,",
  emotions: "Коли емоції сильні,",
  responsibility: "Коли відповідаєш за справу,",
  development: "Коли працюєш над собою,"
});

const THEME_LABEL = Object.freeze({
  friends: "Дружба",
  family: "Сім’я",
  study: "Навчання",
  money: "Гроші",
  health: "Здоров’я",
  sleep: "Сон",
  household: "Побут",
  "self-esteem": "Самооцінка",
  future: "Майбутнє",
  rest: "Відпочинок",
  "social-media": "Соцмережі",
  work: "Робота",
  sport: "Спорт",
  boundaries: "Особисті межі",
  communication: "Спілкування",
  decisions: "Рішення",
  goals: "Цілі",
  emotions: "Емоції",
  responsibility: "Відповідальність",
  development: "Особистий розвиток"
});

const THEME_PROBLEM_TAIL = Object.freeze({
  friends: "Так у дружбі стає менше прямоти.",
  family: "Так удома накопичується напруга.",
  study: "Так навчання забирає більше сил.",
  money: "Так гроші частіше додають напруги.",
  health: "Так легше пропустити прості потреби тіла.",
  sleep: "Так режим сну збивається ще більше.",
  household: "Так домашні справи швидше накопичуються.",
  "self-esteem": "Так ти стаєш жорсткішим до себе.",
  future: "Так думки про майбутнє забирають більше уваги.",
  rest: "Так відпочинок гірше повертає сили.",
  "social-media": "Так соцмережі забирають більше часу й уваги.",
  work: "Так робочий день стає напруженішим.",
  sport: "Так складніше тримати стабільний ритм руху.",
  boundaries: "Так ти частіше поступаєшся своїми межами.",
  communication: "Так у розмовах стає більше непорозумінь.",
  decisions: "Так вибір забирає більше сил.",
  goals: "Так рух до цілі частіше переривається.",
  emotions: "Так емоція довше керує твоєю реакцією.",
  responsibility: "Так на домовленості складніше покладатися.",
  development: "Так зміни частіше йдуть ривками."
});

const THEME_IMPACT = Object.freeze({
  friends: "Через це дружба стає менш відкритою.",
  family: "Через це вдома стає більше напруги й непорозумінь.",
  study: "Через це навчання забирає зайві сили й час.",
  money: "Через це фінансові рішення стають менш передбачуваними.",
  health: "Через це складніше вчасно помічати свої потреби.",
  sleep: "Через це режим сну стає менш стабільним.",
  household: "Через це побут забирає більше часу й уваги.",
  "self-esteem": "Через це одна невдача сильніше впливає на оцінку себе.",
  future: "Через це невизначеність забирає більше уваги.",
  rest: "Через це відпочинок гірше повертає сили.",
  "social-media": "Через це менше часу лишається на сон, справи або відпочинок.",
  work: "Через це робочий день стає напруженішим.",
  sport: "Через це складніше тримати стабільний ритм руху.",
  boundaries: "Через це твої потреби й межі частіше відсуваються.",
  communication: "Через це в розмовах накопичуються непорозуміння.",
  decisions: "Через це вибір забирає більше часу й сил.",
  goals: "Через це рух до цілі стає менш послідовним.",
  emotions: "Через це емоція частіше керує реакцією замість тебе.",
  responsibility: "Через це тобі й іншим складніше покладатися на домовленості.",
  development: "Через це зміни частіше йдуть ривками."
});

const CLARITY_REPLACEMENTS = Object.freeze([
  ["постійний новий стимул", "можливість постійно бачити щось нове"],
  ["швидкий стимул без зусиль", "можливість одразу побачити щось нове"],
  ["можливість швидко отримувати новий стимул", "можливість швидко побачити щось нове"],
  ["можливість отримувати легкі стимули без зусиль", "можливість без зусиль бачити щось нове"],
  ["швидкий потік нових стимулів", "можливість одразу перемкнутися на щось нове"],
  ["можливість не переривати приємний стимул", "можливість ще трохи не зупиняти приємний перегляд"],
  ["можливість не залишатися без стимулу", "можливість не залишатися без нових картинок і повідомлень"],
  ["можливість не переривати потік", "можливість не відриватися від екрана"],
  ["дозволяти собі неідеальний контент", "дозволяти собі неідеальні публікації"],
  ["не тримати контент, який постійно шкодить настрою", "не залишати в стрічці те, що постійно псує настрій"],
  ["залишатися з фантазією замість досвіду", "залишатися лише з уявленням замість реального досвіду"],
  ["готовий зовнішній критерій успіху", "готову чужу мірку успіху"],
  ["готову зовнішню мірку", "готову чужу мірку"],
  ["простий видимий критерій", "простий зрозумілий орієнтир"],
  ["швидкий вихід напруги", "можливість швидко випустити напругу"],
  ["можливість швидко завершити момент вибору", "можливість одразу відповісти й не думати далі"],
  ["коли ресурс уже закінчується", "коли сил уже майже немає"],
  ["перевірити критерій готовності", "перевірити, чи виконані головні вимоги"],
  ["мати один зрозумілий критерій", "мати один зрозумілий орієнтир"],
  ["записати два головні критерії", "записати дві головні умови вибору"],
  ["записати три критерії", "записати три важливі умови"],
  ["зі своїми критеріями", "зі своїми умовами вибору"],
  ["поставити точку завершення вечора", "вирішити, о котрій закінчуєш вечір"],
  ["поставити зрозумілу межу денній паузі", "вирішити наперед, скільки триватиме денний сон"],
  ["новизну й відчуття нового старту", "відчуття нового старту"],
  ["можливість мати красивий намір без конкретного зобов’язання", "можливість мати хорошу ідею й поки нічого не робити"],
  ["можливість не зустрічатися з конкретним результатом", "можливість не перевіряти, чи справді є прогрес"],
  ["можливість ще не брати наслідки вибору", "можливість ще трохи не відповідати за вибір"],
  ["зробити зворотний пробний крок", "зробити невелику пробу, якщо рішення можна змінити"],
  ["сценарій", "спосіб"],
  ["патерн", "звичка"]
]);

const TOPIC_OVERRIDES = Object.freeze({
  "social-media/scroll": Object.freeze({
    behavior: "продовжуєш гортати стрічку соцмереж після того, як уже хотів зупинитися",
    cost: "відкладаєш сон або інші справи",
    benefit: "можливість постійно бачити щось нове",
    permission: "самому вирішувати, скільки часу провести у стрічці",
    alternative: "заздалегідь вирішити, скільки часу провести у стрічці",
    nextStep: "закрити соцмережу, коли цей час мине"
  }),
  "social-media/auto": Object.freeze({
    behavior: "відкриваєш стрічку соцмереж автоматично, навіть без конкретної причини",
    benefit: "можливість одразу побачити щось нове",
    alternative: "запитати себе, навіщо відкриваєш стрічку",
    nextStep: "не відкривати соцмережу, якщо конкретної причини немає"
  }),
  "social-media/limits": Object.freeze({
    benefit: "можливість ще трохи не зупиняти перегляд",
    alternative: "не продовжувати ліміт часу автоматично",
    nextStep: "закрити стрічку, коли ліміт часу закінчиться"
  }),
  "sleep/phone": Object.freeze({
    benefit: "можливість без зусиль бачити щось нове перед сном"
  }),
  "sleep/nap": Object.freeze({
    alternative: "заздалегідь вирішити, скільки триватиме денний сон",
    nextStep: "поставити будильник на обраний час"
  }),
  "rest/scroll": Object.freeze({
    benefit: "можливість одразу перемкнутися на щось нове",
    alternative: "відкласти телефон і зробити коротку паузу без стрічки",
    nextStep: "провести кілька хвилин без телефона"
  }),
  "health/screen": Object.freeze({
    benefit: "можливість не відриватися від екрана"
  }),
  "work/finish": Object.freeze({
    alternative: "перевірити, чи виконані головні вимоги",
    nextStep: "завершити роботу, якщо головні вимоги вже виконані"
  }),
  "goals/measure": Object.freeze({
    permission: "мати один зрозумілий орієнтир прогресу",
    alternative: "обрати один зрозумілий показник прогресу",
    nextStep: "перевіряти його раз на тиждень"
  }),
  "decisions/mistake": Object.freeze({
    alternative: "перевірити, чи можна змінити рішення пізніше",
    nextStep: "зробити невелику пробу, якщо рішення можна змінити"
  })
});

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const fill = (frame, values) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), frame);

const normalizePhrase = (value = "") => {
  let text = String(value || "").trim();
  for (const [from, to] of CLARITY_REPLACEMENTS) text = text.replaceAll(from, to);
  return text;
};

const contextFor = (theme) => THEME_CONTEXT[theme[0]] || theme[2] || `У темі «${theme[1]}»`;
const labelFor = (theme) => THEME_LABEL[theme[0]] || theme[1];

function benefitAction(benefit) {
  const value = normalizePhrase(benefit);
  if (/^можливість\s+/u.test(value)) return `ти можеш ${value.replace(/^можливість\s+/u, "")}`;
  if (/^відчуття,?\s+що\s+/u.test(value)) return `ти відчуваєш, що ${value.replace(/^відчуття,?\s+що\s+/u, "")}`;
  if (/^відчуття\s+/u.test(value)) return `ти відчуваєш ${value.replace(/^відчуття\s+/u, "")}`;
  return `ти отримуєш ${value}`;
}

if (RAW.length !== LIFE_THEME_COUNT) throw new Error("expected 20 life themes");
for (const theme of RAW) {
  if (theme[5].length !== LIFE_SUBTOPICS_PER_THEME) {
    throw new Error(`${theme[0]} must contain exactly 10 subtopics`);
  }
}

export const LIFE_RANDOM_THEMES = Object.freeze(RAW.map((theme) => Object.freeze({
  key: theme[0],
  name: theme[1],
  area: labelFor(theme),
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

function parts(theme, topic) {
  const base = {
    key: topic[0],
    name: topic[1],
    behavior: normalizePhrase(topic[2]),
    cost: normalizePhrase(topic[3]),
    benefit: normalizePhrase(topic[4]),
    principle: normalizePhrase(topic[5]),
    permission: normalizePhrase(topic[6]),
    choice: normalizePhrase(topic[7]),
    alternative: normalizePhrase(topic[8]),
    nextStep: normalizePhrase(topic[9])
  };
  const override = TOPIC_OVERRIDES[`${theme[0]}/${topic[0]}`] || {};
  return { ...base, ...override };
}

function buildProblem(theme, topic, style) {
  const value = parts(theme, topic);
  const local = style % 10;
  const first = sentence(`${contextFor(theme)} ${PROBLEM_OPENERS[local]}${value.behavior}`);
  const second = sentence(`Через це ${value.cost}`);
  return style < 10
    ? `${first} ${second}`
    : `${first} ${second} ${THEME_PROBLEM_TAIL[theme[0]]}`;
}

function buildGain(theme, topic, style) {
  const value = parts(theme, topic);
  const local = style % 10;
  const first = sentence(`${contextFor(theme)} ${GAIN_PREFIXES[local]}${benefitAction(value.benefit)}`);
  const second = GAIN_ENDINGS[style < 10 ? 0 : 1];
  return `${first} ${second}`;
}

function buildMeaning(theme, topic, style) {
  const value = parts(theme, topic);
  const first = sentence(fill(MEANING_FRAMES[style % 10], {
    label: labelFor(theme),
    cost: value.cost
  }));
  return style < 10 ? first : `${first} ${THEME_IMPACT[theme[0]]}`;
}

function buildAffirmation(theme, topic, style) {
  const value = parts(theme, topic);
  const options = [
    sentence(`Я можу ${value.alternative}`),
    sentence(`Я маю право ${value.permission}`),
    sentence(`Я можу ${value.nextStep}`),
    sentence(normalizePhrase(theme[4]))
  ];
  const combo = style < 10 ? PAIRS[style] : TRIPLES[style - 10];
  return combo.map((index) => options[index]).join(" ");
}

function buildResult(theme, topic, style) {
  const value = parts(theme, topic);
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
        buildProblem(theme, topic, style);
      pools.gains[idx("gains", themeIndex, subtopicIndex, style)] =
        buildGain(theme, topic, style);
      pools.meanings[idx("meanings", themeIndex, subtopicIndex, style)] =
        buildMeaning(theme, topic, style);
      pools.affirmations[idx("affirmations", themeIndex, subtopicIndex, style)] =
        buildAffirmation(theme, topic, style);
      pools.results[idx("results", themeIndex, subtopicIndex, style)] =
        buildResult(theme, topic, style);
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

function buildVariant(themeIndex, subtopicIndex, styles, selection = {}) {
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
    result: INDEPENDENT_LIFE_POOLS.results[resultIndex],
    rouletteApplied: Boolean(selection.rouletteApplied),
    rouletteAttempts: selection.rouletteAttempts || 1,
    rejectedThemeKeys: Object.freeze([...(selection.rejectedThemeKeys || [])]),
    forcedAcceptance: Boolean(selection.forcedAcceptance)
  };
}

function randomStyles() {
  return Object.fromEntries(SECTIONS.map((section) => [section, randomIndex(LIFE_SUBTOPIC_POOL_SIZE)]));
}

function randomThemeOutside(rejectedThemeIndices) {
  const available = Array.from({ length: LIFE_THEME_COUNT }, (_, index) => index)
    .filter((index) => !rejectedThemeIndices.has(index));
  if (!available.length) return null;
  return available[randomIndex(available.length)];
}

export function getIndependentLifeVariant(requestedVariant = null) {
  if (Number.isInteger(requestedVariant)) {
    const normalized = normalize(requestedVariant, POOL_SIZE);
    const themeIndex = normalized % LIFE_THEME_COUNT;
    const subtopicIndex = Math.floor(normalized / LIFE_THEME_COUNT) % LIFE_SUBTOPICS_PER_THEME;
    const baseStyle = Math.floor(normalized / (LIFE_THEME_COUNT * LIFE_SUBTOPICS_PER_THEME)) % LIFE_SUBTOPIC_POOL_SIZE;
    const styles = Object.fromEntries(SECTIONS.map((section) => [
      section,
      (baseStyle + OFFSETS[section]) % LIFE_SUBTOPIC_POOL_SIZE
    ]));
    return buildVariant(themeIndex, subtopicIndex, styles);
  }

  const rejectedThemeIndices = new Set();
  const rejectedThemeKeys = [];

  for (let attempt = 1; attempt <= ACCEPTANCE_MAX_ATTEMPTS; attempt += 1) {
    const themeIndex = randomThemeOutside(rejectedThemeIndices);
    if (themeIndex == null) break;
    const subtopicIndex = randomIndex(LIFE_SUBTOPICS_PER_THEME);
    const styles = randomStyles();
    const candidate = buildVariant(themeIndex, subtopicIndex, styles, {
      rouletteApplied: true,
      rouletteAttempts: attempt,
      rejectedThemeKeys
    });

    const isLastAvailableTheme = rejectedThemeIndices.size === LIFE_THEME_COUNT - 1;
    const accepted = Math.random() < ACCEPTANCE_YES_CHANCE;
    if (accepted || isLastAvailableTheme) {
      return {
        ...candidate,
        rejectedThemeKeys: Object.freeze([...rejectedThemeKeys]),
        forcedAcceptance: !accepted && isLastAvailableTheme
      };
    }

    rejectedThemeIndices.add(themeIndex);
    rejectedThemeKeys.push(candidate.themeKey);
  }

  throw new Error("acceptance roulette failed to choose a life theme");
}
