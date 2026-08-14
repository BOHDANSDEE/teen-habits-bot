import assert from "node:assert/strict";
import { BODY_STATE_POOLS } from "../src/body-state-pools.js";
import { LAZY_AFTER_STATES } from "../src/after-state-lazy.js";
import { APATHY_AFTER_STATES } from "../src/after-state-apathy.js";
import { PROCRASTINATION_AFTER_STATES } from "../src/after-state-procrastination.js";
import { MAIN_BLOCK } from "../src/content.js";
import { buildFeelingGuide } from "../src/feeling-guide.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool } from "../src/level-context-pools.js";
import { buildPlainSecondaryGain } from "../src/plain-secondary-gain.js";
import { getLevelProblemPool } from "../src/problem-pools.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const AFTER_POOLS = {
  lazy: LAZY_AFTER_STATES,
  apathy: APATHY_AFTER_STATES,
  procrastination: PROCRASTINATION_AFTER_STATES
};

const BODY_ZONES = [
  /скрон/iu,
  /потилиц/iu,
  /лоб/iu,
  /оч|повік/iu,
  /щелеп/iu,
  /ши/iu,
  /плеч/iu,
  /груд|ключиц|дих/iu,
  /спин|лопат|поперек/iu,
  /передпліч|зап’яст|зап'яст|кист|долон|пальц|рук/iu,
  /жив/iu,
  /таз/iu,
  /стегн|литк|щиколот|п’ят|п'ят|колін|стоп|ног/iu,
  /тіл|м’яз|м'яз/iu
];

const FORBIDDEN_MEDICAL = /кровообіг\s+(?:покращ|нормаліз)|тиск\s+нормаліз|нервов\w*\s+систем\w*\s+вилікувал|судин\w*\s+працю\w*\s+краще/iu;
const JARGON = /сценарій|патерн|механізм|внутрішня система/iu;
const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

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

