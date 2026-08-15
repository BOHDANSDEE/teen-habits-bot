import assert from "node:assert/strict";
import { MAIN_BLOCK, getLevel } from "../src/content.js";
import { buildContinuation, buildResult } from "../src/renderer.js";
import { getLevelProblemPool } from "../src/problem-pools.js";
import { getDirectSecondaryGainPool } from "../src/plain-secondary-gain.js";
import { getDirectLifeMeaningPool } from "../src/life-meaning-pools.js";
import {
  buildLevelAffirmationPool,
  buildLevelResultPool,
  cleanLevelName
} from "../src/level-output-pools.js";

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

function sectionBetween(text, start, end) {
  const from = text.indexOf(start);
  assert.ok(from >= 0, `missing section: ${start}`);
  const bodyStart = from + start.length;
  const to = end ? text.indexOf(end, bodyStart) : text.length;
  assert.ok(to >= bodyStart, `missing next section: ${end}`);
  return text.slice(bodyStart, to).trim();
}

for (const [themeKey, theme] of Object.entries(MAIN_BLOCK.subthemes)) {
  for (const [levelKey, level] of Object.entries(theme.levels)) {
    const problemName = cleanLevelName(level.name || level.articleTitle);
    const problems = getLevelProblemPool(themeKey, levelKey);
    const gains = getDirectSecondaryGainPool(themeKey, levelKey);
    const meanings = getDirectLifeMeaningPool(themeKey, levelKey);
    const affirmations = buildLevelAffirmationPool(level);
    const results = buildLevelResultPool(level);

    for (const [name, pool] of Object.entries({ problems, gains, meanings, affirmations, results })) {
      assert.equal(pool.length, 500, `${themeKey}/${levelKey}: ${name} length`);
      assert.equal(new Set(pool).size, 500, `${themeKey}/${levelKey}: ${name} visible unique`);
    }

    assert.ok(problems.slice(0, 250).every((text) => sentenceCount(text) === 2), `${themeKey}/${levelKey}: first 250 problems = 2 sentences`);
    assert.ok(problems.slice(250).every((text) => sentenceCount(text) === 3), `${themeKey}/${levelKey}: second 250 problems = 3 sentences`);
    assert.ok(gains.every((text) => sentenceCount(text) === 2), `${themeKey}/${levelKey}: secondary gain = 2 sentences`);
    assert.ok(meanings.slice(0, 250).every((text) => sentenceCount(text) === 1), `${themeKey}/${levelKey}: first 250 meanings = 1 sentence`);
    assert.ok(meanings.slice(250).every((text) => sentenceCount(text) === 2), `${themeKey}/${levelKey}: second 250 meanings = 2 sentences`);
    assert.ok(affirmations.slice(0, 250).every((text) => sentenceCount(text) === 2), `${themeKey}/${levelKey}: first 250 affirmations = 2 sentences`);
    assert.ok(affirmations.slice(250).every((text) => sentenceCount(text) === 3), `${themeKey}/${levelKey}: second 250 affirmations = 3 sentences`);
    assert.ok(results.every((text) => sentenceCount(text) === 2), `${themeKey}/${levelKey}: results = 2 sentences`);
    assert.ok(gains.every((text) => /вигід|вигода|отримуєш|зберігаєш|дає тобі|забезпечує/iu.test(text)), `${themeKey}/${levelKey}: gains explain benefit`);
    assert.ok(results.every((text) => /легше|ясн|зрозуміліш|контрол/iu.test(text)), `${themeKey}/${levelKey}: results show relief`);

    const visible = {
      problems: new Set(),
      gains: new Set(),
      meanings: new Set(),
      affirmations: new Set(),
      results: new Set()
    };

    for (let index = 0; index < 500; index += 1) {
      const rendered = buildResult(themeKey, levelKey, index);
      assert.ok(rendered);
      assert.equal(rendered.variantIndex, index);
      assert.ok(rendered.text.includes(`🔎 *Проблема: ${problemName}*`));
      assert.doesNotMatch(rendered.text, /🌿🧠 \*Стан\*|💭 \*Ти так це відчуваєш\?\*|✨ \*Тепер ти відчуваєш\*|🔑 \*Рішення\*|Тіло:\s*Інтуїтивне/iu);
      assert.ok(rendered.text.includes("🔹 *Проблема*"));
      assert.ok(rendered.text.includes("🪞 *Вторинна вигода*"));
      assert.ok(rendered.text.includes("🌟 *Значення в житті*"));
      assert.ok(rendered.text.includes("🔑 *Афірмація*"));
      assert.ok(rendered.text.includes("✨ *Результат*"));

      const nextLevel = rendered.next ? getLevel(rendered.next.themeKey, rendered.next.levelKey) : null;
      const nextTitle = nextLevel ? cleanLevelName(nextLevel.name || nextLevel.articleTitle) : null;
      if (nextTitle) {
        assert.ok(rendered.text.includes(`\n\n${nextTitle}\n`), `${themeKey}/${levelKey}/${index}: next level title`);
        assert.ok(rendered.text.includes("Якщо пройдеш наступне рішення") || rendered.text.includes("Наступний рівень") || rendered.text.includes("Далі ") || rendered.text.includes("Наступне рішення") || rendered.text.includes("Якщо продовжиш") || rendered.text.includes("Наступний крок") || rendered.text.includes("Якщо підеш далі") || rendered.text.includes("Якщо пройдеш далі"));
      }

      const problem = sectionBetween(rendered.text, "🔹 *Проблема*\n", "\n\n🪞 *Вторинна вигода*");
      const gain = sectionBetween(rendered.text, "🪞 *Вторинна вигода*\n", "\n\n🌟 *Значення в житті*");
      const meaning = sectionBetween(rendered.text, "🌟 *Значення в житті*\n", "\n\n🔑 *Афірмація*");
      const affirmation = sectionBetween(rendered.text, "🔑 *Афірмація*\n", "\n\n🔁 Повтори афірмацію");
      const resultEnd = nextTitle ? `\n\n${nextTitle}\n` : null;
      const result = sectionBetween(rendered.text, "✨ *Результат*\n", resultEnd);

      assert.equal(problem, problems[index]);
      assert.equal(gain, gains[index]);
      assert.equal(meaning, meanings[index]);
      assert.equal(affirmation, affirmations[index]);
      assert.equal(result, results[index]);
      assert.equal(sentenceCount(result), 2);
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

const firstThemeKey = Object.keys(MAIN_BLOCK.subthemes)[0];
const firstLevelKey = Object.keys(MAIN_BLOCK.subthemes[firstThemeKey].levels)[0];
const continuation = buildContinuation(firstThemeKey, firstThemeKey, firstLevelKey);
assert.ok(continuation);
assert.ok(continuation.text.includes("🔎 *Проблема:"));
assert.ok(continuation.text.includes("✨ *Результат*"));
assert.doesNotMatch(continuation.text, /🌿🧠 \*Стан\*|💭 \*Ти так це відчуваєш\?\*|✨ \*Тепер ти відчуваєш\*/u);
assert.equal(continuation.themeKey, firstThemeKey);
assert.equal(continuation.levelKey, firstLevelKey);
assert.ok(continuation.next);
assert.ok(continuation.text.length < 4096);

console.log("✅ Primary: 500 problems/gains/meanings/affirmations/results with requested sentence distributions passed");
