import assert from "node:assert/strict";
import { MAIN_BLOCK, getLevel } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericResult } from "../src/generic-result.js";
import { resultKeyboard, starterResultKeyboard } from "../src/navigation-keyboards.js";
import { findLevelByArticleSlug, getAllLevelTargets } from "../src/navigation.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY = "state_action";
const themes = ["lazy", "apathy", "procrastination"];
const pools = ["states", "problems", "secondaryGains", "meanings", "affirmations"];
const forbidden = ["📖 *Історія", "Коротке опитування", "Що може допомогти далі", "Що спробувати зараз", "*Афірмація*"];

const cleanName = (name = "") => String(name).replace(/^\d+\s*·\s*/u, "").trim();
const sentenceCount = (text = "") => String(text).trim().split(/(?<=[.!?…])\s+/u).filter(Boolean).length;
const buttons = (keyboard) => keyboard.inline_keyboard.flat();

function sections(text) {
  const state = "🌿🧠 *Стан*\n";
  const problem = "🧩⚠️ *Проблема — ";
  const gain = "🪞🎁 *Вторинна вигода*\n";
  const meaning = "🌟🧭 *Значення в житті*\n";
  const solution = "🔑✨ *Рішення*\n";
  const read = "🔁 Прочитай це ";
  const i1 = text.indexOf(state);
  const i2 = text.indexOf(problem);
  const i3 = text.indexOf(gain);
  const i4 = text.indexOf(meaning);
  const i5 = text.indexOf(solution);
  const i6 = text.indexOf(read);
  assert.equal(i1, 0);
  assert.ok(i2 > i1 && i3 > i2 && i4 > i3 && i5 > i4 && i6 > i5);
  const problemBody = text.indexOf("\n", i2) + 1;
  const meaningBody = i4 + meaning.length;
  const note = text.indexOf("🛟 *Важлива межа*", meaningBody);
  return {
    state: text.slice(i1 + state.length, i2).trim(),
    problem: text.slice(problemBody, i3).trim(),
    gain: text.slice(i3 + gain.length, i4).trim(),
    meaning: text.slice(meaningBody, note > -1 && note < i5 ? note : i5).trim(),
    solution: text.slice(i5 + solution.length, i6).trim()
  };
}

function assertResult(result, label) {
  const value = sections(result.text);
  for (const [key, text] of Object.entries(value)) {
    assert.equal(sentenceCount(text), 3, `${label}.${key} must have 3 sentences`);
  }
  assert.match(value.state, /^Ти можеш відчувати,/u);
  assert.ok(result.readCount >= 3 && result.readCount <= 9);
  assert.match(result.text, new RegExp(`Прочитай це ${result.readCount} разів`, "u"));
  for (const item of forbidden) assert.ok(!result.text.includes(item), `${label}: ${item}`);
  assert.ok(result.text.length < 4000);
}

assert.deepEqual(Object.keys(MAIN_BLOCK.subthemes), themes);
assert.equal(getAllLevelTargets().length, 60);

let totalPoolItems = 0;
const articleSlugs = new Set();
for (const themeKey of themes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  assert.equal(Object.keys(theme.levels).length, 15);
  for (const poolName of pools) {
    assert.equal(theme.pools[poolName].length, 500);
    assert.equal(new Set(theme.pools[poolName]).size, 500);
    totalPoolItems += 500;
  }
  for (const [levelKey, level] of Object.entries(theme.levels)) {
    articleSlugs.add(level.articleSlug);
    const target = findLevelByArticleSlug(level.articleSlug);
    assert.equal(target?.blockKey, PRIMARY);
    assert.equal(target?.themeKey, themeKey);
    assert.equal(target?.levelKey, levelKey);
    for (let i = 0; i < 5; i += 1) {
      const result = buildResult(themeKey, levelKey);
      assert.ok(result.text.includes(`🧩⚠️ *Проблема — ${cleanName(level.name)}*`));
      assert.ok(result.next);
      assertResult(result, `${themeKey}.${levelKey}`);
      const keyboard = resultKeyboard(PRIMARY, themeKey, levelKey, 0, result.next);
      const nextButton = buttons(keyboard).find((button) => button.callback_data.startsWith("solution:"));
      assert.equal(nextButton?.text, "💡 Хочу рішення про це");
      assert.ok(Buffer.byteLength(nextButton.callback_data, "utf8") <= 64);
    }
    const continuation = buildContinuation(themeKey);
    assertResult(continuation, `${themeKey}.continuation`);
  }
}

let starters = 0;
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  for (const [themeKey, theme] of Object.entries(block.subthemes)) {
    const [[levelKey, level]] = Object.entries(theme.levels);
    starters += 1;
    const result = buildGenericResult(blockKey, themeKey, levelKey);
    assert.ok(result.text.includes(`🧩⚠️ *Проблема — ${cleanName(level.name)}*`));
    assertResult(result, `${blockKey}.${themeKey}`);
    const keyboard = starterResultKeyboard(blockKey, themeKey, 0);
    for (const button of buttons(keyboard)) assert.ok(Buffer.byteLength(button.callback_data, "utf8") <= 64);
  }
}

assert.equal(articleSlugs.size, 45);
assert.equal(starters, 15);
assert.equal(totalPoolItems, 7500);
console.log("✅ Structured flow: 5 blocks × 3 sentences, random 3–9 reads, no stories/quizzes");
