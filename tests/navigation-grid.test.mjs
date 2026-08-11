import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import {
  LEVEL_COLUMNS,
  LEVELS_PER_PAGE,
  levelsKeyboard,
  mainMenuKeyboard
} from "../src/navigation-keyboards.js";
import { getActiveBlocks, getRandomRecommendation } from "../src/navigation.js";

const BLOCK_KEY = "state_action";
const themes = Object.keys(MAIN_BLOCK.subthemes);

assert.equal(LEVELS_PER_PAGE, 8);
assert.equal(LEVEL_COLUMNS, 2);

function levelRows(keyboard) {
  return keyboard.inline_keyboard.filter((row) =>
    row.some((button) => button.callback_data.startsWith("level:"))
  );
}

for (const themeKey of themes) {
  const page1 = levelsKeyboard(BLOCK_KEY, themeKey, 0);
  const page2 = levelsKeyboard(BLOCK_KEY, themeKey, 1);
  const rows1 = levelRows(page1);
  const rows2 = levelRows(page2);

  assert.deepEqual(rows1.map((row) => row.length), [2, 2, 2, 2], `${themeKey}: page 1 must be 2×4`);
  assert.deepEqual(rows2.map((row) => row.length), [2, 2, 2, 1], `${themeKey}: page 2 must contain remaining 7 levels`);

  assert.ok(page1.inline_keyboard.flat().some((button) => button.text === "➡️"));
  assert.ok(page2.inline_keyboard.flat().some((button) => button.text === "⬅️"));
  assert.ok(page1.inline_keyboard.flat().some((button) => button.text === "📄 1/2"));
  assert.ok(page2.inline_keyboard.flat().some((button) => button.text === "📄 2/2"));
}

const originalRandom = Math.random;
try {
  let sequence = [0, 0, 0];
  Math.random = () => sequence.shift() ?? 0;
  const firstHint = getRandomRecommendation();
  const firstBlock = getActiveBlocks()[0];
  const [firstThemeKey, firstTheme] = Object.entries(firstBlock.subthemes)[0];
  const [firstLevelKey] = Object.entries(firstTheme.levels)[0];

  assert.equal(firstHint.blockKey, firstBlock.key, "hint must first choose a block");
  assert.equal(firstHint.themeKey, firstThemeKey, "hint must then choose a subtheme inside the selected block");
  assert.equal(firstHint.levelKey, firstLevelKey, "hint must finally choose a level inside the selected subtheme");
  assert.match(firstHint.block.name, /💡 Підказка/);
  assert.match(firstHint.block.name, /🧩 Блок:/);
  assert.match(firstHint.theme.name, /📂 Підблок:/);

  sequence = [0.999999, 0.999999, 0.999999];
  Math.random = () => sequence.shift() ?? 0.999999;
  const lastHint = getRandomRecommendation();
  const lastBlock = getActiveBlocks().at(-1);
  const [lastThemeKey, lastTheme] = Object.entries(lastBlock.subthemes).at(-1);
  const [lastLevelKey] = Object.entries(lastTheme.levels).at(-1);

  assert.equal(lastHint.blockKey, lastBlock.key, "block selection must not be weighted by number of levels");
  assert.equal(lastHint.themeKey, lastThemeKey);
  assert.equal(lastHint.levelKey, lastLevelKey);
} finally {
  Math.random = originalRandom;
}

const menu = mainMenuKeyboard(getRandomRecommendation());
const menuButtons = menu.inline_keyboard.flat();
assert.ok(menuButtons.some((button) => button.text === "🎲 Підказка"));
assert.ok(menuButtons.some((button) => button.text === "🏠 Головне меню") === false);
assert.ok(menuButtons.every((button) => !button.text.includes("✨")), "main menu buttons should not be wrapped in star emojis");

console.log("✅ HabitTeen navigation test passed: 2×4 levels + hierarchical hint + cleaner buttons");
