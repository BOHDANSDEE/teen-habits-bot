import assert from "node:assert/strict";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericPools } from "../src/generic-500-pools.js";
import { buildGenericResult } from "../src/generic-result.js";
import {
  getIndependentLifeVariant,
  INDEPENDENT_LIFE_POOLS,
  POOL_SIZE
} from "../src/independent-life-pools.js";
import { cleanLevelName } from "../src/level-output-pools.js";

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;
const SAMPLE_INDICES = [0, 1, 37, 1999, 2000, 3999];

function sectionBetween(text, start, end) {
  const from = text.indexOf(start);
  assert.ok(from >= 0, `missing section: ${start}`);
  const bodyStart = from + start.length;
  const to = end ? text.indexOf(end, bodyStart) : text.length;
  assert.ok(to >= bodyStart, `missing next section: ${end}`);
  return text.slice(bodyStart, to).trim();
}

assert.equal(POOL_SIZE, 4000);

let activeLevels = 0;
let firstTarget = null;
let firstPools = null;

for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  if (block.enabled === false) continue;
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const [levelKey, level] of Object.entries(theme.levels || {})) {
      activeLevels += 1;
      const pools = buildGenericPools(level);
      const problemName = cleanLevelName(level.name || level.articleTitle);
      if (!firstPools) firstPools = pools;
      if (!firstTarget) firstTarget = [blockKey, themeKey, levelKey];

      assert.equal(pools, firstPools, `${blockKey}/${themeKey}/${levelKey}: pools must not depend on level`);
      assert.equal(pools, INDEPENDENT_LIFE_POOLS);

      for (const index of SAMPLE_INDICES) {
        const expected = getIndependentLifeVariant(index);
        const rendered = buildGenericResult(blockKey, themeKey, levelKey, index);
        assert.ok(rendered);
        assert.equal(rendered.variantIndex, index);
        assert.ok(rendered.text.includes(`🔎 *Проблема: ${problemName}*`));
        assert.ok(rendered.text.includes("🔹 *Проблема*"));
        assert.ok(rendered.text.includes("🪞 *Вторинна вигода*"));
        assert.ok(rendered.text.includes("🌟 *Значення в житті*"));
        assert.ok(rendered.text.includes("🔑 *Афірмація*"));
        assert.ok(rendered.text.includes("✨ *Результат*"));
        assert.doesNotMatch(rendered.text, /🌿🧠 \*Стан\*|💭 \*Ти так це відчуваєш\?\*|✨ \*Тепер ти відчуваєш\*|🔑 \*Рішення\*|Тіло:\s*Інтуїтивне/iu);

        const problem = sectionBetween(rendered.text, "🔹 *Проблема*\n", "\n\n🪞 *Вторинна вигода*");
        const gain = sectionBetween(rendered.text, "🪞 *Вторинна вигода*\n", "\n\n🌟 *Значення в житті*");
        const meaning = sectionBetween(rendered.text, "🌟 *Значення в житті*\n", "\n\n🔑 *Афірмація*");
        const affirmation = sectionBetween(rendered.text, "🔑 *Афірмація*\n", "\n\n🔁 Повтори афірмацію");
        const result = sectionBetween(rendered.text, "✨ *Результат*\n", null);

        assert.equal(problem, expected.problem);
        assert.equal(gain, expected.gain);
        assert.equal(meaning, expected.meaning);
        assert.equal(affirmation, expected.affirmation);
        assert.equal(result, expected.result);
        assert.equal(sentenceCount(result), 3);
        assert.match(result, /Тепер тобі стало легше/iu);
        assert.ok(rendered.text.length < 4096, `${blockKey}/${themeKey}/${levelKey}/${index}: Telegram limit`);
      }
    }
  }
}

assert.ok(firstTarget);
const [firstBlockKey, firstThemeKey, firstLevelKey] = firstTarget;
const renderedSets = {
  problems: new Set(),
  gains: new Set(),
  meanings: new Set(),
  affirmations: new Set(),
  results: new Set()
};

for (let index = 0; index < POOL_SIZE; index += 1) {
  const rendered = buildGenericResult(firstBlockKey, firstThemeKey, firstLevelKey, index);
  renderedSets.problems.add(sectionBetween(rendered.text, "🔹 *Проблема*\n", "\n\n🪞 *Вторинна вигода*"));
  renderedSets.gains.add(sectionBetween(rendered.text, "🪞 *Вторинна вигода*\n", "\n\n🌟 *Значення в житті*"));
  renderedSets.meanings.add(sectionBetween(rendered.text, "🌟 *Значення в житті*\n", "\n\n🔑 *Афірмація*"));
  renderedSets.affirmations.add(sectionBetween(rendered.text, "🔑 *Афірмація*\n", "\n\n🔁 Повтори афірмацію"));
  renderedSets.results.add(sectionBetween(rendered.text, "✨ *Результат*\n", null));
}

for (const [name, set] of Object.entries(renderedSets)) {
  assert.equal(set.size, POOL_SIZE, `generic representative renders all ${POOL_SIZE} ${name}`);
}

assert.equal(activeLevels, 150);
console.log(`✅ Generic: ${activeLevels} levels share the same five independent ${POOL_SIZE} pools`);
