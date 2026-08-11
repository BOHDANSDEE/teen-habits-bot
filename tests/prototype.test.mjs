import assert from "node:assert/strict";
import {
  CONTINUATION_BRIDGES,
  FEELING_INTROS,
  MAIN_BLOCK,
  getLevel,
  getRandomLevelKey
} from "../src/content.js";
import {
  LEVELS_PER_PAGE,
  levelsKeyboard,
  mainMenuKeyboard,
  resultKeyboard,
  subthemesKeyboard
} from "../src/navigation-keyboards.js";
import { RESERVED_BLOCK_SLOTS, getActiveBlocks } from "../src/navigation.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY_BLOCK_KEY = "state_action";
const expectedThemes = ["lazy", "apathy", "procrastination"];
const poolNames = ["states", "problems", "secondaryGains", "meanings", "affirmations"];

function flattenButtons(keyboard) {
  return keyboard.inline_keyboard.flat();
}

function assertCallbackSizes(keyboard) {
  for (const button of flattenButtons(keyboard)) {
    assert.ok(
      Buffer.byteLength(button.callback_data, "utf8") <= 64,
      `callback_data too long: ${button.callback_data}`
    );
  }
}

assert.deepEqual(Object.keys(MAIN_BLOCK.subthemes), expectedThemes);
assert.equal(LEVELS_PER_PAGE, 8, "level pagination must show 8 items per page");
assert.equal(RESERVED_BLOCK_SLOTS.length, 8, "architecture must keep reserved future block slots");
assert.ok(RESERVED_BLOCK_SLOTS.every((slot) => slot.enabled === false));
assert.equal(getActiveBlocks().length, 1, "reserved future blocks must stay hidden until configured");

const homeKeyboard = mainMenuKeyboard();
assert.equal(homeKeyboard.inline_keyboard.length, 2, "home shows one active block plus about button");
assert.ok(!flattenButtons(homeKeyboard).some((button) => /future_/i.test(button.callback_data)));
assertCallbackSizes(homeKeyboard);

const blockKeyboard = subthemesKeyboard(PRIMARY_BLOCK_KEY);
assert.equal(blockKeyboard.inline_keyboard.length, 4, "block shows 3 subthemes plus main menu");
assertCallbackSizes(blockKeyboard);

const allArticleSlugs = new Set();
let totalPoolItems = 0;

