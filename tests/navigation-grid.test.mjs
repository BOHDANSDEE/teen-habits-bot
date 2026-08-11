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
  const firstPage = levelsKeyboard(BLOCK_KEY, themeKey, 0);
  const secondPage = levelsKeyboard(BLOCK_KEY, themeKey, 1);
  const firstRows = levelRows(firstPage);
  const secondRows = levelRows(secondPage);

  assert.equal(firstRows.length, 4, `${themeKey}: page 1 must have 4 level rows`);
  assert.ok(firstRows.every((row) => row.length === 2), `${themeKey}: page 1 must be a 2x4 grid`);

  assert.equal(secondRows.length, 4, `${themeKey}: page 2 must use 4 rows for the remaining 7 levels`);
  assert.deepEqual(secondRows.map((row) => row.length), [2, 2, 2, 1]);

  assert.ok(firstPage.inline_keyboard.flat().some((button) => button.text === "➡️"));
  assert.ok(secondPage.inline_keyboard.flat().some((button) => button.text === "⬅️"));
}

console.log("✅ HabitTeen level grid test passed: page 1 = 2×4, page 2 = 2+2+2+1");
