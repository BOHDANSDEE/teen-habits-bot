import assert from "node:assert/strict";
import { BODY_STATE_POOLS } from "../src/body-state-pools.js";
import { MAIN_BLOCK } from "../src/content.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool } from "../src/level-context-pools.js";
import { getLevelProblemPool } from "../src/problem-pools.js";
import { buildResult } from "../src/renderer.js";

for (const [themeKey, theme] of Object.entries(MAIN_BLOCK.subthemes)) {
  assert.equal(BODY_STATE_POOLS[themeKey].length, 500);
  assert.equal(new Set(BODY_STATE_POOLS[themeKey]).size, 500);
  assert.equal(theme.pools.affirmations.length, 500);
  assert.equal(new Set(theme.pools.affirmations).size, 500);

  for (const [levelKey] of Object.entries(theme.levels)) {
    const problems = getLevelProblemPool(themeKey, levelKey);
    const gains = getLevelSecondaryGainPool(themeKey, levelKey);
    const meanings = getLevelLifeMeaningPool(themeKey, levelKey);
    assert.equal(problems.length, 500);
    assert.equal(new Set(problems).size, 500);
    assert.equal(gains.length, 500);
    assert.equal(new Set(gains).size, 500);
    assert.equal(meanings.length, 500);
    assert.equal(new Set(meanings).size, 500);

    const result = buildResult(themeKey, levelKey);
    assert.ok(result.text.includes("🌿🧠 *Стан*"));
    assert.ok(result.text.includes("🧩⚠️ *Проблема —"));
    assert.ok(result.text.includes("🪞🎁 *Вторинна вигода*"));
    assert.ok(result.text.includes("🌟🧭 *Значення в житті*"));
    assert.ok(result.text.includes("🔑✨ *Рішення*"));
    assert.ok(result.text.includes("✨ *Результат*"));
    assert.ok(!result.text.includes("✨ *Тепер ти відчуваєш*"));
    assert.ok(!/сценарій|патерн|механізм|внутрішня система/iu.test(result.text.split("🪞🎁 *Вторинна вигода*")[1].split("🌟🧭")[0]));
    assert.ok(result.text.length < 2800);
  }
}

console.log("✅ 500-pool flow passed");
