import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildResult } from "../src/renderer.js";
import { buildGenericResult } from "../src/generic-result.js";
import { INDEPENDENT_LIFE_POOLS, POOL_SIZE } from "../src/independent-life-pools.js";
import { cleanLevelName } from "../src/level-output-pools.js";

const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];
const sentenceCount = (text) => splitSentences(text).length;

assert.equal(POOL_SIZE, 4000);

assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(0, 2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(2000).every((text) => sentenceCount(text) === 3));
assert.ok(INDEPENDENT_LIFE_POOLS.problems.every((text) =>
  !/(новий варіант|альтернатива|я можу|я обираю|тепер тобі стало легше)/iu.test(text)
));

assert.ok(INDEPENDENT_LIFE_POOLS.gains.every((text) => sentenceCount(text) === 2));
for (const text of INDEPENDENT_LIFE_POOLS.gains) {
  const [benefit, whyStay] = splitSentences(text).map((part) => part.trim());
  assert.match(benefit, /\bможна\b/iu);
  assert.match(whyStay, /^Тому тобі вигідно залишатися/iu);
}

assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(0, 2000).every((text) => sentenceCount(text) === 1));
assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(2000).every((text) => sentenceCount(text) === 2));

assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(0, 2000).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(2000).every((text) => sentenceCount(text) === 3));
for (const text of INDEPENDENT_LIFE_POOLS.affirmations) {
  for (const part of splitSentences(text)) {
    assert.match(part.trim(), /^Я\b/u, "every affirmation sentence must stay in first person");
  }
  assert.doesNotMatch(text, /я найкращ|ніколи не буде проблем|усі проблеми зник/iu);
}

assert.ok(INDEPENDENT_LIFE_POOLS.results.every((text) => sentenceCount(text) === 3));
for (const text of INDEPENDENT_LIFE_POOLS.results) {
  const [body, alternative, nextStep] = splitSentences(text).map((part) => part.trim());
  assert.match(body, /^Ти відчуваєш полегшення/iu);
  assert.match(body, /плеч|шиї|груд|живот|щелеп|спин|рук|горл|голов|тіл/iu);
  assert.match(alternative, /^Тепер тобі стало легше побачити інший спосіб дії:/iu);
  assert.match(nextStep, /^Тобі стало зрозуміліше, який крок зробити далі:/iu);
  assert.doesNotMatch(text, /виліку|повністю зник|більше ніколи/iu);
}

const [primaryThemeKey, primaryTheme] = Object.entries(MAIN_BLOCK.subthemes)[0];
const [primaryLevelKey, primaryLevel] = Object.entries(primaryTheme.levels)[0];

const [futureBlockKey, futureBlock] = Object.entries(FUTURE_BLOCKS).find(([, block]) => block.enabled !== false);
const [futureThemeKey, futureTheme] = Object.entries(futureBlock.subthemes)[0];
const [futureLevelKey, futureLevel] = Object.entries(futureTheme.levels)[0];

const originalRandom = Math.random;
try {
  Math.random = () => 0;
  const primaryMin = buildResult(primaryThemeKey, primaryLevelKey, 0);
  const genericMin = buildGenericResult(futureBlockKey, futureThemeKey, futureLevelKey, 0);
  assert.equal(primaryMin.readCount, 3);
  assert.equal(genericMin.readCount, 3);

  Math.random = () => 0.999999;
  const primaryMax = buildResult(primaryThemeKey, primaryLevelKey, 0);
  const genericMax = buildGenericResult(futureBlockKey, futureThemeKey, futureLevelKey, 0);
  assert.equal(primaryMax.readCount, 9);
  assert.equal(genericMax.readCount, 9);

  assert.match(primaryMin.text, /🔁 Повтори афірмацію 3 разів\./u);
  assert.match(primaryMax.text, /🔁 Повтори афірмацію 9 разів\./u);
  assert.match(genericMin.text, /🔁 Повтори афірмацію 3 разів\./u);
  assert.match(genericMax.text, /🔁 Повтори афірмацію 9 разів\./u);
} finally {
  Math.random = originalRandom;
}

const primaryName = cleanLevelName(primaryLevel.name || primaryLevel.articleTitle);
const futureName = cleanLevelName(futureLevel.name || futureLevel.articleTitle);
assert.ok(buildResult(primaryThemeKey, primaryLevelKey, 0).text.includes(`🔎 *Проблема: ${primaryName}*`));
assert.ok(buildGenericResult(futureBlockKey, futureThemeKey, futureLevelKey, 0).text.includes(`🔎 *Проблема: ${futureName}*`));

console.log("✅ Final card rules: sentence counts, semantics, fixed level title, and affirmation repeat range 3–9");
