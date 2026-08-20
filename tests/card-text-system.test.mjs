import assert from "node:assert/strict";
import {
  ACCEPTANCE_MAX_ATTEMPTS,
  ACCEPTANCE_YES_CHANCE,
  getIndependentLifeVariant,
  getLifeSubtopicPoolIndices,
  getLifeThemePoolIndices,
  INDEPENDENT_LIFE_POOLS,
  LIFE_RANDOM_THEMES,
  LIFE_SUBTOPIC_POOL_SIZE,
  LIFE_SUBTOPICS_PER_THEME,
  LIFE_THEME_COUNT,
  LIFE_THEME_POOL_SIZE,
  POOL_SIZE
} from "../src/independent-life-pools.js";

const SECTIONS = Object.freeze([
  ["problems", "problemIndex"],
  ["gains", "gainIndex"],
  ["meanings", "meaningIndex"],
  ["affirmations", "affirmationIndex"],
  ["results", "resultIndex"]
]);
const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];
const sentenceCount = (text) => splitSentences(text).length;
const BODY = /плеч|дихат|ши[яї]|груд|жив[іо]т|щелеп|спин|рук|горл|голов|тіл/iu;
const JARGON = /патерн|сценарій|механізм|когнітив|соматич/iu;
const VAGUE_COPY = /постійний новий стимул|швидкий стимул|після таймера|продовжуєш гортати після|Так проблема повторюється|Цей спосіб закріплюється|головна вигода|коротка вигода|проста вигода|тут плюс такий|проблема дає наслідок|результат такий|це видно так|час від часу|іншим разом|В особистих межах|говорити про них|без віддалення/iu;
const DIRECT_ADVICE = /(?:^|\s)(?:зроби|спробуй)(?=\s|[.!?,:;]|$)/iu;
const LIMITS = Object.freeze({ problems: 220, gains: 200, meanings: 190, affirmations: 190, results: 205 });
const AVG_LIMITS = Object.freeze({ problems: 155, gains: 155, meanings: 125, affirmations: 135, results: 175 });
const AREA = Object.freeze({
  friends: /У дружбі/u,
  family: /Вдома/u,
  study: /Під час навчання/u,
  money: /Коли йдеться про гроші/u,
  health: /Коли дбаєш про здоров[’']я/u,
  sleep: /Коли готуєшся до сну/u,
  household: /У домашніх справах/u,
  "self-esteem": /Коли оцінюєш себе/u,
  future: /Коли думаєш про майбутнє/u,
  rest: /Коли відпочиваєш/u,
  "social-media": /У соцмережах/u,
  work: /Під час роботи/u,
  sport: /Під час тренувань/u,
  boundaries: /У стосунках з іншими/u,
  communication: /У розмовах/u,
  decisions: /Коли треба щось вирішити/u,
  goals: /Коли працюєш над ціллю/u,
  emotions: /Коли емоції сильні/u,
  responsibility: /Коли береш на себе обов[’']язки/u,
  development: /Коли вчишся новому/u
});

assert.equal(POOL_SIZE, 4000);
assert.equal(LIFE_THEME_COUNT, 20);
assert.equal(LIFE_SUBTOPICS_PER_THEME, 10);
assert.equal(LIFE_THEME_POOL_SIZE, 200);
assert.equal(LIFE_SUBTOPIC_POOL_SIZE, 20);
assert.equal(ACCEPTANCE_YES_CHANCE, 0.5);
assert.equal(ACCEPTANCE_MAX_ATTEMPTS, LIFE_THEME_COUNT);
assert.equal(LIFE_RANDOM_THEMES.length, LIFE_THEME_COUNT);
assert.ok(LIFE_RANDOM_THEMES.every((theme) => theme.subtopics.length === LIFE_SUBTOPICS_PER_THEME));

for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  assert.equal(pool.length, POOL_SIZE, `${name}: exactly 4000 texts`);
  assert.equal(new Set(pool).size, POOL_SIZE, `${name}: all 4000 visible texts are unique`);
  assert.ok(pool.every((text) => !JARGON.test(text)), `${name}: no old generator jargon`);
  assert.ok(pool.every((text) => !VAGUE_COPY.test(text)), `${name}: no known vague copy`);
  const max = Math.max(...pool.map((text) => text.length));
  const avg = pool.reduce((sum, text) => sum + text.length, 0) / pool.length;
  assert.ok(max <= LIMITS[name], `${name}: max ${max} > ${LIMITS[name]}`);
  assert.ok(avg <= AVG_LIMITS[name], `${name}: avg ${avg.toFixed(1)} > ${AVG_LIMITS[name]}`);
}

assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(0, 2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(2000).every((text) => sentenceCount(text) === 3));
for (const text of INDEPENDENT_LIFE_POOLS.problems) {
  const sentences = splitSentences(text).map((part) => part.trim());
  assert.match(sentences[0], /^(?:Ти|Іноді ти|Часто ти|Буває, що ти|Часом ти|Інколи ти|Деколи ти|Нерідко ти|У деякі дні ти|У знайомій ситуації ти)\s/u);
  assert.match(sentences[1], /^Через це /u, `Problem must state a direct consequence: ${text}`);
  assert.doesNotMatch(text, DIRECT_ADVICE, `Problem must not contain an imperative solution: ${text}`);
}

assert.ok(INDEPENDENT_LIFE_POOLS.gains.every((text) => sentenceCount(text) === 2));
for (const text of INDEPENDENT_LIFE_POOLS.gains) {
  const [benefit, conclusion] = splitSentences(text).map((part) => part.trim());
  assert.ok(benefit.length >= 20, `Secondary Gain must name a concrete short benefit: ${text}`);
  assert.match(conclusion, /^Тому тобі вигідно залишатися у такому способі дій/u);
  assert.doesNotMatch(benefit, /вигода:|плюс такий|причина лишатися/iu);
}

assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(0, 2000).every((text) => sentenceCount(text) === 1));
assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(2000).every((text) => sentenceCount(text) === 2));

assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.every((text) => sentenceCount(text) === 2));
for (const text of INDEPENDENT_LIFE_POOLS.affirmations) {
  for (const part of splitSentences(text)) assert.match(part.trim(), /^Я(?:\s|$)/u);
  assert.doesNotMatch(text, /Я (?:можу|обираю|маю право)\b/u);
  assert.doesNotMatch(text, /я найкращ|ніколи не буде проблем|усі проблеми зник/iu);
  assert.doesNotMatch(text, /про них|без віддалення/iu);
}

assert.ok(INDEPENDENT_LIFE_POOLS.results.every((text) => sentenceCount(text) === 3));
for (const text of INDEPENDENT_LIFE_POOLS.results) {
  const [body, alternative, next] = splitSentences(text).map((part) => part.trim());
  assert.match(body, /^Ти відчуваєш/iu);
  assert.match(body, BODY);
  assert.match(alternative, /^Тепер легше побачити інший спосіб дії:/u);
  assert.match(next, /^Наступний крок ясніший:/u);
  assert.doesNotMatch(text, /виліку|повністю зник|більше ніколи/iu);
}

const globalPartitions = Object.fromEntries(SECTIONS.map(([section]) => [section, []]));
for (const theme of LIFE_RANDOM_THEMES) {
  const themeSets = Object.fromEntries(SECTIONS.map(([section]) => [section, new Set()]));
  for (const [section] of SECTIONS) {
    const indices = getLifeThemePoolIndices(theme.key, section);
    assert.equal(indices.length, LIFE_THEME_POOL_SIZE, `${theme.key}/${section}: 200 texts`);
    assert.equal(new Set(indices).size, LIFE_THEME_POOL_SIZE);
    globalPartitions[section].push(...indices);
    for (const index of indices) themeSets[section].add(index);
  }

  for (const subtopic of theme.subtopics) {
    for (const [section] of SECTIONS) {
      const indices = getLifeSubtopicPoolIndices(theme.key, subtopic.key, section);
      assert.equal(indices.length, LIFE_SUBTOPIC_POOL_SIZE, `${theme.key}/${subtopic.key}/${section}: 20 texts`);
      assert.equal(new Set(indices).size, LIFE_SUBTOPIC_POOL_SIZE);
      assert.ok(indices.every((index) => themeSets[section].has(index)));
      if (section === "meanings") {
        for (const index of indices) assert.match(INDEPENDENT_LIFE_POOLS.meanings[index], AREA[theme.key]);
      }
    }
  }
}

for (const [section] of SECTIONS) {
  assert.equal(globalPartitions[section].length, POOL_SIZE);
  assert.equal(new Set(globalPartitions[section]).size, POOL_SIZE, `${section}: themes partition all 4000 texts`);
}

const themeCounts = new Map(LIFE_RANDOM_THEMES.map((theme) => [theme.key, 0]));
const subtopicCounts = new Map();
for (const theme of LIFE_RANDOM_THEMES) {
  for (const subtopic of theme.subtopics) subtopicCounts.set(`${theme.key}/${subtopic.key}`, 0);
}

for (let variantIndex = 0; variantIndex < POOL_SIZE; variantIndex += 1) {
  const variant = getIndependentLifeVariant(variantIndex);
  const theme = LIFE_RANDOM_THEMES.find((item) => item.key === variant.themeKey);
  assert.ok(theme);
  const subtopic = theme.subtopics.find((item) => item.key === variant.subtopicKey);
  assert.ok(subtopic);
  assert.equal(variant.rouletteApplied, false);
  assert.equal(variant.rouletteAttempts, 1);
  themeCounts.set(variant.themeKey, themeCounts.get(variant.themeKey) + 1);
  const topicCounterKey = `${variant.themeKey}/${variant.subtopicKey}`;
  subtopicCounts.set(topicCounterKey, subtopicCounts.get(topicCounterKey) + 1);

  for (const [section, indexField] of SECTIONS) {
    const indices = getLifeSubtopicPoolIndices(variant.themeKey, variant.subtopicKey, section);
    assert.ok(indices.includes(variant[indexField]), `${variantIndex}: ${section} escaped ${topicCounterKey}`);
  }
}
for (const count of themeCounts.values()) assert.equal(count, LIFE_THEME_POOL_SIZE);
for (const count of subtopicCounts.values()) assert.equal(count, LIFE_SUBTOPIC_POOL_SIZE);

