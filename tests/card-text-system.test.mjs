import assert from "node:assert/strict";
import {
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
const DIRECT_ADVICE = /(?:^|\s)(?:зроби|спробуй)(?=\s|[.!?,:;]|$)/iu;
const LIMITS = Object.freeze({ problems: 180, gains: 155, meanings: 150, affirmations: 155, results: 200 });
const AVG_LIMITS = Object.freeze({ problems: 125, gains: 125, meanings: 100, affirmations: 105, results: 170 });
const AREA = Object.freeze({
  friends: /У дружбі/u,
  family: /У сім[’']ї/u,
  study: /У навчанні/u,
  money: /У грошах/u,
  health: /У здоров[’']ї/u,
  sleep: /У сні/u,
  household: /У побуті/u,
  "self-esteem": /У самооцінці/u,
  future: /У майбутньому/u,
  rest: /У відпочинку/u,
  "social-media": /У соцмережах/u,
  work: /У роботі/u,
  sport: /У спорті/u,
  boundaries: /У особистих межах/u,
  communication: /У спілкуванні/u,
  decisions: /У рішеннях/u,
  goals: /У цілях/u,
  emotions: /В емоціях/u,
  responsibility: /У відповідальності/u,
  development: /У особистому розвитку/u
});

assert.equal(POOL_SIZE, 4000);
assert.equal(LIFE_THEME_COUNT, 20);
assert.equal(LIFE_SUBTOPICS_PER_THEME, 10);
assert.equal(LIFE_THEME_POOL_SIZE, 200);
assert.equal(LIFE_SUBTOPIC_POOL_SIZE, 20);
assert.equal(LIFE_RANDOM_THEMES.length, LIFE_THEME_COUNT);
assert.ok(LIFE_RANDOM_THEMES.every((theme) => theme.subtopics.length === LIFE_SUBTOPICS_PER_THEME));

for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  assert.equal(pool.length, POOL_SIZE, `${name}: exactly 4000 texts`);
  assert.equal(new Set(pool).size, POOL_SIZE, `${name}: all 4000 visible texts are unique`);
  assert.ok(pool.every((text) => !JARGON.test(text)), `${name}: no old generator jargon`);
  const max = Math.max(...pool.map((text) => text.length));
  const avg = pool.reduce((sum, text) => sum + text.length, 0) / pool.length;
  assert.ok(max <= LIMITS[name], `${name}: max ${max} > ${LIMITS[name]}`);
  assert.ok(avg <= AVG_LIMITS[name], `${name}: avg ${avg.toFixed(1)} > ${AVG_LIMITS[name]}`);
}

assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(0, 2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(2000).every((text) => sentenceCount(text) === 3));
for (const text of INDEPENDENT_LIFE_POOLS.problems) {
  const sentences = splitSentences(text).map((part) => part.trim());
  assert.match(sentences[1], /^Через це ти /u, `Problem must use a direct consequence: ${text}`);
  assert.doesNotMatch(text, DIRECT_ADVICE, `Problem must not contain an imperative solution: ${text}`);
}

assert.ok(INDEPENDENT_LIFE_POOLS.gains.every((text) => sentenceCount(text) === 2));
for (const text of INDEPENDENT_LIFE_POOLS.gains) {
  const [benefit, conclusion] = splitSentences(text).map((part) => part.trim());
  assert.ok(benefit.length >= 25, `Secondary Gain must name a concrete short benefit: ${text}`);
  assert.equal(conclusion, "Тому тобі вигідно залишатися у такому способі дій.");
}

assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(0, 2000).every((text) => sentenceCount(text) === 1));
assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(2000).every((text) => sentenceCount(text) === 2));

assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(0, 2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(2000).every((text) => sentenceCount(text) === 3));
for (const text of INDEPENDENT_LIFE_POOLS.affirmations) {
  for (const part of splitSentences(text)) assert.match(part.trim(), /^Я(?:\s|$)/u);
  assert.doesNotMatch(text, /я найкращ|ніколи не буде проблем|усі проблеми зник/iu);
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

const originalRandom = Math.random;
const sequence = [0.31, 0.61, 0.01, 0.21, 0.41, 0.61, 0.81];
let calls = 0;
try {
  Math.random = () => sequence[calls++];
  const variant = getIndependentLifeVariant();
  assert.equal(calls, 7, "production chooses theme + subtopic + five independent section styles");
  const expectedTheme = LIFE_RANDOM_THEMES[Math.floor(sequence[0] * LIFE_THEME_COUNT)];
  const expectedSubtopic = expectedTheme.subtopics[Math.floor(sequence[1] * LIFE_SUBTOPICS_PER_THEME)];
  assert.equal(variant.themeKey, expectedTheme.key);
  assert.equal(variant.subtopicKey, expectedSubtopic.key);
  for (let i = 0; i < SECTIONS.length; i += 1) {
    const [section, field] = SECTIONS[i];
    const indices = getLifeSubtopicPoolIndices(expectedTheme.key, expectedSubtopic.key, section);
    assert.equal(variant[field], indices[Math.floor(sequence[i + 2] * LIFE_SUBTOPIC_POOL_SIZE)]);
  }
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
assert.match(first.meaning, /взаємна підтримка/u);
assert.match(first.affirmation, /попросити друга/u);
assert.match(first.result, /попросити друга/u);

console.log("✅ Card text system: 20 themes × 10 subtopics × 20 variants = 4000 per section; all five random blocks stay coherent");
