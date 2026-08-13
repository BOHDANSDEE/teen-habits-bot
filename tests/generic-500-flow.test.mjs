import assert from "node:assert/strict";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericPools } from "../src/generic-500-pools.js";
import { buildGenericResult } from "../src/generic-result.js";

const physical = /ног|плеч|ши|рук|оч|голов|дих|груд|тіл|спин|щелеп|жив|ступ|рух/iu;

for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const [levelKey, level] of Object.entries(theme.levels || {})) {
      const pools = buildGenericPools(level);
      for (const [name, pool] of Object.entries(pools)) {
        assert.equal(pool.length, 500, `${blockKey}/${themeKey}/${levelKey}: ${name}`);
        assert.equal(new Set(pool).size, 500, `${blockKey}/${themeKey}/${levelKey}: ${name} must be unique`);
      }

      assert.ok(pools.states.every((text) => physical.test(text)), `${blockKey}/${themeKey}: state must be physical`);
      assert.ok(pools.results.every((text) => physical.test(text)), `${blockKey}/${themeKey}: result must be physical`);

      const result = buildGenericResult(blockKey, themeKey, levelKey);
      assert.ok(result);
      assert.ok(result.text.includes("🌿🧠 *Стан*"));
      assert.ok(result.text.includes("🧩⚠️ *Проблема —"));
      assert.ok(result.text.includes("🪞🎁 *Вторинна вигода*"));
      assert.ok(result.text.includes("🌟🧭 *Значення в житті*"));
      assert.ok(result.text.includes("🔑✨ *Рішення*"));
      assert.ok(result.text.includes("✨ *Результат*"));
      assert.ok(!result.text.includes("✨ *Тепер ти відчуваєш*"));
      assert.ok(physical.test(result.text.split("🌿🧠 *Стан*")[1].split("🧩⚠️")[0]));
      assert.ok(physical.test(result.text.split("✨ *Результат*")[1]));
      assert.ok(result.text.length < 2800);
    }
  }
}

console.log("✅ Generic blocks: 500 unique variants per section, physical state/result");
