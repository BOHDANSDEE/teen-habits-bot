import assert from "node:assert/strict";
import { APATHY_AFTER_STATES } from "../src/after-state-apathy.js";
import { LAZY_AFTER_STATES } from "../src/after-state-lazy.js";
import { PROCRASTINATION_AFTER_STATES } from "../src/after-state-procrastination.js";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericResult } from "../src/generic-result.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool, getProblemFact } from "../src/level-context-pools.js";
import { resultKeyboard } from "../src/navigation-keyboards.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY = "state_action";
const themes = ["lazy", "apathy", "procrastination"];
const afterPools = { lazy: LAZY_AFTER_STATES, apathy: APATHY_AFTER_STATES, procrastination: PROCRASTINATION_AFTER_STATES };
const forbidden = ["Що може допомогти далі", "*Хочеш продовжити?*", "Коротке опитування", "📖 *Історія", "*Афірмація*"];
const referral = /фахів|лікар|професійн\w*\s+оцінк|медичн\w*\s+оцінк/iu;
const gainJargon = /сценарій|патерн|механізм|внутрішня система/iu;

function sentenceCount(text = "") {
  return String(text).trim().split(/(?<=[.!?…])\s+/u).filter(Boolean).length;
}

function bodyBetween(text, start, end) {
  const from = text.indexOf(start);
  const to = end ? text.indexOf(end, from + start.length) : text.length;
  assert.ok(from >= 0 && to > from, `missing section ${start}`);
  return text.slice(from + start.length, to).trim();
}

function sections(text) {
  const stateM = "🌿🧠 *Стан*\n";
  const problemM = "🧩⚠️ *Проблема — ";
  const gainM = "🪞🎁 *Вторинна вигода*\n";
  const meaningM = "🌟🧭 *Значення в житті*\n";
  const solutionM = "🔑✨ *Рішення*\n";
  const readM = "🔁 Прочитай це рішення ";
  const afterM = "✨ *Тепер ти відчуваєш*\n";
  const problemStart = text.indexOf(problemM);
  const problemBody = text.indexOf("\n", problemStart) + 1;
  return {
    state: bodyBetween(text, stateM, problemM),
    problem: text.slice(problemBody, text.indexOf(gainM)).trim(),
    gain: bodyBetween(text, gainM, meaningM),
    meaning: bodyBetween(text, meaningM, solutionM),
    solution: bodyBetween(text, solutionM, readM),
    after: bodyBetween(text, afterM, null)
  };
}

function assertBalanced(result, label, expectNext) {
  const value = sections(result.text);
  for (const [name, text] of Object.entries(value)) {
    const count = sentenceCount(text);
    assert.ok(count >= 2 && count <= 3, `${label}.${name} must have 2-3 sentences, got ${count}`);
    assert.ok(text.length <= 620, `${label}.${name} is too long`);
  }
  assert.match(value.gain, /^Тобі на короткий час стає легше, бо можна /u);
  assert.ok(!gainJargon.test(value.gain), `${label}.gain must not use jargon`);
  assert.ok(!referral.test(result.text), `${label} contains referral copy`);
  assert.ok(result.readCount >= 3 && result.readCount <= 9);
  assert.ok(result.text.length < 2800, `${label} must stay compact`);
  for (const item of forbidden) assert.ok(!result.text.includes(item), `${label} leaked ${item}`);
  if (expectNext) assert.ok(result.next, `${label} must keep next target for button navigation`);
}

for (const themeKey of themes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  assert.equal(Object.keys(theme.levels).length, 15);
  assert.equal(theme.pools.states.length, 500);
  assert.equal(new Set(theme.pools.states).size, 500);
  assert.equal(theme.pools.affirmations.length, 500);
  assert.equal(new Set(theme.pools.affirmations).size, 500);
  const afterPool = afterPools[themeKey];
  assert.equal(afterPool.length, 500);
  assert.equal(new Set(afterPool).size, 500);

  for (const [levelKey, level] of Object.entries(theme.levels)) {
    assert.ok(getProblemFact(themeKey, levelKey));
    assert.equal(getLevelSecondaryGainPool(themeKey, levelKey).length, 500);
    assert.equal(getLevelLifeMeaningPool(themeKey, levelKey).length, 500);
    const result = buildResult(themeKey, levelKey);
    assert.ok(result.text.includes(`🧩⚠️ *Проблема — ${String(level.name).replace(/^\d+\s*·\s*/u, "").trim()}*`));
    assert.equal(result.afterStates.length, 2);
    assert.notEqual(result.afterStates[0], result.afterStates[1]);
    assertBalanced(result, `${themeKey}.${levelKey}`, true);
    const keyboard = resultKeyboard(PRIMARY, themeKey, levelKey, 0, result.next);
    const nextButton = keyboard.inline_keyboard.flat().find((button) => button.callback_data.startsWith("solution:"));
    assert.equal(nextButton?.text, "➡️ Продовжити");
    assert.ok(Buffer.byteLength(nextButton.callback_data, "utf8") <= 64);
  }
  assertBalanced(buildContinuation(themeKey), `${themeKey}.continuation`, true);
}

let starterCount = 0;
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  for (const [themeKey, theme] of Object.entries(block.subthemes)) {
    const [[levelKey]] = Object.entries(theme.levels);
    assertBalanced(buildGenericResult(blockKey, themeKey, levelKey), `${blockKey}.${themeKey}`, false);
    starterCount += 1;
  }
}
assert.equal(starterCount, 15);
console.log("✅ Balanced flow: 2-3 concise sentences + plain secondary gain wording");
