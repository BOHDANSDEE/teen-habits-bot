import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import {
  LEVEL_COLUMNS,
  LEVELS_PER_PAGE,
  levelsKeyboard,
  mainMenuKeyboard,
  subthemesKeyboard
} from "../src/navigation-keyboards.js";
import {
  getActiveBlocks,
  getRandomBlockHint,
  getRandomLevelHint,
  getRandomThemeHint
} from "../src/navigation.js";

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
  assert.ok(
    page1.inline_keyboard.flat().some((button) => button.callback_data === `hint:level:${BLOCK_KEY}:${themeKey}`),
    `${themeKey}: levels page must offer a staged level hint`
  );
}

const originalRandom = Math.random;
try {
  Math.random = () => 0;
  const firstBlockHint = getRandomBlockHint();
  const firstBlock = getActiveBlocks()[0];
  assert.equal(firstBlockHint.blockKey, firstBlock.key, "first hint stage must choose only a block");
  assert.equal(firstBlockHint.themeKey, undefined, "block hint must not preselect a subtheme");
  assert.equal(firstBlockHint.levelKey, undefined, "block hint must not preselect a level");

  const firstThemeHint = getRandomThemeHint(firstBlockHint.blockKey);
  const [firstThemeKey, firstTheme] = Object.entries(firstBlock.subthemes)[0];
  assert.equal(firstThemeHint.themeKey, firstThemeKey, "second hint stage must choose a subtheme");
  assert.equal(firstThemeHint.levelKey, undefined, "subtheme hint must not preselect a level");

  const firstLevelHint = getRandomLevelHint(firstBlockHint.blockKey, firstThemeHint.themeKey);
  const [firstLevelKey] = Object.entries(firstTheme.levels)[0];
  assert.equal(firstLevelHint.levelKey, firstLevelKey, "third hint stage must choose a level");

  Math.random = () => 0.999999;
  const lastBlockHint = getRandomBlockHint();
  const lastBlock = getActiveBlocks().at(-1);
  assert.equal(
    lastBlockHint.blockKey,
    lastBlock.key,
    "block hint must stay independent from how many levels each block contains"
  );
} finally {
  Math.random = originalRandom;
}

const neutralMenu = mainMenuKeyboard();
const neutralButtons = neutralMenu.inline_keyboard.flat();
assert.ok(neutralButtons.some((button) => button.callback_data === "hint:block"));
assert.ok(neutralButtons.some((button) => button.text === "🎲 Підказка"));
assert.ok(neutralButtons.every((button) => !button.callback_data.startsWith("recommend:")));
assert.ok(
  neutralButtons.every((button) => !button.text.includes("✨")),
  "main menu buttons should not be wrapped in star emojis"
);

const blockHint = getRandomBlockHint();
const hintedMenu = mainMenuKeyboard(blockHint);
assert.ok(
  hintedMenu.inline_keyboard.flat().some((button) => button.callback_data === `block:${blockHint.blockKey}`),
  "block hint must let the person accept the suggested block"
);
assert.ok(
  hintedMenu.inline_keyboard.flat().some((button) => button.callback_data === "hint:block"),
  "block hint must let the person ask for another block"
);

const themeHint = getRandomThemeHint(blockHint.blockKey);
const hintedSubthemes = subthemesKeyboard(blockHint.blockKey, themeHint);
assert.ok(
  hintedSubthemes.inline_keyboard
    .flat()
    .some((button) => button.callback_data === `theme:${blockHint.blockKey}:${themeHint.themeKey}:0`),
  "subtheme hint must let the person accept the suggested subtheme"
);
assert.ok(
  hintedSubthemes.inline_keyboard
    .flat()
    .some((button) => button.callback_data === `hint:theme:${blockHint.blockKey}`),
  "subtheme hint must let the person ask for another subtheme"
);

const levelHint = getRandomLevelHint(blockHint.blockKey, themeHint.themeKey);
const hintedLevels = levelsKeyboard(blockHint.blockKey, themeHint.themeKey, 0, levelHint);
assert.ok(
  hintedLevels.inline_keyboard
    .flat()
    .some((button) => button.callback_data.startsWith(`level:${blockHint.blockKey}:${themeHint.themeKey}:${levelHint.levelKey}:`)),
  "level hint must let the person accept the suggested level"
);
assert.ok(
  hintedLevels.inline_keyboard
    .flat()
    .some((button) => button.callback_data === `hint:level:${blockHint.blockKey}:${themeHint.themeKey}`),
  "level hint must let the person ask for another level"
);

console.log("✅ HabitTeen navigation test passed: 2×4 levels + staged conversational hints");
