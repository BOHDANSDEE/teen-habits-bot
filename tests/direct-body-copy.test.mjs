import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildResult } from "../src/renderer.js";
import { buildGenericResult } from "../src/generic-result.js";
import { getIndependentLifeVariant } from "../src/independent-life-pools.js";

const FORBIDDEN_OLD = /🌿🧠 \*Стан\*|💭 \*Ти так це відчуваєш\?\*|✨ \*Тепер ти відчуваєш\*|🔑 \*Рішення\*|Тіло:\s*Інтуїтивне/iu;
const PHYSICAL_RELIEF = /полегш|напруг|напруж|легш|легк|вільніш|розслаб|дихати|тиск|м['’]як|спок|стиск|тремт|затиск/iu;
const ALT_ACTION = /(інший спосіб дії|як діяти інакше)/iu;
const NEXT_STEP = /Наступний крок ясніший:/iu;
const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

const primaryEntries = Object.entries(MAIN_BLOCK.subthemes).flatMap(([themeKey, theme]) =>
  Object.keys(theme.levels).map((levelKey) => [themeKey, levelKey])
);
assert.ok(primaryEntries.length >= 2);

const requestedIndex = 123;
const expected = getIndependentLifeVariant(requestedIndex);
const firstPrimary = buildResult(primaryEntries[0][0], primaryEntries[0][1], requestedIndex);
const secondPrimary = buildResult(primaryEntries[1][0], primaryEntries[1][1], requestedIndex);

for (const rendered of [firstPrimary, secondPrimary]) {
  assert.ok(rendered);
  assert.doesNotMatch(rendered.text, FORBIDDEN_OLD);
  assert.ok(rendered.text.includes(expected.problem));
  assert.ok(rendered.text.includes(expected.gain));
  assert.ok(rendered.text.includes(expected.meaning));
  assert.ok(rendered.text.includes(expected.affirmation));
  assert.ok(rendered.text.includes(expected.result));
  assert.equal(sentenceCount(expected.result), 3);
  assert.match(expected.result.split(/(?<=[.!?…])\s+/u)[0] || "", PHYSICAL_RELIEF);
  assert.match(expected.result, ALT_ACTION);
  assert.match(expected.result, NEXT_STEP);
  assert.ok(rendered.text.length < 4096);
}

assert.notEqual(
  firstPrimary.text.match(/🔎 \*Проблема: ([^*]+)\*/u)?.[1],
  secondPrimary.text.match(/🔎 \*Проблема: ([^*]+)\*/u)?.[1],
  "selected level title may differ while the five content blocks stay level-independent"
);

let genericChecked = 0;
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  if (block.enabled === false) continue;
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const levelKey of Object.keys(theme.levels || {})) {
      const rendered = buildGenericResult(blockKey, themeKey, levelKey, requestedIndex);
      assert.ok(rendered);
      assert.doesNotMatch(rendered.text, FORBIDDEN_OLD);
      assert.ok(rendered.text.includes(expected.problem));
      assert.ok(rendered.text.includes(expected.gain));
      assert.ok(rendered.text.includes(expected.meaning));
      assert.ok(rendered.text.includes(expected.affirmation));
      assert.ok(rendered.text.includes(expected.result));
      genericChecked += 1;
    }
  }
}
assert.ok(genericChecked > 0);

console.log("✅ Selected level only names the card; five content blocks are shared, independent and coherent");
