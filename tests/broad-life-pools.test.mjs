import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import {
  getIndependentLifeVariant,
  getLifeThemePoolIndices,
  INDEPENDENT_LIFE_POOLS,
  LIFE_RANDOM_THEMES,
  LIFE_THEME_COUNT,
  LIFE_THEME_POOL_SIZE,
  POOL_SIZE
} from "../src/independent-life-pools.js";
import {
  buildNextPreview,
  cleanLevelName,
  OUTPUT_POOL_SIZE
} from "../src/level-output-pools.js";

const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];
const sentenceCount = (text) => splitSentences(text).length;
const longest = (items) => items.reduce((best, item) => item.length > best.length ? item : best, "");
const ALT_ACTION = /(інший спосіб дії|як діяти інакше)/iu;
const NEXT_STEP = /^Наступний крок ясніший:/iu;
const BODY = /плеч|ши[яї]|груд|жив[іо]т|щелеп|спин|рук|горл|голов|тіл/iu;

assert.equal(POOL_SIZE, 4000);
for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  assert.equal(pool.length, POOL_SIZE, `${name}: exactly ${POOL_SIZE}`);
  assert.equal(new Set(pool).size, POOL_SIZE, `${name}: all visible texts are unique`);
}

assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(0, 2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(2000).every((text) => sentenceCount(text) === 3));
assert.ok(INDEPENDENT_LIFE_POOLS.gains.every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(0, 2000).every((text) => sentenceCount(text) === 1));
assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(0, 2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(2000).every((text) => sentenceCount(text) === 3));
assert.ok(INDEPENDENT_LIFE_POOLS.results.every((text) => sentenceCount(text) === 3));

const allText = Object.values(INDEPENDENT_LIFE_POOLS).flat().join(" ");
assert.doesNotMatch(
  allText,
  /під оцінкою|при розсіянні|у метушні|на старті|малий крок у відпочинку|перфекціонізм у спорті|коли кажеш «ні»/iu,
  "old artificial context stitching must not return"
);

const explicitArea = /у дружбі|у сім[’']ї|у навчанні|у грошах|у здоров[’']ї|у сні|у побуті|у самооцінці|у майбутньому|у відпочинку|у соцмережах|у роботі|у спорті|у особистих межах|у спілкуванні|у рішеннях|у цілях|в емоціях|у відповідальності|у особистому розвитку/iu;
assert.ok(
  INDEPENDENT_LIFE_POOLS.meanings.every((text) => explicitArea.test(text)),
  "Meaning must name one coherent broad life sphere"
);

const meaningText = INDEPENDENT_LIFE_POOLS.meanings.join(" ");
for (const sphere of [
  /друж/iu,
  /сім/iu,
  /навчан/iu,
  /грош/iu,
  /здоров/iu,
  /сні|сон|сну/iu,
  /побут/iu,
  /самооцін/iu,
  /майбут/iu,
  /відпоч/iu,
  /соцмереж/iu,
  /робот/iu,
  /спорт/iu,
  /меж/iu,
  /спілкуван/iu,
  /рішен/iu,
  /ціл/iu,
  /емоці/iu,
  /відповідальн/iu,
  /розвит/iu
]) {
  assert.match(meaningText, sphere, `missing broad life sphere: ${sphere}`);
}

assert.ok(
  INDEPENDENT_LIFE_POOLS.gains.every((text) =>
    /Тому тобі вигідно залишатися у такому способі дій/iu.test(text)
  ),
  "every secondary gain must use the agreed reason-to-stay wording"
);

for (const text of INDEPENDENT_LIFE_POOLS.results) {
  const [body, alternative, nextStep] = splitSentences(text).map((value) => value.trim());
  assert.match(body, /^Ти відчуваєш/iu, "result sentence 1 must describe bodily relief");
  assert.match(body, BODY, "result sentence 1 must name the body");
  assert.match(alternative, ALT_ACTION, "result sentence 2 must show another way of acting");
  assert.match(nextStep, NEXT_STEP, "result sentence 3 must clarify the next step");
}

