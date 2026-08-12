import assert from "node:assert/strict";
import { MAIN_BLOCK, getLevel, getRandomLevelKey } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericResult } from "../src/generic-result.js";
import {
  EXPERIENCE_MODES,
  EXPERIENCE_POOLS,
  EXPERIENCES_PER_MODE
} from "../src/experience-pools.js";
import {
  resultKeyboard,
  starterResultKeyboard
} from "../src/navigation-keyboards.js";
import {
  findLevelByArticleSlug,
  getAllLevelTargets
} from "../src/navigation.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY_BLOCK_KEY = "state_action";
const themes = ["lazy", "apathy", "procrastination"];
const oldPoolNames = ["states", "problems", "secondaryGains", "meanings", "affirmations"];
const modeStarts = {
  mirror: /^🪞|^🧠|^🌿|^🎯|^💭|^🧭|^⚡|^🔎|^🌤️|^🪴|^🧩|^🚦|^🌊|^🔑/u,
  quiz: /^🧩 \*Коротке опитування про тебе\*/u,
  story: /^📖 \*Історія/u
};
const oldVisibleSections = [
  "🌿🧠 *Стан*",
  "🧩⚠️ *Що заважає*",
  "🪞🎁 *Що тримає цей сценарій*",
  "🌟🧭 *Навіщо це змінювати*",
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

assert.deepEqual(Object.keys(MAIN_BLOCK.subthemes), themes);
assert.deepEqual(EXPERIENCE_MODES, ["mirror", "quiz", "story"]);
assert.equal(EXPERIENCES_PER_MODE, 350);
assert.equal(getAllLevelTargets().length, 60, "45 mature + 15 starter situations must remain discoverable");

let oldPoolTotal = 0;
let experienceTotal = 0;
const articleSlugs = new Set();

for (const themeKey of themes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const levelKeys = Object.keys(theme.levels);
  assert.equal(levelKeys.length, 15, `${themeKey} must keep 15 article situations`);

  for (const poolName of oldPoolNames) {
    const pool = theme.pools[poolName];
    assert.equal(pool.length, 500, `${themeKey}.${poolName} keeps the 500-item semantic source pool`);
    assert.equal(new Set(pool).size, 500, `${themeKey}.${poolName} source pool stays unique`);
    oldPoolTotal += pool.length;
  }

  const experiencePools = EXPERIENCE_POOLS[themeKey];
  assert.ok(experiencePools, `${themeKey} must have user-facing experience pools`);

  for (const mode of EXPERIENCE_MODES) {
    const pool = experiencePools[mode];
    assert.equal(pool.length, 350, `${themeKey}.${mode} must contain exactly 350 experiences`);
    assert.equal(
      new Set(pool.map((item) => item.text)).size,
      350,
      `${themeKey}.${mode} must contain 350 unique rendered texts`
    );
    assert.ok(pool.every((item) => item.solution), `${themeKey}.${mode} every experience needs a solution`);

    if (mode === "mirror") {
      assert.ok(pool.every((item) => item.text.includes("Ти відчуваєш")));
    }
    if (mode === "quiz") {
      for (const item of pool) {
        for (const marker of ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "• А.", "• Б.", "• В.", "• Г."]) {
          assert.ok(item.text.includes(marker), `${themeKey}.quiz is missing ${marker}`);
        }
      }
    }
    if (mode === "story") {
      assert.ok(pool.every((item) => /Сенс/u.test(item.text)), `${themeKey}.story must carry an explicit meaning`);
    }

    experienceTotal += pool.length;
  }

  for (const levelKey of levelKeys) {
    const level = getLevel(themeKey, levelKey);
    assert.ok(level?.articleSlug);
    assert.ok(level?.articleTitle);
    assert.ok(level?.summary);
    assert.equal(level.actions?.length, 3);
    assert.ok(!articleSlugs.has(level.articleSlug), `duplicate article slug: ${level.articleSlug}`);
    articleSlugs.add(level.articleSlug);

    const deepLinkTarget = findLevelByArticleSlug(level.articleSlug);
    assert.equal(deepLinkTarget?.blockKey, PRIMARY_BLOCK_KEY);
    assert.equal(deepLinkTarget?.themeKey, themeKey);
    assert.equal(deepLinkTarget?.levelKey, levelKey);

    for (const mode of EXPERIENCE_MODES) {
      for (let sample = 0; sample < 8; sample += 1) {
        const result = buildResult(themeKey, levelKey, mode);
        assert.ok(result, `${themeKey}.${levelKey}.${mode} must render`);
        assert.equal(result.mode, mode);
        assert.equal(result.articleSlug, level.articleSlug);
        assert.match(result.text, modeStarts[mode], `${mode} must visibly look like its format`);
        assert.ok(result.text.includes(level.summary), "selected article focus must remain visible");
        assert.ok(result.text.includes("🚀✅ *Що спробувати зараз*"));
        assert.ok(result.text.includes("🔑✨ *Рішення*"));
        assert.ok(result.text.includes("🧭💡 *Що може допомогти далі*"));
        assert.ok(result.text.includes("1️⃣"));
        assert.ok(result.text.includes("2️⃣"));
        assert.ok(result.text.includes("3️⃣"));
        assert.ok(result.next, "every mature result needs a concrete next suggestion");
        assert.notEqual(result.next.themeKey, themeKey, "next suggestion must switch theme");
        assert.ok(MAIN_BLOCK.subthemes[result.next.themeKey].levels[result.next.levelKey]);
        assert.ok(result.text.includes(result.next.articleTitle));
        assert.ok(result.text.includes(result.next.summary));

        const solutionIndex = result.text.lastIndexOf("🔑✨ *Рішення*");
        const nextIndex = result.text.lastIndexOf("🧭💡 *Що може допомогти далі*");
        assert.ok(solutionIndex > nextIndex, "solution must be the final content section");

        for (const oldSection of oldVisibleSections) {
          assert.ok(!result.text.includes(oldSection), `old rigid section leaked into ${mode}: ${oldSection}`);
        }

        assert.ok(result.text.length < 4000, `${themeKey}.${levelKey}.${mode} must stay under Telegram limit`);

        const keyboard = resultKeyboard(PRIMARY_BLOCK_KEY, themeKey, levelKey, 0, result.next);
        const solutionButton = buttons(keyboard).find((button) => button.callback_data.startsWith("solution:"));
        assert.equal(solutionButton?.text, "💡 Хочу рішення про це");
        assert.equal(solutionButton?.callback_data, `solution:${result.next.themeKey}:${result.next.levelKey}`);
        assertCallbackSizes(keyboard);
      }
    }
  }

  for (let index = 0; index < 60; index += 1) {
    const randomLevelKey = getRandomLevelKey(themeKey);
    assert.ok(theme.levels[randomLevelKey]);
    const continuation = buildContinuation(themeKey);
    assert.ok(continuation);
    assert.notEqual(continuation.themeKey, themeKey);
    assert.ok(EXPERIENCE_MODES.includes(continuation.mode));
    assert.ok(continuation.text.includes("🔑✨ *Рішення*"));
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
    assert.match(result.text, /^🪞 \*Ти відчуваєш це так\*/u);
    assert.ok(result.text.includes("Ти відчуваєш"));
    assert.ok(result.text.includes("🚀✅ *Що спробувати зараз*"));
    assert.ok(result.text.includes("🔑✨ *Рішення*"));
    for (const oldSection of oldVisibleSections) {
      assert.ok(!result.text.includes(oldSection));
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
assert.equal(oldPoolTotal, 7500, "old semantic source layer remains intact");
assert.equal(experienceTotal, 3150, "3 themes × 3 formats × 350 user-facing experiences");

console.log("✅ Experience flow passed: 350 mirror + 350 quiz + 350 story variants per theme, all ending in Рішення");
