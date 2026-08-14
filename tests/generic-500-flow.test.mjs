import assert from "node:assert/strict";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericPools } from "../src/generic-500-pools.js";
import { buildGenericResult } from "../src/generic-result.js";

const PHYSICAL = /скрон|потилиц|лоб|голов|оч|повік|щелеп|ши|плеч|груд|ключиц|дих|спин|лопат|поперек|передпліч|зап’яст|зап'яст|рук|кист|долон|пальц|жив|таз|стегн|литк|щиколот|п’ят|п'ят|ног|стоп|колін|тіл|м’яз|м'яз/iu;
const BODY_ZONES = [
  /скрон|голов/iu,
  /потилиц/iu,
  /лоб/iu,
  /оч|повік/iu,
  /щелеп/iu,
  /ши/iu,
  /плеч/iu,
  /груд|ключиц|дих/iu,
  /спин|лопат|поперек/iu,
  /передпліч|зап’яст|зап'яст|рук|кист|долон|пальц/iu,
  /жив/iu,
  /таз/iu,
  /стегн|литк|щиколот|п’ят|п'ят|ног|стоп|колін/iu,
  /тіл|м’яз|м'яз/iu
];
const FORBIDDEN_MEDICAL = /кровообіг\s+(?:покращ|нормаліз)|тиск\s+нормаліз|нервов\w*\s+систем\w*\s+вилікувал|судин\w*\s+працю\w*\s+краще/iu;
const JARGON = /сценарій|патерн|механізм|внутрішня система/iu;

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

function visibleSections(text) {
  const problemHeaderStart = text.indexOf("🧩⚠️ *Проблема —");
  const problemBodyStart = text.indexOf("\n", problemHeaderStart) + 1;
  const gainHeaderStart = text.indexOf("\n\n🪞🎁 *Вторинна вигода*", problemBodyStart);
  return {
    state: sectionBetween(text, "🌿🧠 *Стан*\n", "\n\n🧩⚠️"),
    problem: text.slice(problemBodyStart, gainHeaderStart).trim(),
    gain: sectionBetween(text, "🪞🎁 *Вторинна вигода*\n", "\n\n🌟🧭 *Значення в житті*"),
    meaning: sectionBetween(text, "🌟🧭 *Значення в житті*\n", "\n\n🔑 *Рішення*"),
    solution: sectionBetween(text, "🔑 *Рішення*\n", "\n\n🔁 Прочитай це рішення"),
    result: sectionBetween(text, "✨ *Тепер ти відчуваєш*\n", null)
  };
}

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;
let activeLevels = 0;

for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  if (block.enabled === false) continue;
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const [levelKey, level] of Object.entries(theme.levels || {})) {
      activeLevels += 1;
      const pools = buildGenericPools(level);

      for (const [name, pool] of Object.entries(pools)) {
        assert.equal(pool.length, 500, `${blockKey}/${themeKey}/${levelKey}: ${name}`);
        assert.equal(new Set(pool).size, 500, `${blockKey}/${themeKey}/${levelKey}: ${name} visible texts must be unique`);
      }

      assert.ok(pools.states.every((text) => text.startsWith("Ти відчуваєш ")));
      assert.ok(pools.results.every((text) => /^Тепер ти відчуваєш(?:,|\s)/u.test(text)));
      assert.ok(pools.states.every((text) => PHYSICAL.test(text)), `${blockKey}/${themeKey}: state must be physical`);
      assert.ok(pools.results.every((text) => PHYSICAL.test(text)), `${blockKey}/${themeKey}: result must be physical`);
      assert.ok(pools.gains.every((text) => !JARGON.test(text)), `${blockKey}/${themeKey}: gain plain language`);
      assert.ok(pools.meanings.every((text) => sentenceCount(text) <= 2), `${blockKey}/${themeKey}: meaning max 2 sentences`);
      assert.ok(pools.solutions.every((text) => sentenceCount(text) <= 2), `${blockKey}/${themeKey}: solution max 2 sentences`);

      for (let index = 0; index < 500; index += 1) {
        assert.ok(sharesBodyZone(pools.states[index], pools.results[index]), `${blockKey}/${themeKey}/${levelKey}[${index}] source body zone`);
        assert.doesNotMatch(pools.states[index], FORBIDDEN_MEDICAL);
        assert.doesNotMatch(pools.results[index], FORBIDDEN_MEDICAL);
      }

      const rendered = Array.from({ length: 500 }, (_, index) => buildGenericResult(blockKey, themeKey, levelKey, index));
      const visible = rendered.map((result) => visibleSections(result.text));

      for (const key of ["state", "problem", "gain", "meaning", "solution", "result"]) {
        assert.equal(new Set(visible.map((parts) => parts[key])).size, 500, `${blockKey}/${themeKey}/${levelKey}: ${key} rendered visible unique`);
      }

      for (let index = 0; index < 500; index += 1) {
        const result = rendered[index];
        const parts = visible[index];
        assert.ok(result);
        assert.equal(result.variantIndex, index);
        assert.equal(result.bodyVariantIndex, index);
        assert.ok(parts.state.startsWith("Ти відчуваєш "));
        assert.equal(sentenceCount(parts.state), 1, `${blockKey}/${themeKey}/${levelKey}[${index}]: one state sentence`);
        assert.ok(parts.result.startsWith("Тепер ти відчуваєш "));
        assert.equal(sentenceCount(parts.result), 1, `${blockKey}/${themeKey}/${levelKey}[${index}]: one result sentence`);
        assert.match(parts.result, /полегшення/iu);
        assert.ok(PHYSICAL.test(parts.state));
        assert.ok(PHYSICAL.test(parts.result));
        assert.ok(sharesBodyZone(parts.state, parts.result), `${blockKey}/${themeKey}/${levelKey}[${index}]: renderer body zone`);
        assert.ok(!JARGON.test(parts.gain));
        assert.ok(sentenceCount(parts.meaning) <= 2);
        assert.ok(sentenceCount(parts.solution) <= 2);
        assert.ok(result.text.includes("🧩⚠️ *Проблема —"));
        assert.ok(result.text.includes("🪞🎁 *Вторинна вигода*"));
        assert.ok(result.text.includes("🌟🧭 *Значення в житті*"));
        assert.ok(result.text.includes("🔑 *Рішення*"));
        assert.ok(result.text.includes("✨ *Тепер ти відчуваєш*"));
        assert.ok(!result.text.includes("✨ *Результат*"));
        assert.doesNotMatch(result.text, /\bСенс\s*:/iu);
        assert.doesNotMatch(result.text, FORBIDDEN_MEDICAL);
        assert.ok(result.text.length < 4096, `${blockKey}/${themeKey}/${levelKey}[${index}]: Telegram limit`);
      }
    }
  }
}

assert.ok(activeLevels > 0);
console.log(`✅ Generic: ${activeLevels} active levels, 500 rendered one-sentence body states/results, non-body sections preserved`);
