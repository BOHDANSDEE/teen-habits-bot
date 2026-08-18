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
  "Ти ",
  "Іноді ти ",
  "Часто ти ",
  "Буває, що ти ",
  "Часом ти ",
  "Інколи ти ",
  "Деколи ти ",
  "Нерідко ти ",
  "У деякі дні ти ",
  "У знайомій ситуації ти "
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

const MEANING_FRAMES = Object.freeze([
  "{context} ти {cost}",
  "{context} через це ти {cost}",
  "{context} тому ти {cost}",
  "{context} з часом ти {cost}",
  "{context} у підсумку ти {cost}",
  "{context} так ти {cost}",
  "{context} через цю звичку ти {cost}",
  "{context} через таку реакцію ти {cost}",
  "{context} через такий вибір ти {cost}",
  "{context} через цей спосіб ти {cost}"
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

const THEME_PROBLEM_TAIL = Object.freeze({
  friends: "Так ти частіше мовчиш або підлаштовуєшся.",
  family: "Так удома легше накопичується напруга.",
  study: "Так навчання забирає більше сил, ніж потрібно.",
  money: "Так з грошима стає більше напруги.",
  health: "Так свої потреби легше пропустити.",
  sleep: "Так режим сну збивається ще сильніше.",
  household: "Так домашні справи швидше накопичуються.",
  "self-esteem": "Так ти частіше знецінюєш себе.",
  future: "Так думки про майбутнє забирають більше сил.",
  rest: "Так навіть після відпочинку сил повертається менше.",
  "social-media": "Так телефон забирає більше часу, ніж ти планував.",
  work: "Так робочий день виснажує сильніше.",
  sport: "Так тренування стають менш регулярними.",
  boundaries: "Так ти частіше відсуваєш власні межі.",
  communication: "Так у розмовах стає більше непорозумінь.",
  decisions: "Так навіть простий вибір забирає більше сил.",
  goals: "Так рух до цілі постійно збивається.",
  emotions: "Так емоція довше керує твоєю реакцією.",
  responsibility: "Так домовленості частіше залишаються невиконаними.",
  development: "Так прогрес частіше йде ривками."
});

const THEME_IMPACT = Object.freeze({
  friends: "Через це у дружбі стає менше довіри й прямоти.",
  family: "Через це вдома стає важче домовлятися.",
  study: "Через це навчання забирає більше часу й сил.",
  money: "Через це з грошима стає більше напруги.",
  health: "Через це свої потреби легше пропустити.",
  sleep: "Через це режим сну стає менш стабільним.",
  household: "Через це домашні справи швидше накопичуються.",
  "self-esteem": "Через це одна невдача сильніше впливає на оцінку себе.",
  future: "Через це думки про майбутнє забирають більше уваги.",
  rest: "Через це відпочинок гірше повертає сили.",
  "social-media": "Через це менше часу лишається на сон, справи або відпочинок.",
  work: "Через це робочий день стає напруженішим.",
  sport: "Через це складніше тримати регулярний рух.",
  boundaries: "Через це власні потреби й межі частіше відсуваються.",
  communication: "Через це в розмовах стає більше непорозумінь.",
  decisions: "Через це навіть простий вибір забирає більше часу й сил.",
  goals: "Через це рух до цілі стає менш послідовним.",
  emotions: "Через це емоція частіше керує реакцією замість тебе.",
  responsibility: "Через це тобі й іншим важче покладатися на домовленості.",
  development: "Через це прогрес частіше йде ривками."
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
  ["критерій готовності", "чітка ознака готовності"],
  ["перевірити критерій готовності", "перевірити, чи виконані головні вимоги"],
  ["коли ресурс уже закінчується", "коли сил уже майже немає"],
  ["час теж є ресурсом, для якого можна ставити межі", "твій час теж потребує меж"],
  ["не вимагати від себе досвіду до досвіду", "не вимагати від себе вмінь, яких ще не встиг набути"],
  ["вважаєш, що з родиною не можна мати окремих меж", "думаєш, що з рідними не можна мати власні межі"],
  ["можливість не руйнувати звичний порядок", "можливість не змінювати звичний порядок"],
  ["говорити про них без віддалення", "говорити про свої межі без сварки"]
]);

const TOPIC_OVERRIDES = Object.freeze({
  "social-media/scroll": Object.freeze({
    behavior: "продовжуєш гортати стрічку соцмереж після того, як уже хотів зупинитися",
    cost: "відкладаєш сон або інші справи",
    benefit: "можливість постійно бачити щось нове",
    principle: "заздалегідь визначений час допомагає не втрачати пів години непомітно",
    permission: "самому вирішувати час у стрічці",
    choice: "зупинятися у визначений момент",
    alternative: "визначити час для стрічки наперед",
    nextStep: "закрити соцмережу, коли час мине"
  }),
  "social-media/auto": Object.freeze({
    behavior: "відкриваєш стрічку соцмереж автоматично, навіть без конкретної причини",
    benefit: "можливість одразу побачити щось нове",
    alternative: "запитати себе, навіщо відкриваю стрічку",
    nextStep: "не відкривати соцмережу без причини"
  }),
  "sleep/phone": Object.freeze({
    benefit: "можливість без зусиль бачити щось нове перед сном"
  }),
  "rest/scroll": Object.freeze({
    benefit: "можливість одразу перемкнутися на щось нове",
    alternative: "відкласти телефон і зробити коротку паузу без стрічки",
    nextStep: "провести кілька хвилин без телефона"
  }),
  "health/screen": Object.freeze({
    benefit: "можливість не відриватися від екрана"
  }),
  "boundaries/family": Object.freeze({
    behavior: "думаєш, що з рідними не можна мати власні межі",
    cost: "частіше терпиш те, що тобі не підходить",
    benefit: "можливість не змінювати звичний порядок",
    permission: "мати власні межі навіть з близькими",
    choice: "говорити про свої межі без сварки",
    alternative: "спокійно назвати одну свою межу",
    nextStep: "пояснити, що саме тобі не підходить"
  })
});

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const capitalize = (text = "") => {
  const value = String(text || "");
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "";
};

const lowerFirst = (text = "") => {
  const value = String(text || "").trim();
  return value ? `${value[0].toLowerCase()}${value.slice(1)}` : "";
};

const fill = (frame, values) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), frame);