for (const themeKey of expectedThemes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const levelKeys = Object.keys(theme.levels);
  assert.equal(levelKeys.length, 15, `${themeKey} must have exactly 15 article-based levels`);

  const firstPage = levelsKeyboard(PRIMARY_BLOCK_KEY, themeKey, 0);
  const secondPage = levelsKeyboard(PRIMARY_BLOCK_KEY, themeKey, 1);
  const firstPageLevelButtons = flattenButtons(firstPage).filter((button) => button.callback_data.startsWith("level:"));
  const secondPageLevelButtons = flattenButtons(secondPage).filter((button) => button.callback_data.startsWith("level:"));

  assert.equal(firstPageLevelButtons.length, 8, `${themeKey} first page must show 8 levels`);
  assert.equal(secondPageLevelButtons.length, 7, `${themeKey} second page must show remaining 7 levels`);
  assert.ok(flattenButtons(firstPage).some((button) => button.text === "➡️"));
  assert.ok(flattenButtons(secondPage).some((button) => button.text === "⬅️"));
  assert.ok(flattenButtons(firstPage).some((button) => button.text === "📄 1/2"));
  assert.ok(flattenButtons(secondPage).some((button) => button.text === "📄 2/2"));
  assert.ok(flattenButtons(firstPage).some((button) => button.callback_data === `block:${PRIMARY_BLOCK_KEY}`));
  assert.ok(flattenButtons(firstPage).some((button) => button.callback_data === "home"));

  for (const button of [...firstPageLevelButtons, ...secondPageLevelButtons]) {
    assert.match(button.text, /[\p{Extended_Pictographic}]/u, `${themeKey} level button must contain emoji`);
  }
  assertCallbackSizes(firstPage);
  assertCallbackSizes(secondPage);

  const sampleResultKeyboard = resultKeyboard(PRIMARY_BLOCK_KEY, themeKey, levelKeys[0], 0);
  const sampleCallbacks = flattenButtons(sampleResultKeyboard).map((button) => button.callback_data);
  assert.ok(sampleCallbacks.includes(`levels:${PRIMARY_BLOCK_KEY}:${themeKey}:0`));
  assert.ok(sampleCallbacks.includes(`block:${PRIMARY_BLOCK_KEY}`));
  assert.ok(sampleCallbacks.includes("home"));
  assertCallbackSizes(sampleResultKeyboard);

  for (const poolName of poolNames) {
    const pool = theme.pools[poolName];
    assert.equal(pool.length, 500, `${themeKey}.${poolName} must contain exactly 500 items`);
    assert.equal(new Set(pool).size, 500, `${themeKey}.${poolName} must contain 500 unique items`);
    for (const item of pool) {
      assert.ok(!/можлив|ймовірн|схоже на/i.test(item), `${themeKey}.${poolName} contains hedging: ${item}`);
    }
    totalPoolItems += pool.length;
  }

  for (const levelKey of levelKeys) {
    const level = getLevel(themeKey, levelKey);
    assert.ok(level.articleTitle, `${themeKey}.${levelKey} must have articleTitle`);
    assert.ok(level.articleSlug, `${themeKey}.${levelKey} must have articleSlug`);
    assert.ok(level.summary, `${themeKey}.${levelKey} must have summary`);
    assert.ok(level.actions?.length >= 3, `${themeKey}.${levelKey} must have practical actions`);
    assert.ok(!allArticleSlugs.has(level.articleSlug), `duplicate articleSlug: ${level.articleSlug}`);
    allArticleSlugs.add(level.articleSlug);

    const result = buildResult(themeKey, levelKey);
    assert.ok(result, `${themeKey}.${levelKey} must build a result`);
    assert.equal(result.articleSlug, level.articleSlug);
    assert.ok(result.text.includes(level.articleTitle));

    for (const marker of [
      "🌿🧠 *Стан*",
      "🧩⚠️ *Проблема*",
      "🪞🎁 *Вторинна вигода*",
      "🌟🧭 *Значення в житті*",
      "🚀✅ *Що зробити зараз*",
      "🔑✨ *Афірмація*"
    ]) {
      assert.ok(result.text.includes(marker), `${themeKey}.${levelKey} is missing ${marker}`);
    }

    assert.ok(result.text.includes("1️⃣"));
    assert.ok(result.text.includes("2️⃣"));
    assert.ok(result.text.includes("3️⃣"));
    assert.ok(result.text.length >= 1800, `${themeKey}.${levelKey} result must be richer than old short format`);
    assert.ok(result.text.length < 4000, `${themeKey}.${levelKey} result must stay below Telegram message limit`);
    assert.ok(!result.text.includes("Можлива вторинна вигода"));
    assert.ok(!/ймовірн/i.test(result.text));
  }

  for (let i = 0; i < 100; i += 1) {
    const randomLevelKey = getRandomLevelKey(themeKey);
    assert.ok(theme.levels[randomLevelKey], `${themeKey} random level must exist`);

    const continuation = buildContinuation(themeKey);
    assert.ok(continuation, `${themeKey} must build a continuation`);
    assert.notEqual(continuation.themeKey, themeKey, `${themeKey} continuation must switch to a related theme`);
    assert.ok(
      MAIN_BLOCK.subthemes[continuation.themeKey].levels[continuation.levelKey],
      "continuation must choose an existing random level"
    );
  }
}

for (const text of [...FEELING_INTROS, ...CONTINUATION_BRIDGES]) {
  assert.ok(!/можлив|ймовірн|схоже на/i.test(text), `direct-tone text contains hedging: ${text}`);
}

assert.equal(allArticleSlugs.size, 45, "bot must map exactly 45 unique article topics");
assert.equal(totalPoolItems, 7500, "bot must expose exactly 7,500 pool items");

console.log("✅ HabitTeen navigation test passed: 8-per-page levels, single-message hierarchy, 45 levels, 7,500 pool items");
