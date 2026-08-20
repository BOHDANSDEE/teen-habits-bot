import * as base from "./card-text-clarity-v4.js";
import { CARD_TEXT_THEME_DATA_1 } from "./card-text-data-1.js";
import { CARD_TEXT_THEME_DATA_2 } from "./card-text-data-2.js";
import { CARD_TEXT_THEME_DATA_3 } from "./card-text-data-3.js";
import { CARD_TEXT_THEME_DATA_4 } from "./card-text-data-4.js";

export * from "./card-text-clarity-v4.js";

const RAW = Object.freeze([
  ...CARD_TEXT_THEME_DATA_1,
  ...CARD_TEXT_THEME_DATA_2,
  ...CARD_TEXT_THEME_DATA_3,
  ...CARD_TEXT_THEME_DATA_4
]);

const ORDERED_PAIRS = Object.freeze(
  Array.from({ length: 5 }, (_, first) =>
    Array.from({ length: 5 }, (_, second) => [first, second])
      .filter(([a, b]) => a !== b)
  ).flat()
);

const PHRASE_REPLACEMENTS = Object.freeze([
  ["говорити про них без віддалення", "говорити про свої межі без сварки"],
  ["говорити про них", "говорити про це прямо"],
  ["без віддалення", "без сварки"],
  ["дозволяти собі неідеальний контент", "дозволяти собі неідеальні публікації"],
  ["не тримати контент, який постійно шкодить настрою", "не залишати в стрічці те, що постійно псує настрій"],
  ["зменшувати зайві стимули перед сном", "прибирати зайві екрани й активні справи перед сном"],
  ["залишатися з фантазією замість досвіду", "залишатися лише з уявленням замість реального досвіду"]
]);

const EXACT_VERBS = Object.freeze({
  "бути": "залишаюся",
  "брати": "беру",
  "взяти": "беру",
  "вести": "веду",
  "вийти": "виходжу",
  "вимкнути": "вимикаю",
  "випити": "п’ю",
  "відкласти": "відкладаю",
  "відмовити": "відмовляю",
  "відповісти": "відповідаю",
  "відчути": "відчуваю",
  "врахувати": "враховую",
  "дати": "даю",
  "додати": "додаю",
  "дозволити": "дозволяю",
  "завершити": "завершую",
  "закрити": "закриваю",
  "записати": "записую",
  "запитати": "запитую",
  "зберегти": "зберігаю",
  "знайти": "знаходжу",
  "знизити": "знижую",
  "зосередити": "зосереджую",
  "зробити": "роблю",
  "їсти": "їм",
  "лягти": "лягаю",
  "назвати": "називаю",
  "написати": "пишу",
  "обрати": "обираю",
  "пити": "п’ю",
  "побачити": "бачу",
  "повернути": "повертаю",
  "попросити": "прошу",
  "поставити": "ставлю",
  "почати": "починаю",
  "прийняти": "приймаю",
  "прочитати": "читаю",
  "провести": "проводжу",
  "просити": "прошу",
  "робити": "роблю",
  "сказати": "кажу",
  "спати": "сплю",
  "стояти": "стою",
  "тримати": "тримаю",
  "хотіти": "хочу"
});

const SECOND_PERSON = Object.freeze({
  "бачиш": "бачу",
  "відчуваєш": "відчуваю",
  "відкриваєш": "відкриваю",
  "говориш": "говорю",
  "думаєш": "думаю",
  "знаєш": "знаю",
  "маєш": "маю",
  "можеш": "можу",
  "обираєш": "обираю",
  "плануєш": "планую",
  "помічаєш": "помічаю",
  "потребуєш": "потребую",
  "просиш": "прошу",
  "робиш": "роблю",
  "слухаєш": "слухаю",
  "хочеш": "хочу"
});

const ACTION_OVERRIDES = Object.freeze({
  "бути надійним у простих справах": "дотримуюся простих домовленостей",
  "бути присутнім у спільному часі": "приділяю увагу близьким у спільному часі",
  "бути собою": "залишаюся собою",
  "залишатися собою поруч з іншими": "залишаюся собою поруч з іншими",
  "залишатися собою поруч із друзями": "залишаюся собою поруч із друзями"
});

const LISTENING_STATEMENTS = Object.freeze([
  "Я дослуховую інших до кінця.",
  "Я поважаю думку іншої людини.",
  "Я слухаю перед тим, як відповідати.",
  "Я не перебиваю, коли інша людина говорить.",
  "Я даю іншій людині завершити думку."
]);

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const lowerFirst = (value = "") => {
  const text = String(value || "").trim();
  return text ? text[0].toLowerCase() + text.slice(1) : text;
};

function normalizePhrase(value = "") {
  let text = String(value || "").trim();
  for (const [from, to] of PHRASE_REPLACEMENTS) text = text.replaceAll(from, to);
  return text
    .replace(/\bтобі\b/gu, "мені")
    .replace(/\bтебе\b/gu, "мене")
    .replace(/\bтвої\b/gu, "мої")
    .replace(/\bтвій\b/gu, "мій")
    .replace(/\bтвоя\b/gu, "моя")
    .replace(/\bтвоє\b/gu, "моє")
    .replace(/\bти\b/gu, "я");
}

