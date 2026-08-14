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

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

for (const [themeKey, theme] of Object.entries(MAIN_BLOCK.subthemes)) {
  const states = BODY_STATE_POOLS[themeKey];
  const afterStates = AFTER_POOLS[themeKey];

  assert.equal(states.length, 500, `${themeKey}: states length`);
  assert.equal(new Set(states).size, 500, `${themeKey}: states visible unique`);
  assert.ok(states.every((text) => text.startsWith("Ти відчуваєш ")));

  assert.equal(afterStates.length, 500, `${themeKey}: results length`);
  assert.equal(new Set(afterStates).size, 500, `${themeKey}: results visible unique`);
  assert.ok(afterStates.every((text) => /^Тепер ти відчуваєш(?:,|\s)/u.test(text)));

  for (let index = 0; index < 500; index += 1) {
    assert.ok(sharesBodyZone(states[index], afterStates[index]), `${themeKey}[${index}] must keep the same body zone`);
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
      assert.ok(/^Тепер ти відчуваєш(?:,|\s)/u.test(parts.result));
      assert.ok(sharesBodyZone(parts.state, parts.result), `${themeKey}/${levelKey}[${index}]: short card keeps body zone`);
      assert.ok(!JARGON.test(parts.gain), `${themeKey}/${levelKey}[${index}]: gain jargon`);
      assert.ok(sentenceCount(parts.meaning) <= 2, `${themeKey}/${levelKey}[${index}]: meaning max 2 sentences`);
      assert.ok(sentenceCount(parts.solution) <= 2, `${themeKey}/${levelKey}[${index}]: solution max 2 sentences`);
      assert.ok(result.text.includes("🧩⚠️ *Проблема —"));
      assert.ok(result.text.includes("🪞🎁 *Вторинна вигода*"));
      assert.ok(result.text.includes("🌟🧭 *Значення в житті*"));
      assert.ok(result.text.includes("🔑 *Рішення*"));
      assert.ok(!result.text.includes("🔑✨ *Рішення*"));
      assert.ok(result.text.includes("✨ *Тепер ти відчуваєш*"));
      assert.ok(!result.text.includes("✨ *Результат*"));
      assert.doesNotMatch(result.text, /\bСенс\s*:/iu);
      assert.doesNotMatch(result.text, FORBIDDEN_MEDICAL);
      assert.ok(result.text.length < 4096, `${themeKey}/${levelKey}[${index}]: Telegram limit`);
    }

    const guides = Array.from({ length: 500 }, (_, index) => buildFeelingGuide(themeKey, levelKey, index).text);
    assert.equal(new Set(guides).size, 500, `${themeKey}/${levelKey}: guided visible variants`);

    for (const text of guides) {
      assert.match(text, /^💭 \*Ти так це відчуваєш\?\*\n\nТи відчуваєш /u);
      const opening = text.split("\n\n")[1];
      const step1 = sectionBetween(text, "🔷 *Крок 1: Стан*\n", "\n\n🔷 *Крок 2: Дихання*");
      const step2 = sectionBetween(text, "🔷 *Крок 2: Дихання*\n", "\n\n🔷 *Крок 3: Опора*");
      const step3 = sectionBetween(text, "🔷 *Крок 3: Опора*\n", "\n\n🔷 *Крок 4: Рух*");
      const step4 = sectionBetween(text, "🔷 *Крок 4: Рух*\n", "\n\n🔑 *Рішення*");
      const solution = sectionBetween(text, "🔑 *Рішення*\n", "\n\n✨ *Тепер ти відчуваєш*");
      const final = sectionBetween(text, "✨ *Тепер ти відчуваєш*\n", null);

      assert.ok(sharesBodyZone(opening, step1), "guided step 1 must keep opening body zone");
      assert.match(step2, /вдих|видих|дихан/iu);
      assert.match(step3, /стоп|спин|поверх|сидін|стіл|колін|опор|ваг/iu);
      assert.match(step4, /рух|опуст|розтис|перевед|морг|змін|випрям|крок|поверн|притис/iu);
      assert.ok(/^Тепер ти відчуваєш(?:,|\s)/u.test(final));
      assert.ok(sharesBodyZone(opening, final), "guided final must keep opening body zone");
      assert.ok(sentenceCount(solution) <= 2, "guided solution max 2 sentences");
      assert.match(text, /🔑 \*Рішення\*/u);
      assert.doesNotMatch(text, /\bСенс\s*:/iu);
      assert.doesNotMatch(text, FORBIDDEN_MEDICAL);
      assert.ok(text.length < 4096);
    }
  }
}

const firstThemeKey = Object.keys(MAIN_BLOCK.subthemes)[0];
const firstLevelKey = Object.keys(MAIN_BLOCK.subthemes[firstThemeKey].levels)[0];
const continuation = buildContinuation(firstThemeKey, firstThemeKey, firstLevelKey);
assert.match(continuation.text, /^💭 \*Ти так це відчуваєш\?\*\n\nТи відчуваєш /u);
assert.match(continuation.text, /✨ \*Тепер ти відчуваєш\*\nТепер ти відчуваєш(?:,|\s)/u);
assert.equal(continuation.themeKey, firstThemeKey);
assert.equal(continuation.levelKey, firstLevelKey);
assert.ok(continuation.next);
assert.ok(continuation.text.length < 4096);

console.log("✅ Primary: 500 rendered visible variants per section + body-consistent guided flow passed");