const socialScrollSections = Object.fromEntries(SECTIONS.map(([section]) => [
  section,
  getLifeSubtopicPoolIndices("social-media", "scroll", section)
    .map((index) => INDEPENDENT_LIFE_POOLS[section][index])
]));
assert.ok(socialScrollSections.problems.every((text) => /гортати стрічку соцмереж/u.test(text)));
assert.ok(socialScrollSections.gains.every((text) => /щось нове/u.test(text)));
assert.ok(socialScrollSections.results.every((text) => !/таймер/iu.test(text)));
assert.ok(socialScrollSections.results.every((text) => /закрити соцмережу/u.test(text)));

const familyBoundarySections = Object.fromEntries(SECTIONS.map(([section]) => [
  section,
  getLifeSubtopicPoolIndices("boundaries", "family", section)
    .map((index) => INDEPENDENT_LIFE_POOLS[section][index])
]));
assert.ok(familyBoundarySections.problems.every((text) => /рідними|власні межі/u.test(text)));
assert.ok(familyBoundarySections.problems.every((text) => !/В особистих межах|час від часу|родиною не можна/iu.test(text)));
assert.ok(familyBoundarySections.gains.every((text) => !/головна вигода|коротка вигода|плюс такий/iu.test(text)));
assert.ok(familyBoundarySections.affirmations.every((text) => !/про них|віддалення/iu.test(text)));
assert.ok(familyBoundarySections.affirmations.some((text) => /свої межі без сварки/u.test(text)));

const originalRandom = Math.random;
const twoAttemptSequence = [
  0.31, 0.61, 0.01, 0.21, 0.41, 0.61, 0.81, 0.90,
  0.31, 0.11, 0.05, 0.25, 0.45, 0.65, 0.85, 0.10
];
let calls = 0;
try {
  Math.random = () => twoAttemptSequence[calls++];
  const variant = getIndependentLifeVariant();
  assert.equal(calls, 16, "two candidates use 8 random calls each: theme + subtopic + five sections + yes/no");
  assert.equal(variant.rouletteApplied, true);
  assert.equal(variant.rouletteAttempts, 2);
  assert.equal(variant.rejectedThemeKeys.length, 1);
  assert.notEqual(variant.themeKey, variant.rejectedThemeKeys[0], "No must reroll to a different life theme");
  assert.equal(variant.forcedAcceptance, false);

  for (const [section, indexField] of SECTIONS) {
    const indices = getLifeSubtopicPoolIndices(variant.themeKey, variant.subtopicKey, section);
    assert.ok(indices.includes(variant[indexField]), `${section}: accepted card must stay inside one subtopic`);
  }
} finally {
  Math.random = originalRandom;
}

let fallbackCalls = 0;
try {
  Math.random = () => {
    fallbackCalls += 1;
    return 0.99;
  };
  const variant = getIndependentLifeVariant();
  assert.equal(variant.rouletteApplied, true);
  assert.equal(variant.rouletteAttempts, LIFE_THEME_COUNT);
  assert.equal(variant.rejectedThemeKeys.length, LIFE_THEME_COUNT - 1);
  assert.equal(new Set(variant.rejectedThemeKeys).size, LIFE_THEME_COUNT - 1);
  assert.ok(!variant.rejectedThemeKeys.includes(variant.themeKey));
  assert.equal(variant.forcedAcceptance, true, "last remaining theme is a safety fallback so generation cannot loop forever");
  assert.equal(fallbackCalls, LIFE_THEME_COUNT * 8);
} finally {
  Math.random = originalRandom;
}

const first = getIndependentLifeVariant(0);
assert.equal(first.themeKey, "friends");
assert.equal(first.subtopicKey, "ask-help");
assert.deepEqual(
  [first.problemIndex, first.gainIndex, first.meaningIndex, first.affirmationIndex, first.resultIndex],
  [0, 3, 7, 2001, 15]
);
assert.match(first.problem, /просиш друзів про допомогу/u);
assert.match(first.gain, /вразливість/u);
assert.match(first.meaning, /У дружбі/u);
assert.match(first.affirmation, /прошу|підтрим/u);
assert.match(first.result, /попросити друга/u);

console.log("✅ Card text system: all 200 cores render in plain language; 20×10×20 per section and Yes/No reroll stay intact");
