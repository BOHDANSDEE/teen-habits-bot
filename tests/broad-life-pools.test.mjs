import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import {
  getIndependentLifeVariant,
  INDEPENDENT_LIFE_POOLS,
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

// Кожен видимий текст складається з кількох незалежних змістових осей:
// сфера (крок +1), поведінка (+20) і широкий контекст (+400).
// Це дає 4000 змістових комбінацій без видимих технічних індексів.
for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  for (const base of [0, 421, 842, 1263]) {
    assert.notEqual(pool[base], pool[base + 1], `${name}: changing life sphere must change visible text`);
    assert.notEqual(pool[base], pool[base + 20], `${name}: changing behavior must change visible text`);
    assert.notEqual(pool[base], pool[base + 400], `${name}: changing context must change visible text`);
  }
}

const broadText = Object.values(INDEPENDENT_LIFE_POOLS).flat().join(" ");
for (const sphere of [
  /друз|друж/iu,
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
  assert.match(broadText, sphere, `missing broad life sphere: ${sphere}`);
}

assert.doesNotMatch(
  broadText,
  /під час прогулянки з друзями|коли друг не відповідає ввечері|перед конкретною контрольною|після уроків з друзями|варіант \d+-\d+-\d+/iu,
  "shared pools should stay broad and must not fake uniqueness with visible technical indices"
);

assert.ok(
  INDEPENDENT_LIFE_POOLS.gains.every((text) =>
    /Тому тобі вигідно залишатися у такому способі дій/iu.test(text)
  ),
  "every secondary gain must use the agreed reason-to-stay wording"
);

for (const text of INDEPENDENT_LIFE_POOLS.results) {
  const [body, alternative, nextStep] = splitSentences(text).map((value) => value.trim());
  assert.match(body, /^Ти відчуваєш/iu, "result sentence 1 must describe felt bodily relief");
  assert.match(body, /плеч|шиї|груд|живот|щелеп|спин|рук|горл|голов|тіл/iu, "result sentence 1 must name the body");
  assert.match(
    alternative,
    /^Тепер легше побачити інший спосіб дії:/iu,
    "result sentence 2 must make another way of acting easier to see"
  );
  assert.match(
    nextStep,
    /^Ти краще розумієш наступний крок/iu,
    "result sentence 3 must clarify the next step"
  );
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
}

const originalRandom = Math.random;
let randomCalls = 0;
const randomSequence = [0.01, 0.21, 0.41, 0.61, 0.81];
try {
  Math.random = () => randomSequence[randomCalls++];
  const randomVariant = getIndependentLifeVariant();
  assert.equal(randomCalls, 5, "production random mode must draw independently five times");
  assert.deepEqual(
    [
      randomVariant.problemIndex,
      randomVariant.gainIndex,
      randomVariant.meaningIndex,
      randomVariant.affirmationIndex,
      randomVariant.resultIndex
    ],
    randomSequence.map((value) => Math.floor(value * POOL_SIZE)),
    "problem/gain/meaning/affirmation/result must receive independent random indices"
  );
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

assert.ok(
  worstCard(longestFutureName).length < 4096,
  `generic theoretical worst-case card exceeds Telegram limit: ${worstCard(longestFutureName).length}`
);
assert.ok(
  worstCard(longestPrimaryName, longestNextBlock).length < 4096,
  `primary theoretical worst-case card exceeds Telegram limit: ${worstCard(longestPrimaryName, longestNextBlock).length}`
);

console.log(`✅ Shared pools: 5 × ${POOL_SIZE}, three semantic axes per text, independent random mixing, Telegram worst-case safe`);
