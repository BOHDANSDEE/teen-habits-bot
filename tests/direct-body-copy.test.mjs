import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import {
  GENERIC_DIRECT_RESULTS,
  GENERIC_DIRECT_STATES,
  PRIMARY_BODY_RESULTS,
  PRIMARY_BODY_STATES
} from "../src/direct-body-copy.js";
import { buildFeelingGuide } from "../src/feeling-guide.js";
import { buildGenericPools } from "../src/generic-500-pools.js";
import { buildGenericResult } from "../src/generic-result.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool } from "../src/level-context-pools.js";
import { buildPlainSecondaryGain } from "../src/plain-secondary-gain.js";
import { getLevelProblemPool } from "../src/problem-pools.js";
import { buildResult } from "../src/renderer.js";

const DIRECT_PHYSICAL = /біль|важк|мляв|втом|тиск|напруг|стиск|стиснут|скут|прохолод|холод|дихан|неспокій/iu;
const FORBIDDEN_MEDICAL = /кровообіг\s+(?:покращ|нормаліз)|тиск\s+нормаліз|нервов\w*\s+систем\w*\s+вилікувал|судин\w*\s+працю\w*\s+краще/iu;

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

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

function sentence(text = "") {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
}

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

function lockedSections(text) {
  const problemBlock = sectionBetween(text, "🧩⚠️ *Проблема — ", "\n\n🪞🎁");
  const firstBreak = problemBlock.indexOf("\n");
  assert.ok(firstBreak >= 0, "problem block must contain heading and body");
  return {
    problem: problemBlock.slice(firstBreak + 1).trim(),
    gain: sectionBetween(text, "🪞🎁 *Вторинна вигода*\n", "\n\n🌟🧭"),
    meaning: sectionBetween(text, "🌟🧭 *Значення в житті*\n", "\n\n🔑"),
    solution: sectionBetween(text, "🔑 *Рішення*\n", "\n\n🔁")
  };
}

function assertLockedSections(text, expected, label) {
  const actual = lockedSections(text);
  assert.equal(actual.problem, expected.problem, `${label}: problem must stay untouched`);
  assert.equal(actual.gain, expected.gain, `${label}: secondary gain must stay untouched`);
  assert.equal(actual.meaning, expected.meaning, `${label}: life meaning must stay untouched`);
  assert.equal(actual.solution, expected.solution, `${label}: solution must stay untouched`);
}

function assertDirectState(state, label) {
  assert.ok(state.startsWith("Ти відчуваєш "), `${label}: direct state prefix`);
  assert.equal(sentenceCount(state), 1, `${label}: state must be exactly one sentence`);
  assert.match(state, DIRECT_PHYSICAL, `${label}: concrete physical sensation`);
  assert.doesNotMatch(state, FORBIDDEN_MEDICAL, `${label}: no medical guarantee`);
}

function assertDirectResult(result, label) {
  assert.ok(result.startsWith("Тепер ти відчуваєш "), `${label}: direct result prefix`);
  assert.equal(sentenceCount(result), 1, `${label}: result must be exactly one sentence`);
  assert.match(result, /полегшення/iu, `${label}: result must explicitly say relief`);
  assert.doesNotMatch(result, FORBIDDEN_MEDICAL, `${label}: no medical guarantee`);
}