function conjugateInfinitive(word) {
  const original = String(word || "");
  const lower = original.toLowerCase();
  let infinitive = lower;
  let reflexive = "";

  if (infinitive.endsWith("ся")) {
    reflexive = "ся";
    infinitive = infinitive.slice(0, -2);
  } else if (infinitive.endsWith("сь")) {
    reflexive = "ся";
    infinitive = infinitive.slice(0, -2);
  }

  let direct = EXACT_VERBS[infinitive];
  if (!direct) {
    if (infinitive.endsWith("ювати")) direct = `${infinitive.slice(0, -5)}юю`;
    else if (infinitive.endsWith("увати")) direct = `${infinitive.slice(0, -5)}ую`;
    else if (infinitive.endsWith("овувати")) direct = `${infinitive.slice(0, -7)}овую`;
    else if (infinitive.endsWith("ювати")) direct = `${infinitive.slice(0, -5)}юю`;
    else if (infinitive.endsWith("ати")) direct = `${infinitive.slice(0, -3)}аю`;
    else if (infinitive.endsWith("яти")) direct = `${infinitive.slice(0, -3)}яю`;
    else if (infinitive.endsWith("іти")) direct = `${infinitive.slice(0, -3)}ію`;
    else if (infinitive.endsWith("ити")) direct = `${infinitive.slice(0, -3)}ю`;
    else if (infinitive.endsWith("нути")) direct = `${infinitive.slice(0, -4)}ну`;
    else if (infinitive.endsWith("ти")) direct = `${infinitive.slice(0, -2)}ю`;
    else direct = infinitive;
  }

  if (reflexive && !direct.endsWith("ся")) direct += reflexive;
  return direct;
}

function directAction(value = "") {
  const normalized = normalizePhrase(value);
  const override = ACTION_OVERRIDES[normalized];
  if (override) return override;

  return normalized.replace(/[А-Яа-яІіЇїЄєҐґ’'-]+/gu, (word) => {
    const lower = word.toLowerCase();
    if (SECOND_PERSON[lower]) return SECOND_PERSON[lower];
    if (/(?:ти|тися|тись)$/u.test(lower)) return conjugateInfinitive(lower);
    return word;
  });
}

function directStatement(value = "") {
  return sentence(`Я ${directAction(value)}`);
}

function principleStatement(value = "") {
  return sentence(`Я пам’ятаю, що ${lowerFirst(normalizePhrase(value))}`);
}

function topicIndex(themeIndex, subtopicIndex) {
  return themeIndex * base.LIFE_SUBTOPICS_PER_THEME + subtopicIndex;
}

function affirmationIndex(themeIndex, subtopicIndex, style) {
  const topic = topicIndex(themeIndex, subtopicIndex);
  return (style >= 10 ? 2000 : 0) + topic * 10 + (style % 10);
}

function buildStatements(theme, topic) {
  if (`${theme[0]}/${topic[0]}` === "friends/listening") return LISTENING_STATEMENTS;

  return Object.freeze([
    directStatement(topic[6]),
    directStatement(topic[7]),
    directStatement(topic[8]),
    directStatement(topic[9]),
    principleStatement(topic[5])
  ]);
}

function buildAffirmation(theme, topic, style) {
  const statements = buildStatements(theme, topic);
  const [first, second] = ORDERED_PAIRS[style];
  return `${statements[first]} ${statements[second]}`;
}

const affirmations = Array(base.POOL_SIZE);
const seen = new Set();

for (let themeIndex = 0; themeIndex < RAW.length; themeIndex += 1) {
  const theme = RAW[themeIndex];
  for (let subtopicIndex = 0; subtopicIndex < theme[5].length; subtopicIndex += 1) {
    const topic = theme[5][subtopicIndex];
    const statements = buildStatements(theme, topic);
    if (new Set(statements).size !== 5) {
      throw new Error(`affirmation statements must be distinct for ${theme[0]}/${topic[0]}`);
    }

    for (let style = 0; style < base.LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
      const index = affirmationIndex(themeIndex, subtopicIndex, style);
      const text = buildAffirmation(theme, topic, style);
      if (seen.has(text)) throw new Error(`affirmation duplicate: ${theme[0]}/${topic[0]}/${style}`);
      affirmations[index] = text;
      seen.add(text);
    }
  }
}

if (affirmations.length !== base.POOL_SIZE || new Set(affirmations).size !== base.POOL_SIZE || affirmations.some((text) => !text)) {
  throw new Error(`affirmations must contain exactly ${base.POOL_SIZE} unique visible texts`);
}

export const INDEPENDENT_LIFE_POOLS = Object.freeze({
  ...base.INDEPENDENT_LIFE_POOLS,
  affirmations: Object.freeze(affirmations)
});

export function getIndependentLifeVariant(requestedVariant = null) {
  const variant = base.getIndependentLifeVariant(requestedVariant);
  return {
    ...variant,
    affirmation: INDEPENDENT_LIFE_POOLS.affirmations[variant.affirmationIndex]
  };
}
