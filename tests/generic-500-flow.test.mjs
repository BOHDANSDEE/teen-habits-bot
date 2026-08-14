import assert from "node:assert/strict";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericPools } from "../src/generic-500-pools.js";
import { buildGenericResult } from "../src/generic-result.js";

const PHYSICAL = /ног|плеч|ши|рук|оч|голов|дих|груд|тіл|спин|щелеп|жив|стоп|колін|долон|кист|пальц|лопат|м’яз/iu;
const BODY_ZONES = [
  /голов|лоб|оч/iu,
  /щелеп/iu,
  /ши/iu,
  /плеч/iu,
  /груд|дих/iu,
  /спин|лопат/iu,
  /рук|кист|долон|пальц/iu,
  /жив/iu,
  /ног|колін|стоп/iu,
  /тіл|м’яз/iu
];
const FORBIDDEN_MEDICAL = /кровообіг\s+(?:покращ|нормаліз)|тиск\s+нормаліз|нервов\w*\s+систем\w*\s+вилікувал/iu;

function sharesBodyZone(a, b) {
  return BODY_ZONES.some((pattern) => pattern.test(a) && pattern.test(b));
}

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
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const [levelKey, level] of Object.entries(theme.levels || {})) {
      activeLevels += 1;
      const pools = buildGenericPools(level);

      for (const [name, pool] of Object.entries(pools)) {
        assert.equal(pool.length, 500, `${blockKey}/${themeKey}/${levelKey}: ${name}`);
        assert.equal(new Set(pool).size, 500, `${blockKey}/${themeKey}/${levelKey}: ${name} visible texts must be unique`);
      }

      assert.ok(pools.states.every((text) => text.startsWith("Ти відчуваєш ")));
      assert.ok(pools.results.every((text) => text.startsWith("Тепер ти відчуваєш")));
      assert.ok(pools.states.every((text) => PHYSICAL.test(text)), `${blockKey}/${themeKey}: state must be physical`);
      assert.ok(pools.results.every((text) => PHYSICAL.test(text)), `${blockKey}/${themeKey}: result must be physical`);

      for (let index = 0; index < 500; index += 1) {
        assert.ok(sharesBodyZone(pools.states[index], pools.results[index]), `${blockKey}/${themeKey}/${levelKey}[${index}] body zone`);
        assert.doesNotMatch(pools.states[index], FORBIDDEN_MEDICAL);
        assert.doesNotMatch(pools.results[index], FORBIDDEN_MEDICAL);
      }

      for (let sample = 0; sample < 20; sample += 1) {
        const result = buildGenericResult(blockKey, themeKey, levelKey);
        assert.ok(result);
        const state = sectionBetween(result.text, "🌿🧠 *Стан*\n", "\n\n🧩⚠️");
        const final = sectionBetween(result.text, "✨ *Тепер ти відчуваєш*\n", null);

        assert.ok(state.startsWith("Ти відчуваєш "));
        assert.ok(final.startsWith("Тепер ти відчуваєш"));
        assert.ok(sharesBodyZone(state, final), `${blockKey}/${themeKey}/${levelKey}: renderer body zone`);
        assert.ok(result.text.includes("🧩⚠️ *Проблема —"));
        assert.ok(result.text.includes("🪞🎁 *Вторинна вигода*"));
        assert.ok(result.text.includes("🌟🧭 *Значення в житті*"));
        assert.ok(result.text.includes("🔑✨ *Рішення*"));
        assert.ok(result.text.includes("✨ *Тепер ти відчуваєш*"));
        assert.ok(!result.text.includes("✨ *Результат*"));
        assert.doesNotMatch(result.text, /\bСенс\s*:/iu);
        assert.doesNotMatch(result.text, FORBIDDEN_MEDICAL);
        const gain = result.text.split("🪞🎁 *Вторинна вигода*")[1].split("🌟🧭")[0];
        assert.doesNotMatch(gain, /сценарій|патерн|механізм|внутрішня система/iu);
        assert.ok(result.text.length < 4096);
      }
    }
  }
}

assert.ok(activeLevels > 0);
console.log(`✅ Generic: ${activeLevels} active levels, 500 unique visible variants per pool, physical start/result aligned`);