const normalizePhrase = (value = "") => {
  let text = String(value || "").trim().replace(/сценарій/giu, "спосіб");
  for (const [from, to] of CLARITY_REPLACEMENTS) text = text.replaceAll(from, to);
  return text;
};

const contextFor = (theme) => THEME_CONTEXT[theme[0]] || theme[2] || `У темі «${theme[1]}»`;

function gainBenefitClause(benefit) {
  const value = normalizePhrase(benefit);
  if (/^можливість\s+/u.test(value)) return `тобі легше ${value.replace(/^можливість\s+/u, "")}`;
  if (/^відчуття(?:,|\s)/u.test(value)) return `ти зберігаєш ${value}`;
  return `ти отримуєш ${value}`;
}

function firstPersonAction(value = "") {
  return normalizePhrase(value)
    .replace(/\bколи ти зможеш\b/gu, "коли зможу")
    .replace(/\bтобі\b/gu, "мені")
    .replace(/\bтебе\b/gu, "мене")
    .replace(/\bтвої\b/gu, "мої")
    .replace(/\bтвоя\b/gu, "моя")
    .replace(/\bтвою\b/gu, "мою")
    .replace(/\bтвій\b/gu, "мій")
    .replace(/\bтвоє\b/gu, "моє");
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
  area: contextFor(theme),
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
  const first = sentence(`${PROBLEM_OPENERS[local]}${value.behavior}`);
  const second = sentence(`Через це ${value.cost}`);
  return style < 10
    ? `${first} ${second}`
    : `${first} ${second} ${THEME_PROBLEM_TAIL[theme[0]]}`;
}

function buildGain(theme, topic, style, clarifyTopic = false) {
  const value = parts(theme, topic);
  const benefit = fill(GAIN_FRAMES[style], {
    benefit: gainBenefitClause(value.benefit)
  });
  const clearBenefit = clarifyTopic
    ? `${contextFor(theme)}, коли йдеться про «${lowerFirst(value.name)}», ${benefit}`
    : benefit;
  const first = sentence(capitalize(clearBenefit));
  return `${first} Тому тобі вигідно залишатися у такому способі дій.`;
}

function buildMeaning(theme, topic, style) {
  const value = parts(theme, topic);
  const first = sentence(fill(MEANING_FRAMES[style % 10], {
    context: contextFor(theme),
    cost: value.cost
  }));
  return style < 10 ? first : `${first} ${THEME_IMPACT[theme[0]] || theme[3]}`;
}

function buildAffirmation(theme, topic, style) {
  const value = parts(theme, topic);
  const options = [
    sentence(`Я можу ${firstPersonAction(value.alternative)}`),
    sentence(`Я маю право ${firstPersonAction(value.permission)}`),
    sentence(`Я обираю ${firstPersonAction(value.choice)}`),
    sentence(theme[4])
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
const seenGains = new Set();

for (let themeIndex = 0; themeIndex < RAW.length; themeIndex += 1) {
  const theme = RAW[themeIndex];
  for (let subtopicIndex = 0; subtopicIndex < theme[5].length; subtopicIndex += 1) {
    const topic = theme[5][subtopicIndex];
    for (let style = 0; style < LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
      pools.problems[idx("problems", themeIndex, subtopicIndex, style)] =
        buildProblem(theme, topic, style);

      let gain = buildGain(theme, topic, style);
      if (seenGains.has(gain)) gain = buildGain(theme, topic, style, true);
      if (seenGains.has(gain)) {
        throw new Error(`gain collision after clarification: ${theme[0]}/${topic[0]}/${style}`);
      }
      seenGains.add(gain);
      pools.gains[idx("gains", themeIndex, subtopicIndex, style)] = gain;

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
