import assert from "node:assert/strict";
import { HINTS } from "../src/hint-pool.js";
import { getRandomRecommendation } from "../src/navigation.js";
import { mainMenuKeyboard } from "../src/navigation-keyboards.js";

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
const button = menu.inline_keyboard.flat().find((item) => item.text === "🎲 Підказка");
assert.ok(button);
assert.equal(button.callback_data, `recommend:${recommendation.blockKey}:null:null`);

console.log("✅ 500 hints: block → subblock → level");