function shortSections(text) {
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

for (const [themeKey, theme] of Object.entries(MAIN_BLOCK.subthemes)) {
  const states = BODY_STATE_POOLS[themeKey];
  const afterStates = AFTER_POOLS[themeKey];

  assert.equal(states.length, 500, `${themeKey}: states length`);
  assert.equal(new Set(states).size, 500, `${themeKey}: states visible unique`);
  assert.ok(states.every((text) => text.startsWith("Ти відчуваєш ")));
  assert.ok(states.every((text) => sentenceCount(text) === 1), `${themeKey}: state exactly one sentence`);

  assert.equal(afterStates.length, 500, `${themeKey}: results length`);
  assert.equal(new Set(afterStates).size, 500, `${themeKey}: results visible unique`);
  assert.ok(afterStates.every((text) => text.startsWith("Тепер ти відчуваєш ")));
  assert.ok(afterStates.every((text) => sentenceCount(text) === 1), `${themeKey}: result exactly one sentence`);
  assert.ok(afterStates.every((text) => /полегшення/iu.test(text)), `${themeKey}: explicit relief`);

  for (let index = 0; index < 500; index += 1) {
    assert.ok(sharesBodyZone(states[index], afterStates[index]), `${themeKey}[${index}] same body zone`);
    assert.doesNotMatch(states[index], FORBIDDEN_MEDICAL);
    assert.doesNotMatch(afterStates[index], FORBIDDEN_MEDICAL);
  }

  assert.equal(theme.pools.affirmations.length, 500);
  assert.equal(new Set(theme.pools.affirmations).size, 500);

  for (const [levelKey] of Object.entries(theme.levels)) {
    const problems = getLevelProblemPool(themeKey, levelKey);
    const gains = getLevelSecondaryGainPool(themeKey, levelKey);
    const plainGains = gains.map(buildPlainSecondaryGain);
    const meanings = getLevelLifeMeaningPool(themeKey, levelKey);

    for (const [name, pool] of Object.entries({ problems, gains, plainGains, meanings })) {
      assert.equal(pool.length, 500, `${themeKey}/${levelKey}: ${name} length`);
      assert.equal(new Set(pool).size, 500, `${themeKey}/${levelKey}: ${name} visible unique`);
    }
    assert.ok(plainGains.every((text) => !JARGON.test(text)), `${themeKey}/${levelKey}: secondary gain plain language`);

    const rendered = Array.from({ length: 500 }, (_, index) => buildResult(themeKey, levelKey, index));
    const visible = rendered.map((result) => shortSections(result.text));

    for (const key of ["state", "problem", "gain", "meaning", "solution", "result"]) {
      assert.equal(new Set(visible.map((parts) => parts[key])).size, 500, `${themeKey}/${levelKey}: ${key} rendered visible unique`);
    }

    for (let index = 0; index < 500; index += 1) {
      const result = rendered[index];
      const parts = visible[index];
      assert.ok(result);
      assert.equal(result.variantIndex, index);
      assert.equal(result.bodyVariantIndex, index);
      assert.ok(parts.state.startsWith("Ти відчуваєш "));
      assert.equal(sentenceCount(parts.state), 1, `${themeKey}/${levelKey}[${index}]: one state sentence`);
      assert.ok(parts.result.startsWith("Тепер ти відчуваєш "));
      assert.equal(sentenceCount(parts.result), 1, `${themeKey}/${levelKey}[${index}]: one result sentence`);
      assert.match(parts.result, /полегшення/iu);
      assert.ok(sharesBodyZone(parts.state, parts.result), `${themeKey}/${levelKey}[${index}]: short card keeps body zone`);
      assert.ok(!JARGON.test(parts.gain), `${themeKey}/${levelKey}[${index}]: gain jargon`);
      assert.ok(sentenceCount(parts.meaning) <= 2, `${themeKey}/${levelKey}[${index}]: meaning max 2 sentences`);
      assert.ok(sentenceCount(parts.solution) <= 2, `${themeKey}/${levelKey}[${index}]: solution max 2 sentences`);
      assert.ok(result.text.includes("🧩⚠️ *Проблема —"));
      assert.ok(result.text.includes("🪞🎁 *Вторинна вигода*"));
      assert.ok(result.text.includes("🌟🧭 *Значення в житті*"));
      assert.ok(result.text.includes("🔑 *Рішення*"));
      assert.ok(result.text.includes("✨ *Тепер ти відчуваєш*"));
      assert.ok(!result.text.includes("✨ *Результат*"));
      assert.doesNotMatch(result.text, /\bСенс\s*:/iu);
      assert.doesNotMatch(result.text, FORBIDDEN_MEDICAL);
      assert.ok(result.text.length < 4096, `${themeKey}/${levelKey}[${index}]: Telegram limit`);
    }

    const guides = Array.from({ length: 500 }, (_, index) => buildFeelingGuide(themeKey, levelKey, index).text);
    assert.equal(new Set(guides).size, 500, `${themeKey}/${levelKey}: 500 guided visible variants`);

    for (let index = 0; index < 500; index += 1) {
      const text = guides[index];
      const opening = sectionBetween(text, "💭 *Ти так це відчуваєш?*\n\n", "\n\n✨ *Тепер ти відчуваєш*");
      const final = sectionBetween(text, "✨ *Тепер ти відчуваєш*\n", null);
      assert.equal(opening, states[index], `${themeKey}/${levelKey}[${index}]: guide uses exact state`);
      assert.equal(final, afterStates[index], `${themeKey}/${levelKey}[${index}]: guide uses exact result`);
      assert.equal(sentenceCount(opening), 1);
      assert.equal(sentenceCount(final), 1);
      assert.match(final, /полегшення/iu);
      assert.ok(sharesBodyZone(opening, final), "guided state/result body zone");
      assert.doesNotMatch(text, /Крок\s*[1-4]|🔑\s*\*Рішення\*|Давай на кілька хвилин|Поміть|Зверни увагу/iu);
      assert.doesNotMatch(text, FORBIDDEN_MEDICAL);
      assert.ok(text.length < 4096);
    }
  }
}

const firstThemeKey = Object.keys(MAIN_BLOCK.subthemes)[0];
const firstLevelKey = Object.keys(MAIN_BLOCK.subthemes[firstThemeKey].levels)[0];
const continuation = buildContinuation(firstThemeKey, firstThemeKey, firstLevelKey);
assert.match(continuation.text, /^💭 \*Ти так це відчуваєш\?\*\n\nТи відчуваєш /u);
assert.match(continuation.text, /✨ \*Тепер ти відчуваєш\*\nТепер ти відчуваєш /u);
assert.doesNotMatch(continuation.text, /Крок\s*[1-4]|🔑\s*\*Рішення\*/u);
assert.equal(continuation.themeKey, firstThemeKey);
assert.equal(continuation.levelKey, firstLevelKey);
assert.ok(continuation.next);
assert.ok(continuation.text.length < 4096);

console.log("✅ Primary: 500 one-sentence body states/results + 500 minimal guided variants passed");
