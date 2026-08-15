import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { getAllLevelTargets } from "../src/navigation.js";
import { levelsKeyboard } from "../src/navigation-keyboards.js";

const futureEntries = Object.entries(FUTURE_BLOCKS);
assert.equal(futureEntries.length, 5, "there must be five non-primary blocks");

const slugs = new Set();
let futureLevels = 0;

for (const [blockKey, block] of futureEntries) {
  assert.equal(block.enabled, true, `${blockKey}: block enabled`);
  const subthemes = Object.entries(block.subthemes || {});
  assert.ok(subthemes.length >= 2 && subthemes.length <= 5, `${blockKey}: 2-5 broad subthemes`);

  for (const [themeKey, theme] of subthemes) {
    const levels = Object.entries(theme.levels || {});
    assert.ok(
      levels.length >= 8 && levels.length <= 18,
      `${blockKey}/${themeKey}: 8-18 levels`
    );
    futureLevels += levels.length;

    for (const [levelKey, level] of levels) {
      assert.ok(level.name, `${blockKey}/${themeKey}/${levelKey}: visible name`);
      assert.ok(level.articleSlug, `${blockKey}/${themeKey}/${levelKey}: article slug`);
      assert.ok(!slugs.has(level.articleSlug), `duplicate article slug: ${level.articleSlug}`);
      slugs.add(level.articleSlug);
    }

    const keyboard = levelsKeyboard(blockKey, themeKey, 0);
    for (const button of keyboard.inline_keyboard.flat()) {
      assert.ok(
        Buffer.byteLength(button.callback_data, "utf8") <= 64,
        `${blockKey}/${themeKey}: Telegram callback limit`
      );
    }
  }
}

assert.equal(futureLevels, 150, "five other blocks contain 150 levels total");
const primaryLevels = Object.values(MAIN_BLOCK.subthemes)
  .reduce((sum, theme) => sum + Object.keys(theme.levels || {}).length, 0);
assert.equal(primaryLevels, 45);
assert.equal(getAllLevelTargets().length, 195, "45 primary + 150 other levels");

console.log("✅ Future blocks: 5 blocks × 3 broad subthemes × 10 levels = 150 levels");
