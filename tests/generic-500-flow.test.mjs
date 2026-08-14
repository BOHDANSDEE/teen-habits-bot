import assert from "node:assert/strict";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericPools } from "../src/generic-500-pools.js";
import { buildGenericResult } from "../src/generic-result.js";
import { cleanLevelName } from "../src/level-output-pools.js";

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

function sectionBetween(text, start, end) {
  const from = text.indexOf(start);
  assert.ok(from >= 0, `missing section: ${start}`);
  const bodyStart = from + start.length;
  const to = end ? text.indexOf(end, bodyStart) : text.length;
  assert.ok(to >= bodyStart, `missing next section: ${end}`);
  return text.slice(bodyStart, to).trim();
}

let activeLevels = 0;
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  if (block.enabled === false) continue;
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const [levelKey, level] of Object.entries(theme.levels || {})) {
      activeLevels += 1;
      const pools = buildGenericPools(level);
      const problemName = cleanLevelName(level.name || level.articleTitle);

      for (const [name, pool] of Object.entries(pools)) {
        assert.equal(pool.length, 500, `${blockKey}/${themeKey}/${levelKey}: ${name} length`);
        assert.equal(new Set(pool).size, 500, `${blockKey}/${themeKey}/${levelKey}: ${name} unique`);
      }

      assert.ok(pools.problems.slice(0, 250).every((text) => sentenceCount(text) === 2));
      assert.ok(pools.problems.slice(250).every((text) => sentenceCount(text) === 3));
      assert.ok(pools.gains.every((text) => sentenceCount(text) === 2));
      assert.ok(pools.meanings.slice(0, 250).every((text) => sentenceCount(text) === 1));
      assert.ok(pools.meanings.slice(250).every((text) => sentenceCount(text) === 2));
      assert.ok(pools.affirmations.slice(0, 250).every((text) => sentenceCount(text) === 2));
      assert.ok(pools.affirmations.slice(250).every((text) => sentenceCount(text) === 3));
      assert.ok(pools.results.every((text) => sentenceCount(text) === 2));
      assert.ok(pools.gains.every((text) => /вигід|вигода|коротк|старий спосіб|зруч/iu.test(text)));
      assert.ok(pools.results.every((text) => /легше|ясн|зрозуміліш|контрол/iu.test(text)));

      const renderedSets = {
        problems: new Set(),
        gains: new Set(),
        meanings: new Set(),
        affirmations: new Set(),
        results: new Set()
      };

      for (let index = 0; index < 500; index += 1) {
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

        assert.equal(problem, pools.problems[index]);
        assert.equal(gain, pools.gains[index]);
        assert.equal(meaning, pools.meanings[index]);
        assert.equal(affirmation, pools.affirmations[index]);
        assert.equal(result, pools.results[index]);
        assert.ok(rendered.text.length < 4096, `${blockKey}/${themeKey}/${levelKey}/${index}: Telegram limit`);

        renderedSets.problems.add(problem);
        renderedSets.gains.add(gain);
        renderedSets.meanings.add(meaning);
        renderedSets.affirmations.add(affirmation);
        renderedSets.results.add(result);
      }

      for (const [name, set] of Object.entries(renderedSets)) {
        assert.equal(set.size, 500, `${blockKey}/${themeKey}/${levelKey}: rendered ${name} unique`);
      }
    }
  }
}

assert.ok(activeLevels > 0);
console.log(`✅ Generic: ${activeLevels} active levels use 500 unique problem/gain/meaning/affirmation/result variants`);
