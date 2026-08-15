import assert from "node:assert/strict";
import { HINTS } from "../src/hint-pool.js";
import {
  getBlockSubtheme,
  getRandomRecommendation
} from "../src/navigation.js";
import {
  getLevelPage,
  levelsKeyboard,
  mainMenuKeyboard,
  resultKeyboard,
  subthemesKeyboard
} from "../src/navigation-keyboards.js";

assert.equal(HINTS.length, 500);
assert.equal(new Set(HINTS).size, 500);
for (const hint of HINTS) {
  assert.match(hint, /блок/iu);
  assert.match(hint, /підблок/iu);
  assert.match(hint, /рів(ень|ня)/iu);
}

const recommendation = getRandomRecommendation();
assert.ok(recommendation?.blockKey);
assert.equal(recommendation.themeKey, null);
assert.equal(recommendation.levelKey, null);
assert.ok(HINTS.includes(recommendation.theme.name));

const menu = mainMenuKeyboard(recommendation);
const blockHintButton = menu.inline_keyboard
  .flat()
  .find((item) => item.text.startsWith("🎲 Підказка ("));
assert.ok(blockHintButton, "main hint must show its destination in the button");
assert.equal(blockHintButton.callback_data, `block:${recommendation.blockKey}`);
assert.ok(blockHintButton.text.length <= 64, "main hint label must fit Telegram button text");
assert.ok(
  !String(blockHintButton.callback_data).startsWith("recommend:"),
  "main hint must open only the suggested block"
);

const subthemesMenu = subthemesKeyboard(recommendation.blockKey);
const themeHintButton = subthemesMenu.inline_keyboard
  .flat()
  .find((item) => item.text.startsWith("🎲 Підказка ("));
assert.ok(themeHintButton, "block hint must show the suggested subtheme in the button");
assert.ok(themeHintButton.text.length <= 64, "theme hint label must fit Telegram button text");
const themeParts = themeHintButton.callback_data.split(":");
assert.equal(themeParts[0], "theme");
assert.equal(themeParts[1], recommendation.blockKey);
const hintedThemeKey = themeParts[2];
const hintedTheme = getBlockSubtheme(recommendation.blockKey, hintedThemeKey);
assert.ok(hintedTheme, "theme hint must point to a real subtheme");
assert.ok(Object.keys(hintedTheme.levels || {}).length > 0, "hinted subtheme must contain levels");

const levelsMenu = levelsKeyboard(recommendation.blockKey, hintedThemeKey, 0);
const levelHintButton = levelsMenu.inline_keyboard
  .flat()
  .find((item) => item.text.startsWith("🎲 Підказка ("));
assert.ok(levelHintButton, "subtheme hint must show the suggested level in the button");
assert.ok(levelHintButton.text.length <= 64, "level hint label must fit Telegram button text");
const levelParts = levelHintButton.callback_data.split(":");
assert.equal(levelParts[0], "level");
assert.equal(levelParts[1], recommendation.blockKey);
assert.equal(levelParts[2], hintedThemeKey);
const hintedLevelKey = levelParts[3];
assert.ok(hintedTheme.levels?.[hintedLevelKey], "level hint must point to a real level");
assert.equal(
  Number(levelParts[4]),
  getLevelPage(recommendation.blockKey, hintedThemeKey, hintedLevelKey),
  "hinted level must preserve its real page for back navigation"
);

for (const keyboard of [menu, subthemesMenu, levelsMenu]) {
  assert.ok(
    !keyboard.inline_keyboard.flat().some((item) => item.text === "🔄 Інша підказка"),
    "«Інша підказка» must not appear anywhere in the hint flow"
  );
}

const resultMenu = resultKeyboard(
  "state_action",
  "lazy",
  "l1",
  0,
  { themeKey: "apathy", levelKey: "l1" }
);
const resultButtons = resultMenu.inline_keyboard.flat();
assert.ok(resultButtons.some((item) => item.text === "💡 Хочу рішення"));
assert.ok(resultButtons.some((item) => item.callback_data === "solution:apathy:l1"));
assert.ok(!resultButtons.some((item) => item.text === "➡️ Продовжити"));
assert.ok(!resultButtons.some((item) => item.text === "🎲 Інший варіант"));
assert.ok(!resultButtons.some((item) => String(item.callback_data || "").startsWith("reroll:")));

console.log("✅ Підказка показує напрям у кнопці без «Іншої підказки»");
