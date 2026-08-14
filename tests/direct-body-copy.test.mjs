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
import { buildGenericResult } from "../src/generic-result.js";
import { buildResult } from "../src/renderer.js";

const DIRECT_PHYSICAL = /біль|важк|мляв|втом|тиск|напруг|стиск|скут|сонлив|прохолод|холод|дихан|слабк|неспокій|м’яз/iu;
const DIRECT_SECOND = /тіл|рух|м’яз|спер|опор|сісти|поза|рук|ног|напруг|важк|втом|плеч|зупин|пауза/iu;
const PHYSICAL_RELIEF = /легш|слабш|м’якш|м'якш|розслаб|вільніш|тепліш|спокійніш|менше|відпочил|розтис|вирівнял|краще|рухлив/iu;
const POSITIVE_EMOTION = /полегш|рад|настр|спок|задов|позит|щаст|приєм|впев|кращ|емоці|комфорт/iu;
const OLD_ABSTRACT_STATE = /це (?:особливо|сильніше|помітніше)|відчуття стає|тіло нагадує про це|тема .* потребує рішення/iu;

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

function assertDirectState(state, label) {
  const sentences = state.split(/(?<=[.!?])\s+/u).filter(Boolean);
  assert.ok(state.startsWith("Ти відчуваєш "), `${label}: must start directly`);
  assert.ok(sentences.length >= 2, `${label}: needs two concrete physical sentences`);
  assert.match(sentences[0], DIRECT_PHYSICAL, `${label}: first sentence needs a concrete body sensation`);
  assert.match(sentences[1], DIRECT_SECOND, `${label}: second sentence must stay physical`);
  assert.doesNotMatch(state, OLD_ABSTRACT_STATE, `${label}: old abstract wording must not return`);
}

function assertDirectResult(result, label) {
  const sentences = result.split(/(?<=[.!?])\s+/u).filter(Boolean);
  assert.ok(result.startsWith("Тепер ти відчуваєш,"), `${label}: result prefix`);
  assert.match(sentences[0], PHYSICAL_RELIEF, `${label}: first result sentence needs concrete physical relief`);
  assert.ok(sentences[1]?.startsWith("Ти відчуваєш"), `${label}: second result sentence needs an explicit feeling`);
  assert.match(result, POSITIVE_EMOTION, `${label}: result needs a positive emotional feeling`);
}

for (const themeKey of Object.keys(MAIN_BLOCK.subthemes)) {
  const states = PRIMARY_BODY_STATES[themeKey];
  const results = PRIMARY_BODY_RESULTS[themeKey];
  assert.equal(states.length, 500);
  assert.equal(results.length, 500);
  assert.equal(new Set(states).size, 500);
  assert.equal(new Set(results).size, 500);

  for (let index = 0; index < 500; index += 1) {
    assertDirectState(states[index], `${themeKey}/state/${index}`);
    assertDirectResult(results[index], `${themeKey}/result/${index}`);
    assert.ok(sharesBodyZone(states[index], results[index]), `${themeKey}/${index}: body zone must match`);
  }

  for (const levelKey of Object.keys(MAIN_BLOCK.subthemes[themeKey].levels)) {
    const visibleStates = new Set();
    const visibleResults = new Set();
    for (let index = 0; index < 500; index += 1) {
      const rendered = buildResult(themeKey, levelKey, index);
      const state = sectionBetween(rendered.text, "🌿🧠 *Стан*\n", "\n\n🧩⚠️");
      const result = sectionBetween(rendered.text, "✨ *Тепер ти відчуваєш*\n", null);
      assertDirectState(state, `${themeKey}/${levelKey}/rendered-state/${index}`);
      assertDirectResult(result, `${themeKey}/${levelKey}/rendered-result/${index}`);
      visibleStates.add(state);
      visibleResults.add(result);

      const guide = buildFeelingGuide(themeKey, levelKey, index).text;
      const guidedResult = sectionBetween(guide, "✨ *Тепер ти відчуваєш*\n", null);
      assert.match(guidedResult, PHYSICAL_RELIEF, `${themeKey}/${levelKey}/guide/${index}: physical relief`);
      assert.match(guidedResult, POSITIVE_EMOTION, `${themeKey}/${levelKey}/guide/${index}: positive feeling`);
    }
    assert.equal(visibleStates.size, 500, `${themeKey}/${levelKey}: rendered states unique`);
    assert.equal(visibleResults.size, 500, `${themeKey}/${levelKey}: rendered results unique`);
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
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const levelKey of Object.keys(theme.levels || {})) {
      genericLevels += 1;
      const visibleStates = new Set();
      const visibleResults = new Set();
      for (let index = 0; index < 500; index += 1) {
        const rendered = buildGenericResult(blockKey, themeKey, levelKey, index);
        const state = sectionBetween(rendered.text, "🌿🧠 *Стан*\n", "\n\n🧩⚠️");
        const result = sectionBetween(rendered.text, "✨ *Тепер ти відчуваєш*\n", null);
        assertDirectState(state, `${blockKey}/${themeKey}/${levelKey}/state/${index}`);
        assertDirectResult(result, `${blockKey}/${themeKey}/${levelKey}/result/${index}`);
        visibleStates.add(state);
        visibleResults.add(result);
      }
      assert.equal(visibleStates.size, 500, `${blockKey}/${themeKey}/${levelKey}: rendered states unique`);
      assert.equal(visibleResults.size, 500, `${blockKey}/${themeKey}/${levelKey}: rendered results unique`);
    }
  }
}

assert.ok(genericLevels > 0);
console.log(`✅ Direct body copy: 500 concrete states/results + positive feelings across primary and ${genericLevels} generic levels`);
