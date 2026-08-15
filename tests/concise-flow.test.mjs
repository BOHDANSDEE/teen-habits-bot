import assert from "node:assert/strict";
import { MAIN_BLOCK, getLevel } from "../src/content.js";
import { buildContinuation, buildResult } from "../src/renderer.js";
import {
  getIndependentLifeVariant,
  INDEPENDENT_LIFE_POOLS
} from "../src/independent-life-pools.js";
import { cleanLevelName } from "../src/level-output-pools.js";

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;
const JARGON = /патерн|сценарій|механізм|когнітив|соматич|інтуїтивне тіло/iu;
const PHYSICAL_RELIEF = /полегш|напруг|напруж|легш|легк|вільніш|розслаб|дихати|тиск|м['’]якш/iu;

function sectionBetween(text, start, end) {
  const from = text.indexOf(start);
  assert.ok(from >= 0, `missing section: ${start}`);
  const bodyStart = from + start.length;
  const to = end ? text.indexOf(end, bodyStart) : text.length;
  assert.ok(to >= bodyStart, `missing next section: ${end}`);
  return text.slice(bodyStart, to).trim();
}

for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  assert.equal(pool.length, 500, `${name}: length`);
  assert.equal(new Set(pool).size, 500, `${name}: visible unique`);
  assert.ok(pool.every((text) => !JARGON.test(text)), `${name}: simple language only`);
}

assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(0, 250).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.problems.slice(250).every((text) => sentenceCount(text) === 3));
assert.ok(INDEPENDENT_LIFE_POOLS.gains.every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(0, 250).every((text) => sentenceCount(text) === 1));
assert.ok(INDEPENDENT_LIFE_POOLS.meanings.slice(250).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(0, 250).every((text) => sentenceCount(text) === 2));
assert.ok(INDEPENDENT_LIFE_POOLS.affirmations.slice(250).every((text) => sentenceCount(text) === 3));
assert.ok(INDEPENDENT_LIFE_POOLS.results.every((text) => sentenceCount(text) === 3));
assert.ok(INDEPENDENT_LIFE_POOLS.gains.every((text) => /вигід|вигод|дає|давати|допомагає|дозволяє|захищає/iu.test(text)));
assert.ok(INDEPENDENT_LIFE_POOLS.results.every((text) => /Тепер тобі стало легше/iu.test(text)));
assert.ok(INDEPENDENT_LIFE_POOLS.results.every((text) => PHYSICAL_RELIEF.test(text.split(/(?<=[.!?…])\s+/u)[0] || "")));

const allLifeText = `${INDEPENDENT_LIFE_POOLS.problems.join(" ")} ${INDEPENDENT_LIFE_POOLS.meanings.join(" ")}`;
for (const sphere of [/навчан/iu, /друж/iu, /сім/iu, /грош/iu, /соцмереж/iu, /сон/iu, /побут|домаш/iu, /стосунк/iu, /майбут/iu, /відпоч/iu]) {
  assert.match(allLifeText, sphere, `life sphere missing: ${sphere}`);
}

const indexZero = getIndependentLifeVariant(0);
assert.deepEqual(
  [indexZero.problemIndex, indexZero.gainIndex, indexZero.meaningIndex, indexZero.affirmationIndex, indexZero.resultIndex],
  [0, 59, 113, 197, 271],
  "blocks use separate deterministic indices in test mode"
);

for (const [themeKey, theme] of Object.entries(MAIN_BLOCK.subthemes)) {
  for (const [levelKey, level] of Object.entries(theme.levels)) {
    const problemName = cleanLevelName(level.name || level.articleTitle);
    const visible = {
      problems: new Set(),
      gains: new Set(),
      meanings: new Set(),
      affirmations: new Set(),
      results: new Set()
    };

    for (let index = 0; index < 500; index += 1) {
      const expected = getIndependentLifeVariant(index);
      const rendered = buildResult(themeKey, levelKey, index);
      assert.ok(rendered);
      assert.equal(rendered.variantIndex, index);
      assert.ok(rendered.text.includes(`🔎 *Проблема: ${problemName}*`));
      assert.doesNotMatch(rendered.text, /🌿🧠 \*Стан\*|💭 \*Ти так це відчуваєш\?\*|✨ \*Тепер ти відчуваєш\*|🔑 \*Рішення\*|Тіло:\s*Інтуїтивне/iu);

      const nextLevel = rendered.next ? getLevel(rendered.next.themeKey, rendered.next.levelKey) : null;
      const nextTitle = nextLevel ? cleanLevelName(nextLevel.name || nextLevel.articleTitle) : null;
      const problem = sectionBetween(rendered.text, "🔹 *Проблема*\n", "\n\n🪞 *Вторинна вигода*");
      const gain = sectionBetween(rendered.text, "🪞 *Вторинна вигода*\n", "\n\n🌟 *Значення в житті*");
      const meaning = sectionBetween(rendered.text, "🌟 *Значення в житті*\n", "\n\n🔑 *Афірмація*");
      const affirmation = sectionBetween(rendered.text, "🔑 *Афірмація*\n", "\n\n🔁 Повтори афірмацію");
      const result = sectionBetween(rendered.text, "✨ *Результат*\n", nextTitle ? `\n\n${nextTitle}\n` : null);

      assert.equal(problem, expected.problem);
      assert.equal(gain, expected.gain);
      assert.equal(meaning, expected.meaning);
      assert.equal(affirmation, expected.affirmation);
      assert.equal(result, expected.result);
      assert.equal(sentenceCount(result), 3);
      assert.match((result.split(/(?<=[.!?…])\s+/u)[0] || ""), PHYSICAL_RELIEF);
      assert.match(result, /Тепер тобі стало легше/iu);
      assert.ok(rendered.text.length < 4096, `${themeKey}/${levelKey}/${index}: Telegram limit`);

      visible.problems.add(problem);
      visible.gains.add(gain);
      visible.meanings.add(meaning);
      visible.affirmations.add(affirmation);
      visible.results.add(result);
    }

    for (const [name, set] of Object.entries(visible)) {
      assert.equal(set.size, 500, `${themeKey}/${levelKey}: rendered ${name} visible unique`);
    }
  }
}

const primaryLevels = Object.entries(MAIN_BLOCK.subthemes).flatMap(([themeKey, theme]) =>
  Object.keys(theme.levels).map((levelKey) => [themeKey, levelKey])
);
assert.ok(primaryLevels.length >= 2);
const [firstTarget, secondTarget] = primaryLevels;
const firstCard = buildResult(firstTarget[0], firstTarget[1], 37);
const secondCard = buildResult(secondTarget[0], secondTarget[1], 37);
const expected37 = getIndependentLifeVariant(37);
for (const card of [firstCard, secondCard]) {
  assert.ok(card.text.includes(expected37.problem));
  assert.ok(card.text.includes(expected37.gain));
  assert.ok(card.text.includes(expected37.meaning));
  assert.ok(card.text.includes(expected37.affirmation));
  assert.ok(card.text.includes(expected37.result));
}

const continuation = buildContinuation(firstTarget[0], firstTarget[0], firstTarget[1]);
assert.ok(continuation);
assert.ok(continuation.text.includes("🔎 *Проблема:"));
assert.ok(continuation.text.includes("✨ *Результат*"));
assert.ok(continuation.text.length < 4096);

console.log("✅ Primary: five shared 500 pools are level-independent; blocks mix independently; results have 3 sentences");
