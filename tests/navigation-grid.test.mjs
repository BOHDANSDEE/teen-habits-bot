import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { LEVEL_COLUMNS, LEVELS_PER_PAGE, levelsKeyboard } from "../src/navigation-keyboards.js";

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

console.log("✅ HabitTeen level grid test passed: 2 columns × 4 rows with 2 pages");