for (const themeKey of Object.keys(MAIN_BLOCK.subthemes)) {
  const states = PRIMARY_BODY_STATES[themeKey];
  const results = PRIMARY_BODY_RESULTS[themeKey];
  assert.equal(states.length, 500, `${themeKey}: states length`);
  assert.equal(results.length, 500, `${themeKey}: results length`);
  assert.equal(new Set(states).size, 500, `${themeKey}: 500 unique states`);
  assert.equal(new Set(results).size, 500, `${themeKey}: 500 unique results`);

  for (let index = 0; index < 500; index += 1) {
    assertDirectState(states[index], `${themeKey}/state/${index}`);
    assertDirectResult(results[index], `${themeKey}/result/${index}`);
    assert.ok(sharesBodyZone(states[index], results[index]), `${themeKey}/${index}: body zone must match`);
  }

  for (const levelKey of Object.keys(MAIN_BLOCK.subthemes[themeKey].levels)) {
    const source = {
      problems: getLevelProblemPool(themeKey, levelKey),
      gains: getLevelSecondaryGainPool(themeKey, levelKey),
      meanings: getLevelLifeMeaningPool(themeKey, levelKey),
      solutions: MAIN_BLOCK.subthemes[themeKey].pools?.affirmations || []
    };
    const visibleStates = new Set();
    const visibleResults = new Set();
    const visibleGuides = new Set();

    for (let index = 0; index < 500; index += 1) {
      const rendered = buildResult(themeKey, levelKey, index);
      const state = sectionBetween(rendered.text, "🌿🧠 *Стан*\n", "\n\n🧩⚠️");
      const result = sectionBetween(rendered.text, "✨ *Тепер ти відчуваєш*\n", null);
      assertDirectState(state, `${themeKey}/${levelKey}/state/${index}`);
      assertDirectResult(result, `${themeKey}/${levelKey}/result/${index}`);
      assert.ok(sharesBodyZone(state, result), `${themeKey}/${levelKey}/${index}: rendered body zone`);
      assertLockedSections(
        rendered.text,
        {
          problem: sentence(source.problems[index]),
          gain: buildPlainSecondaryGain(sentence(source.gains[index])),
          meaning: sentence(source.meanings[index]),
          solution: sentence(source.solutions[index])
        },
        `${themeKey}/${levelKey}/locked/${index}`
      );
      visibleStates.add(state);
      visibleResults.add(result);

      const guide = buildFeelingGuide(themeKey, levelKey, index);
      assert.ok(guide);
      assert.equal(guide.variantIndex, index);
      const guidedState = sectionBetween(guide.text, "💭 *Ти так це відчуваєш?*\n\n", "\n\n✨ *Тепер ти відчуваєш*");
      const guidedResult = sectionBetween(guide.text, "✨ *Тепер ти відчуваєш*\n", null);
      assert.equal(guidedState, states[index], `${themeKey}/${levelKey}/guide/${index}: exact state`);
      assert.equal(guidedResult, results[index], `${themeKey}/${levelKey}/guide/${index}: exact result`);
      assertDirectState(guidedState, `${themeKey}/${levelKey}/guide-state/${index}`);
      assertDirectResult(guidedResult, `${themeKey}/${levelKey}/guide-result/${index}`);
      assert.doesNotMatch(guide.text, /Крок\s*[1-4]|🔑\s*\*Рішення\*|Давай на кілька хвилин|Поміть|Зверни увагу/iu);
      visibleGuides.add(guide.text);
    }

    assert.equal(visibleStates.size, 500, `${themeKey}/${levelKey}: rendered states unique`);
    assert.equal(visibleResults.size, 500, `${themeKey}/${levelKey}: rendered results unique`);
    assert.equal(visibleGuides.size, 500, `${themeKey}/${levelKey}: guided variants unique`);
  }
}

assert.equal(GENERIC_DIRECT_STATES.length, 500);
assert.equal(GENERIC_DIRECT_RESULTS.length, 500);
assert.equal(new Set(GENERIC_DIRECT_STATES).size, 500);
assert.equal(new Set(GENERIC_DIRECT_RESULTS).size, 500);

for (let index = 0; index < 500; index += 1) {
  assertDirectState(GENERIC_DIRECT_STATES[index], `generic/state/${index}`);
  assertDirectResult(GENERIC_DIRECT_RESULTS[index], `generic/result/${index}`);
  assert.ok(sharesBodyZone(GENERIC_DIRECT_STATES[index], GENERIC_DIRECT_RESULTS[index]), `generic/${index}: body zone must match`);
}

let genericLevels = 0;
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  if (block.enabled === false) continue;
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const levelKey of Object.keys(theme.levels || {})) {
      genericLevels += 1;
      const source = buildGenericPools(theme.levels[levelKey]);
      const visibleStates = new Set();
      const visibleResults = new Set();

      for (let index = 0; index < 500; index += 1) {
        const rendered = buildGenericResult(blockKey, themeKey, levelKey, index);
        const state = sectionBetween(rendered.text, "🌿🧠 *Стан*\n", "\n\n🧩⚠️");
        const result = sectionBetween(rendered.text, "✨ *Тепер ти відчуваєш*\n", null);
        assertDirectState(state, `${blockKey}/${themeKey}/${levelKey}/state/${index}`);
        assertDirectResult(result, `${blockKey}/${themeKey}/${levelKey}/result/${index}`);
        assert.ok(sharesBodyZone(state, result), `${blockKey}/${themeKey}/${levelKey}/${index}: rendered body zone`);
        assertLockedSections(
          rendered.text,
          {
            problem: source.problems[index],
            gain: source.gains[index],
            meaning: source.meanings[index],
            solution: source.solutions[index]
          },
          `${blockKey}/${themeKey}/${levelKey}/locked/${index}`
        );
        visibleStates.add(state);
        visibleResults.add(result);
      }

      assert.equal(visibleStates.size, 500, `${blockKey}/${themeKey}/${levelKey}: rendered states unique`);
      assert.equal(visibleResults.size, 500, `${blockKey}/${themeKey}/${levelKey}: rendered results unique`);
    }
  }
}

assert.ok(genericLevels > 0);
console.log(`✅ Direct body-only copy: 500 one-sentence states/results, 500 minimal guided variants, non-body sections locked across ${genericLevels} generic levels`);
