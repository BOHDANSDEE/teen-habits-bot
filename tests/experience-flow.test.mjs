import assert from "node:assert/strict";
import { MAIN_BLOCK, getLevel, getRandomLevelKey } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericResult } from "../src/generic-result.js";
import { resultKeyboard, starterResultKeyboard } from "../src/navigation-keyboards.js";
import { findLevelByArticleSlug, getAllLevelTargets } from "../src/navigation.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY_BLOCK_KEY = "state_action";
const themes = ["lazy", "apathy", "procrastination"];
const poolNames = ["states", "problems", "secondaryGains", "meanings", "affirmations"];
const forbiddenVisibleFormats = [
  "📖 *Історія",
  "🧩 *Коротке опитування про тебе*",
  "🧭💡 *Що може допомогти далі*",
  "🚀✅ *Що спробувати зараз*",
  "*Афірмація*"
];

function buttons(keyboard) {
  return keyboard.inline_keyboard.flat();
}

function assertCallbackSizes(keyboard) {
  for (const button of buttons(keyboard)) {
    assert.ok(Buffer.byteLength(button.callback_data, "utf8") <= 64);
  }
}

function sentenceCount(text = "") {
  return String(text || "")
    .trim()
    .split(/(?<=[.!?…])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function extractMainSections(text) {
  const stateStart = "🌿🧠 *Стан*\n";
  const problemHeader = "🧩⚠️ *Проблема — ";
  const secondaryStart = "🪞🎁 *Вторинна вигода*\n";
  const meaningStart = "🌟🧭 *Значення в житті*\n";
  const solutionStart = "🔑✨ *Рішення*\n";
  const readStart = "🔁 Прочитай це ";

  const stateIndex = text.indexOf(stateStart);
  const problemIndex = text.indexOf(problemHeader);
  const secondaryIndex = text.indexOf(secondaryStart);
  const meaningIndex = text.indexOf(meaningStart);
  const solutionIndex = text.indexOf(solutionStart);
  const readIndex = text.indexOf(readStart);

  assert.ok(stateIndex === 0, "result must begin with Стан");
  assert.ok(problemIndex > stateIndex, "problem must follow state");
  assert.ok(secondaryIndex > problemIndex, "secondary gain must follow problem");
  assert.ok(meaningIndex > secondaryIndex, "meaning must follow secondary gain");
  assert.ok(solutionIndex > meaningIndex, "solution must follow meaning");
  assert.ok(readIndex > solutionIndex, "read count must follow solution");

  const problemBodyStart = text.indexOf("\n", problemIndex) + 1;
  const meaningBodyStart = meaningIndex + meaningStart.length;
  let meaningEnd = solutionIndex;
  const safetyIndex = text.indexOf("🛟 *Важлива межа*", meaningBodyStart);
  if (safetyIndex > -1 && safetyIndex < solutionIndex) meaningEnd = safetyIndex;

  return {
    state: text.slice(stateIndex + stateStart.length, problemIndex).trim(),
    problem: text.slice(problemBodyStart, secondaryIndex).trim(),
    secondaryGain: text.slice(secondaryIndex + secondaryStart.length, meaningIndex).trim(),
    meaning: text.slice(meaningBodyStart, meaningEnd).trim(),
    solution: text.slice(solutionIndex + solutionStart.length, readIndex).trim()
  };
}

function assertThreeSentenceStructure(result, label) {
  const sections = extractMainSections(result.text);
  assert.equal(sentenceCount(sections.state), 3, `${label} state must have 3 sentences`);
  assert.equal(sentenceCount(sections.problem), 3, `${label} problem must have 3 sentences`);
  assert.equal(sentenceCount(sections.secondaryGain), 3, `${label} secondary gain must have 3 sentences`);
  assert.equal(sentenceCount(sections.meaning), 3, `${label} meaning must have 3 sentences`);
  assert.equal(sentenceCount(sections.solution), 3, `${label} solution must have 3 sentences`);
  assert.match(sections.state, /^Ти можеш відчувати,/u, `${label} state must speak to the person directly`);
}

assert.deepEqual(Object.keys(MAIN_BLOCK.subthemes), themes);
assert.equal(getAllLevelTargets().length, 60, "45 mature + 15 starter situations must remain discoverable");

let poolTotal = 0;
const articleSlugs = new Set();
const seenReadCounts = new Set();

for (const themeKey of themes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const levelKeys = Object.keys(theme.levels);
  assert.equal(levelKeys.length, 15, `${themeKey} must keep 15 article situations`);

  for (const poolName of poolNames) {
    const pool = theme.pools[poolName];
    assert.equal(pool.length, 500, `${themeKey}.${poolName} keeps 500 semantic variants`);
    assert.equal(new Set(pool).size, 500, `${themeKey}.${poolName} variants stay unique`);
    poolTotal += pool.length;
  }

  for (const levelKey of levelKeys) {
    const level = getLevel(themeKey, levelKey);
    assert.ok(level?.articleSlug);
    assert.ok(level?.articleTitle);
    assert.ok(level?.summary);
    assert.ok(!articleSlugs.has(level.articleSlug), `duplicate article slug: ${level.articleSlug}`);
    articleSlugs.add(level.articleSlug);

    const deepLinkTarget = findLevelByArticleSlug(level.articleSlug);
    assert.equal(deepLinkTarget?.blockKey, PRIMARY_BLOCK_KEY);
    assert.equal(deepLinkTarget?.themeKey, themeKey);
    assert.equal(deepLinkTarget?.levelKey, levelKey);

    for (let sample = 0; sample < 12; sample += 1) {
      const result = buildResult(themeKey, levelKey);
      assert.ok(result, `${themeKey}.${levelKey} must render`);
      assert.equal(result.articleSlug, level.articleSlug);
      assert.ok(result.next, "next target remains available for the button");
      assert.notEqual(result.next.themeKey, themeKey, "next target must switch theme");
      assert.ok(result.readCount >= 3 && result.readCount <= 9, "readCount must stay in 3..9");
      seenReadCounts.add(result.readCount);
      assert.match(result.text, new RegExp(`🔁 Прочитай це ${result.readCount} разів`, "u"));
      assert.ok(result.text.includes(`🧩⚠️ *Проблема — ${level.name.replace(/^\\d+\\s*·\\s*/u, "")}*`));

      for (const marker of [
        "🌿🧠 *Стан*",
        "🧩⚠️ *Проблема —",
        "🪞🎁 *Вторинна вигода*",
        "🌟🧭 *Значення в житті*",
        "🔑✨ *Рішення*"
      ]) {
        assert.ok(result.text.includes(marker), `${themeKey}.${levelKey} is missing ${marker}`);
      }

      for (const forbidden of forbiddenVisibleFormats) {
        assert.ok(!result.text.includes(forbidden), `${themeKey}.${levelKey} still shows ${forbidden}`);
      }

      assertThreeSentenceStructure(result, `${themeKey}.${levelKey}`);
      assert.ok(result.text.length < 4000, `${themeKey}.${levelKey} exceeds Telegram limit`);

      const keyboard = resultKeyboard(PRIMARY_BLOCK_KEY, themeKey, levelKey, 0, result.next);
      const solutionButton = buttons(keyboard).find((button) => button.callback_data.startsWith("solution:"));
      assert.equal(solutionButton?.text, "💡 Хочу рішення про це");
      assert.equal(solutionButton?.callback_data, `solution:${result.next.themeKey}:${result.next.levelKey}`);
      assertCallbackSizes(keyboard);
    }
  }

  for (let index = 0; index < 60; index += 1) {
    const randomLevelKey = getRandomLevelKey(themeKey);
    assert.ok(theme.levels[randomLevelKey]);
    const continuation = buildContinuation(themeKey);
    assert.ok(continuation);
    assert.notEqual(continuation.themeKey, themeKey);
    assert.ok(continuation.text.includes("🔑✨ *Рішення*"));
    assert.ok(!continuation.text.includes("🧭💡 *Що може допомогти далі*"));
  }
}

let starterCount = 0;
const starterSlugs = new Set();
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  assert.equal(block.enabled, true);
  for (const [themeKey, theme] of Object.entries(block.subthemes)) {
    const [[levelKey, level]] = Object.entries(theme.levels);
    starterCount += 1;
    assert.ok(level.articleSlug);
    assert.ok(!starterSlugs.has(level.articleSlug));
    starterSlugs.add(level.articleSlug);

    const result = buildGenericResult(blockKey, themeKey, levelKey);
    assert.ok(result);
    assertThreeSentenceStructure(result, `${blockKey}.${themeKey}`);
    assert.ok(result.readCount >= 3 && result.readCount <= 9);
    assert.match(result.text, new RegExp(`🔁 Прочитай це ${result.readCount} разів`, "u"));
    for (const forbidden of forbiddenVisibleFormats) {
      assert.ok(!result.text.includes(forbidden));
    }
    assert.ok(result.text.length < 4000);

    const keyboard = starterResultKeyboard(blockKey, themeKey, 0);
    assertCallbackSizes(keyboard);
    assert.ok(!buttons(keyboard).some((button) => button.callback_data.startsWith("solution:")));
  }
}

assert.equal(articleSlugs.size, 45);
assert.equal(starterCount, 15);
assert.equal(starterSlugs.size, 15);
assert.equal(poolTotal, 7500, "500 × 5 × 3 semantic variants remain intact");
assert.ok(seenReadCounts.size >= 5, "random repetition prompt should visibly vary across samples");

console.log("✅ Structured flow passed: 5 blocks × 3 sentences, random 3–9 reads, no stories/quizzes");
