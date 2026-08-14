import assert from "node:assert/strict";
import { BODY_STATE_POOLS } from "../src/body-state-pools.js";
import { MAIN_BLOCK } from "../src/content.js";
import { buildFeelingGuide } from "../src/feeling-guide.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool } from "../src/level-context-pools.js";
import { buildPlainSecondaryGain } from "../src/plain-secondary-gain.js";
import { getLevelProblemPool } from "../src/problem-pools.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

for (const [themeKey, theme] of Object.entries(MAIN_BLOCK.subthemes)) {
  assert.equal(BODY_STATE_POOLS[themeKey].length, 500);
  assert.equal(new Set(BODY_STATE_POOLS[themeKey]).size, 500);
  assert.equal(theme.pools.affirmations.length, 500);
  assert.equal(new Set(theme.pools.affirmations).size, 500);

  for (const [levelKey] of Object.entries(theme.levels)) {
    const problems = getLevelProblemPool(themeKey, levelKey);
    const gains = getLevelSecondaryGainPool(themeKey, levelKey);
    const plainGains = gains.map(buildPlainSecondaryGain);
    const meanings = getLevelLifeMeaningPool(themeKey, levelKey);
    assert.equal(problems.length, 500);
    assert.equal(new Set(problems).size, 500);
    assert.equal(gains.length, 500);
    assert.equal(new Set(gains).size, 500);
    assert.equal(new Set(plainGains).size, 500);
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
    const gain = result.text.split("🪞🎁 *Вторинна вигода*")[1].split("🌟🧭")[0];
    assert.ok(!/сценарій|патерн|механізм|внутрішня система/iu.test(gain));
    assert.ok(result.text.length < 2800);

    const guides = Array.from({ length: 500 }, (_, index) => buildFeelingGuide(themeKey, levelKey, index).text);
    assert.equal(new Set(guides).size, 500, `${themeKey}/${levelKey}: guided variants`);
    for (const text of guides) {
      assert.match(text, /^💭 \*Ти так це відчуваєш\?\*\n\nТи відчуваєш/u);
      assert.match(text, /очі|голов|шия|плеч|щелеп|пальц|руки|ног|стоп|спин|тіло/iu);
      assert.match(text, /Крок 1: Стан/u);
      assert.match(text, /Крок 2: Дихання/u);
      assert.match(text, /Крок 3: Опора/u);
      assert.match(text, /Крок 4: Рух/u);
      assert.match(text, /🔑 \*Рішення\*/u);
      assert.match(text, /✨ \*Тепер ти відчуваєш\*/u);
      assert.match(text, /легш|тепл|спокійн|вільн|розслаб|опор/iu);
      assert.doesNotMatch(text, /\bСенс\s*:/iu);
      assert.doesNotMatch(text, /кровообіг\s+(покращ|нормаліз)/iu);
      assert.ok(text.length < 4096);
    }
  }
}

const firstThemeKey = Object.keys(MAIN_BLOCK.subthemes)[0];
const firstLevelKey = Object.keys(MAIN_BLOCK.subthemes[firstThemeKey].levels)[0];
const continuation = buildContinuation(firstThemeKey, firstThemeKey, firstLevelKey);
assert.match(continuation.text, /^💭 \*Ти так це відчуваєш\?\*\n\nТи відчуваєш/u);
assert.match(continuation.text, /✨ \*Тепер ти відчуваєш\*/u);
assert.equal(continuation.themeKey, firstThemeKey);
assert.equal(continuation.levelKey, firstLevelKey);
assert.ok(continuation.next);

console.log("✅ 500-pool flow + body-specific guided start/result passed");