const deterministicSamples = [0, 37, 999, 1999, 2000, 3999].map((index) => getIndependentLifeVariant(index));
for (const sample of deterministicSamples) {
  assert.equal(new Set([
    sample.problemIndex,
    sample.gainIndex,
    sample.meaningIndex,
    sample.affirmationIndex,
    sample.resultIndex
  ]).size, 5, "the five card sections keep separate deterministic indices");

  for (const [section, index] of [
    ["problems", sample.problemIndex],
    ["gains", sample.gainIndex],
    ["meanings", sample.meaningIndex],
    ["affirmations", sample.affirmationIndex],
    ["results", sample.resultIndex]
  ]) {
    assert.ok(
      getLifeThemePoolIndices(sample.themeKey, section).includes(index),
      `${section} must stay inside ${sample.themeKey}`
    );
  }
}

const originalRandom = Math.random;
let randomCalls = 0;
const randomSequence = [0.31, 0.01, 0.21, 0.41, 0.61, 0.81];
try {
  Math.random = () => randomSequence[randomCalls++];
  const randomVariant = getIndependentLifeVariant();
  assert.equal(randomCalls, 6, "production random mode chooses one theme and five independent section slots");

  const expectedTheme = LIFE_RANDOM_THEMES[Math.floor(randomSequence[0] * LIFE_THEME_COUNT)];
  assert.equal(randomVariant.themeKey, expectedTheme.key);

  const sectionPairs = [
    ["problems", "problemIndex"],
    ["gains", "gainIndex"],
    ["meanings", "meaningIndex"],
    ["affirmations", "affirmationIndex"],
    ["results", "resultIndex"]
  ];

  for (let i = 0; i < sectionPairs.length; i += 1) {
    const [section, field] = sectionPairs[i];
    const indices = getLifeThemePoolIndices(expectedTheme.key, section);
    assert.equal(
      randomVariant[field],
      indices[Math.floor(randomSequence[i + 1] * LIFE_THEME_POOL_SIZE)],
      `${section} must use its own random slot inside the selected theme`
    );
  }
} finally {
  Math.random = originalRandom;
}

const longestProblem = longest(INDEPENDENT_LIFE_POOLS.problems);
const longestGain = longest(INDEPENDENT_LIFE_POOLS.gains);
const longestMeaning = longest(INDEPENDENT_LIFE_POOLS.meanings);
const longestAffirmation = longest(INDEPENDENT_LIFE_POOLS.affirmations);
const longestResult = longest(INDEPENDENT_LIFE_POOLS.results);

const primaryLevels = Object.values(MAIN_BLOCK.subthemes).flatMap((theme) => Object.values(theme.levels || {}));
const futureLevels = Object.values(FUTURE_BLOCKS).flatMap((block) =>
  Object.values(block.subthemes || {}).flatMap((theme) => Object.values(theme.levels || {}))
);
const longestPrimaryName = longest(primaryLevels.map((level) => cleanLevelName(level.name || level.articleTitle)));
const longestFutureName = longest(futureLevels.map((level) => cleanLevelName(level.name || level.articleTitle)));

let longestNextBlock = "";
for (const level of primaryLevels) {
  for (let index = 0; index < OUTPUT_POOL_SIZE; index += 1) {
    const preview = buildNextPreview(level, index);
    const block = `\n\n${preview.title}\n${preview.text}`;
    if (block.length > longestNextBlock.length) longestNextBlock = block;
  }
}

const worstCard = (problemName, nextBlock = "") =>
  `📖 *Інструкція:* Прочитай текст повільно від початку до кінця.\n\n🔎 *Проблема: ${problemName}*\n\n🔹 *Проблема*\n${longestProblem}\n\n🪞 *Вторинна вигода*\n${longestGain}\n\n🌟 *Значення в житті*\n${longestMeaning}\n\n🔑 *Афірмація*\n${longestAffirmation}\n\n🔁 Повтори афірмацію 9 разів.\n\n✨ *Результат*\n${longestResult}${nextBlock}`;

assert.ok(worstCard(longestFutureName).length < 4096, "generic theoretical worst-case card exceeds Telegram limit");
assert.ok(worstCard(longestPrimaryName, longestNextBlock).length < 4096, "primary theoretical worst-case card exceeds Telegram limit");

console.log(`✅ Shared pools: 20 themes × 200 texts per section; five random sections stay in one theme; Telegram safe`);
