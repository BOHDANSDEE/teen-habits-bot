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
  "у голові",
  "у лобі",
  "у скронях",
  "у потилиці",
  "в очах",
  "у щелепі",
  "у шиї",
  "у плечах",
  "між лопатками",
  "у спині",
  "у попереку",
  "у грудях",
  "у животі",
  "у передпліччях",
  "у зап’ястях",
  "у долонях",
  "у пальцях",
  "у руках",
  "у стегнах",
  "у колінах",
  "у литках",
  "у щиколотках",
  "у п’ятах",
  "у стопах",
  "у ногах"
];

const FORBIDDEN_MEDICAL = /кровообіг\s+(?:покращ|нормаліз)|тиск\s+нормаліз|нервов\w*\s+систем\w*\s+вилікувал|судин\w*\s+працю\w*\s+краще/iu;
const FORBIDDEN_EXTRA_CONTEXT = /\bколи\b|\bпісля\b|під час|підвод|підвести|рух|сидін|стоя|положенн|пауза|наступн|день|прямо зараз/iu;
const JARGON = /сценарій|патерн|механізм|внутрішня система/iu;
const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

function bodyZone(text = "") {
  return BODY_ZONES.find((zone) => String(text).includes(zone)) || null;
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
  assert.ok(states.every((text) => !FORBIDDEN_EXTRA_CONTEXT.test(text)), `${themeKey}: state no extra context`);

  assert.equal(afterStates.length, 500, `${themeKey}: results length`);
  assert.equal(new Set(afterStates).size, 500, `${themeKey}: results visible unique`);
  assert.ok(afterStates.every((text) => text.startsWith("Тепер ти відчуваєш ")));
  assert.ok(afterStates.every((text) => sentenceCount(text) === 1), `${themeKey}: result exactly one sentence`);
  assert.ok(afterStates.every((text) => /полегшення/iu.test(text)), `${themeKey}: explicit relief`);
  assert.ok(afterStates.every((text) => !FORBIDDEN_EXTRA_CONTEXT.test(text)), `${themeKey}: result no extra context`);

  for (let index = 0; index < 500; index += 1) {
    const zone = bodyZone(states[index]);
    assert.ok(zone, `${themeKey}[${index}] state zone`);
    assert.equal(zone, bodyZone(afterStates[index]), `${themeKey}[${index}] same exact body zone`);
    assert.ok(states[index].endsWith(`${zone}.`), `${themeKey}[${index}] state ends at body zone`);
    assert.ok(afterStates[index].endsWith(`${zone}.`), `${themeKey}[${index}] result ends at body zone`);
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
      const zone = bodyZone(parts.state);
      assert.ok(result);
      assert.equal(result.variantIndex, index);
      assert.equal(result.bodyVariantIndex, index);
      assert.ok(parts.state.startsWith("Ти відчуваєш "));
      assert.equal(sentenceCount(parts.state), 1, `${themeKey}/${levelKey}[${index}]: one state sentence`);
      assert.ok(parts.result.startsWith("Тепер ти відчуваєш "));
      assert.equal(sentenceCount(parts.result), 1, `${themeKey}/${levelKey}[${index}]: one result sentence`);
      assert.match(parts.result, /полегшення/iu);
      assert.ok(zone);
      assert.equal(zone, bodyZone(parts.result), `${themeKey}/${levelKey}[${index}]: same exact body zone`);
      assert.ok(parts.state.endsWith(`${zone}.`));
      assert.ok(parts.result.endsWith(`${zone}.`));
      assert.doesNotMatch(parts.state, FORBIDDEN_EXTRA_CONTEXT);
      assert.doesNotMatch(parts.result, FORBIDDEN_EXTRA_CONTEXT);
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
      assert.doesNotMatch(text, /💭|Ти так це відчуваєш\?/iu);
      const opening = text.split("\n\n✨ *Тепер ти відчуваєш*\n")[0].trim();
      const final = sectionBetween(text, "✨ *Тепер ти відчуваєш*\n", null);
      const zone = bodyZone(opening);
      assert.equal(opening, states[index], `${themeKey}/${levelKey}[${index}]: guide uses exact state`);
      assert.equal(final, afterStates[index], `${themeKey}/${levelKey}[${index}]: guide uses exact result`);
      assert.equal(sentenceCount(opening), 1);
      assert.equal(sentenceCount(final), 1);
      assert.match(final, /полегшення/iu);
      assert.ok(zone);
      assert.equal(zone, bodyZone(final), "guided exact body zone");
      assert.ok(opening.endsWith(`${zone}.`));
      assert.ok(final.endsWith(`${zone}.`));
      assert.doesNotMatch(opening, FORBIDDEN_EXTRA_CONTEXT);
      assert.doesNotMatch(final, FORBIDDEN_EXTRA_CONTEXT);
      assert.doesNotMatch(text, /Крок\s*[1-4]|🔑\s*\*Рішення\*|Давай на кілька хвилин|Поміть|Зверни увагу/iu);
      assert.doesNotMatch(text, FORBIDDEN_MEDICAL);
      assert.ok(text.length < 4096);
    }
  }
}

const firstThemeKey = Object.keys(MAIN_BLOCK.subthemes)[0];
const firstLevelKey = Object.keys(MAIN_BLOCK.subthemes[firstThemeKey].levels)[0];
const continuation = buildContinuation(firstThemeKey, firstThemeKey, firstLevelKey);
assert.match(continuation.text, /^Ти відчуваєш /u);
assert.doesNotMatch(continuation.text, /💭|Ти так це відчуваєш\?/iu);
assert.match(continuation.text, /✨ \*Тепер ти відчуваєш\*\nТепер ти відчуваєш /u);
assert.doesNotMatch(continuation.text, /Крок\s*[1-4]|🔑\s*\*Рішення\*/u);
assert.equal(continuation.themeKey, firstThemeKey);
assert.equal(continuation.levelKey, firstLevelKey);
assert.ok(continuation.next);
assert.ok(continuation.text.length < 4096);

console.log("✅ Primary: 500 short body states/results + 500 guided variants without the old heading passed");
