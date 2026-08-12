import assert from "node:assert/strict";
import {
  MAIN_BLOCK,
  getLevel,
  getRandomLevelKey
} from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericResult } from "../src/generic-result.js";
import {
  LEVELS_PER_PAGE,
  levelsKeyboard,
  mainMenuKeyboard,
  resultKeyboard,
  starterResultKeyboard,
  subthemesKeyboard
} from "../src/navigation-keyboards.js";
import {
  RESERVED_BLOCK_SLOTS,
  findLevelByArticleSlug,
  getActiveBlocks,
  getAllLevelTargets,
  getRandomRecommendation
} from "../src/navigation.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY_BLOCK_KEY = "state_action";
const expectedThemes = ["lazy", "apathy", "procrastination"];
const poolNames = ["states", "problems", "secondaryGains", "meanings", "affirmations"];
const futureBlockKeys = ["wellbeing", "growth", "future", "relations", "life"];
const forbiddenLevelPhrases = /У цьому рівні|Ключова ознака цього рівня|Цей рівень відчувається|Проблемний вузол цього рівня|Цей рівень стає важчим|Цей рівень вчить|Робота з цим рівнем|Цей рівень показує|Результат роботи з цим рівнем/u;

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
assert.deepEqual(Object.keys(FUTURE_BLOCKS), futureBlockKeys);
assert.equal(LEVELS_PER_PAGE, 8, "choice pagination must show 8 items per page");
assert.equal(RESERVED_BLOCK_SLOTS.length, 8, "architecture must keep extra reserved slots");
assert.ok(RESERVED_BLOCK_SLOTS.every((slot) => slot.enabled === false));
assert.equal(getActiveBlocks().length, 6, "main block plus five starter blocks must be active");
assert.equal(getAllLevelTargets().length, 60, "45 mature situations + 15 starter situations must be discoverable");

const recommendation = getRandomRecommendation();
assert.ok(recommendation, "main menu must be able to recommend a situation");
assert.ok(getActiveBlocks().some((block) => block.key === recommendation.blockKey));
assert.ok(recommendation.level?.articleSlug);

const homeKeyboard = mainMenuKeyboard(recommendation);
assert.equal(
  homeKeyboard.inline_keyboard.length,
  8,
  "home shows recommendation, six active blocks and about button"
);
assert.ok(
  flattenButtons(homeKeyboard).some((button) => button.callback_data.startsWith("recommend:")),
  "home must expose the recommended situation action"
);
for (const blockKey of [PRIMARY_BLOCK_KEY, ...futureBlockKeys]) {
  assert.ok(
    flattenButtons(homeKeyboard).some((button) => button.callback_data === `block:${blockKey}`),
    `home must expose block ${blockKey}`
  );
}
assert.ok(!flattenButtons(homeKeyboard).some((button) => /block:future_/i.test(button.callback_data)));
assertCallbackSizes(homeKeyboard);

const blockKeyboard = subthemesKeyboard(PRIMARY_BLOCK_KEY);
assert.equal(blockKeyboard.inline_keyboard.length, 4, "primary block shows 3 subthemes plus main menu");
assertCallbackSizes(blockKeyboard);

const allArticleSlugs = new Set();
let totalPoolItems = 0;

for (const themeKey of expectedThemes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const levelKeys = Object.keys(theme.levels);
  assert.equal(levelKeys.length, 15, `${themeKey} must have exactly 15 article-based situations`);

  const firstPage = levelsKeyboard(PRIMARY_BLOCK_KEY, themeKey, 0);
  const secondPage = levelsKeyboard(PRIMARY_BLOCK_KEY, themeKey, 1);
  const firstPageLevelButtons = flattenButtons(firstPage).filter((button) =>
    button.callback_data.startsWith("level:")
  );
  const secondPageLevelButtons = flattenButtons(secondPage).filter((button) =>
    button.callback_data.startsWith("level:")
  );

  assert.equal(firstPageLevelButtons.length, 8, `${themeKey} first page must show 8 situations`);
  assert.equal(secondPageLevelButtons.length, 7, `${themeKey} second page must show remaining 7 situations`);
  assert.ok(flattenButtons(firstPage).some((button) => button.text === "➡️"));
  assert.ok(flattenButtons(secondPage).some((button) => button.text === "⬅️"));
  assert.ok(flattenButtons(firstPage).some((button) => button.text === "📄 1/2"));
  assert.ok(flattenButtons(secondPage).some((button) => button.text === "📄 2/2"));
  assert.ok(
    flattenButtons(firstPage).some(
      (button) => button.callback_data === `block:${PRIMARY_BLOCK_KEY}`
    )
  );
  assert.ok(flattenButtons(firstPage).some((button) => button.callback_data === "home"));

  for (const button of [...firstPageLevelButtons, ...secondPageLevelButtons]) {
    assert.match(
      button.text,
      /[\p{Extended_Pictographic}]/u,
      `${themeKey} situation button must contain emoji`
    );
    assert.doesNotMatch(
      button.text,
      /\d+\s*·/u,
      `${themeKey} situation button must not expose numeric level prefixes`
    );
  }
  assertCallbackSizes(firstPage);
  assertCallbackSizes(secondPage);

  for (const poolName of poolNames) {
    const pool = theme.pools[poolName];
    assert.equal(pool.length, 500, `${themeKey}.${poolName} must contain exactly 500 items`);
    assert.equal(
      new Set(pool).size,
      500,
      `${themeKey}.${poolName} must contain 500 unique items`
    );
    for (const item of pool) {
      assert.ok(
        !/можлив|ймовірн|схоже на/i.test(item),
        `${themeKey}.${poolName} contains hedging: ${item}`
      );
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

    const target = findLevelByArticleSlug(level.articleSlug);
    assert.ok(target, `article slug must resolve to a bot situation: ${level.articleSlug}`);
    assert.equal(target.blockKey, PRIMARY_BLOCK_KEY);
    assert.equal(target.themeKey, themeKey);
    assert.equal(target.levelKey, levelKey);

    const startPayload = `article_${level.articleSlug}`;
    assert.match(startPayload, /^[A-Za-z0-9_-]+$/);
    assert.ok(
      Buffer.byteLength(startPayload, "utf8") <= 64,
      `Telegram /start payload is too long: ${startPayload}`
    );

    const result = buildResult(themeKey, levelKey);
    assert.ok(result, `${themeKey}.${levelKey} must build a result`);
    assert.equal(result.articleSlug, level.articleSlug);
    assert.match(result.text, /^🌿🧠 \*Стан\*/u, "result must begin with the state, without a preamble");

    for (const marker of [
      "🌿🧠 *Стан*",
      "🧩⚠️ *Що заважає*",
      "🪞🎁 *Що тримає цей сценарій*",
      "🌟🧭 *Навіщо це змінювати*",
      "🚀✅ *Що зробити зараз*",
      "🔑✨ *Рішення*",
      "🧭💡 *Що може допомогти далі*"
    ]) {
      assert.ok(result.text.includes(marker), `${themeKey}.${levelKey} is missing ${marker}`);
    }

    assert.ok(result.text.includes("1️⃣"));
    assert.ok(result.text.includes("2️⃣"));
    assert.ok(result.text.includes("3️⃣"));
    assert.doesNotMatch(result.text, /\*Афірмація\*/u, "affirmation label must be renamed to solution");
    assert.doesNotMatch(result.text, /Продовження:/u, "continuation preamble must not appear above state");
    assert.doesNotMatch(result.text, forbiddenLevelPhrases, "user-facing result must not expose level terminology");
    assert.ok(result.next, `${themeKey}.${levelKey} must include a concrete next suggestion`);
    assert.notEqual(result.next.themeKey, themeKey, "next suggestion must move to a related theme");
    assert.ok(
      MAIN_BLOCK.subthemes[result.next.themeKey].levels[result.next.levelKey],
      "next suggestion must reference a real situation"
    );
    assert.ok(result.text.includes(result.next.articleTitle), "next suggestion title must be visible");
    assert.ok(result.text.includes(result.next.summary), "next suggestion summary must be visible");

    const resultNav = resultKeyboard(
      PRIMARY_BLOCK_KEY,
      themeKey,
      levelKey,
      0,
      result.next
    );
    const resultButtons = flattenButtons(resultNav);
    const solutionButton = resultButtons.find((button) => button.callback_data.startsWith("solution:"));
    assert.equal(solutionButton?.text, "💡 Хочу рішення про це");
    assert.equal(
      solutionButton?.callback_data,
      `solution:${result.next.themeKey}:${result.next.levelKey}`,
      "solution button must open exactly the suggestion shown in the message"
    );
    assert.ok(resultButtons.some((button) => button.callback_data === `levels:${PRIMARY_BLOCK_KEY}:${themeKey}:0`));
    assert.ok(resultButtons.some((button) => button.callback_data === `block:${PRIMARY_BLOCK_KEY}`));
    assert.ok(resultButtons.some((button) => button.callback_data === "home"));
    assertCallbackSizes(resultNav);

    assert.ok(
      result.text.length >= 1600,
      `${themeKey}.${levelKey} result must stay detailed after removing the old preamble`
    );
    assert.ok(
      result.text.length < 4000,
      `${themeKey}.${levelKey} result must stay below Telegram message limit`
    );
    assert.ok(!result.text.includes("Можлива вторинна вигода"));
    assert.ok(!/ймовірн/i.test(result.text));
  }

  for (let i = 0; i < 100; i += 1) {
    const randomLevelKey = getRandomLevelKey(themeKey);
    assert.ok(theme.levels[randomLevelKey], `${themeKey} random situation must exist`);

    const continuation = buildContinuation(themeKey);
    assert.ok(continuation, `${themeKey} must build a continuation`);
    assert.notEqual(
      continuation.themeKey,
      themeKey,
      `${themeKey} continuation must switch to a related theme`
    );
    assert.ok(
      MAIN_BLOCK.subthemes[continuation.themeKey].levels[continuation.levelKey],
      "continuation must choose an existing random situation"
    );
    assert.match(continuation.text, /^🌿🧠 \*Стан\*/u);
    assert.doesNotMatch(continuation.text, /Продовження:/u);
  }

  const explicitTargetThemeKey = expectedThemes.find((key) => key !== themeKey);
  const explicitTargetLevelKey = Object.keys(MAIN_BLOCK.subthemes[explicitTargetThemeKey].levels)[0];
  const explicitContinuation = buildContinuation(
    themeKey,
    explicitTargetThemeKey,
    explicitTargetLevelKey
  );
  assert.equal(explicitContinuation.themeKey, explicitTargetThemeKey);
  assert.equal(explicitContinuation.levelKey, explicitTargetLevelKey);
}

const starterSlugs = new Set();
let starterLevelCount = 0;

for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  assert.equal(block.enabled, true, `${blockKey} must be visible`);
  assert.equal(block.siteStatus, "planned", `${blockKey} must be marked as a planned-site starter`);
  assert.equal(Object.keys(block.subthemes).length, 3, `${blockKey} must start with 3 subthemes`);

  const subthemes = subthemesKeyboard(blockKey);
  assert.equal(subthemes.inline_keyboard.length, 4, `${blockKey} shows 3 subthemes plus home`);
  assertCallbackSizes(subthemes);

  for (const [themeKey, theme] of Object.entries(block.subthemes)) {
    const levelEntries = Object.entries(theme.levels);
    assert.equal(levelEntries.length, 1, `${blockKey}.${themeKey} must start with exactly one situation`);
    const [[levelKey, level]] = levelEntries;
    starterLevelCount += 1;

    assert.ok(level.articleTitle);
    assert.ok(level.articleSlug);
    assert.ok(level.summary);
    assert.ok(level.state);
    assert.ok(level.problem);
    assert.ok(level.secondaryGain);
    assert.ok(level.meaning);
    assert.equal(level.actions.length, 3);
    assert.ok(level.affirmation);
    assert.ok(!starterSlugs.has(level.articleSlug), `duplicate starter slug: ${level.articleSlug}`);
    assert.ok(!allArticleSlugs.has(level.articleSlug), `starter slug collides with HabitTeen: ${level.articleSlug}`);
    starterSlugs.add(level.articleSlug);

    const target = findLevelByArticleSlug(level.articleSlug);
    assert.ok(target, `starter slug must resolve: ${level.articleSlug}`);
    assert.equal(target.blockKey, blockKey);
    assert.equal(target.themeKey, themeKey);
    assert.equal(target.levelKey, levelKey);

    const startPayload = `article_${level.articleSlug}`;
    assert.match(startPayload, /^[A-Za-z0-9_-]+$/);
    assert.ok(Buffer.byteLength(startPayload, "utf8") <= 64, `starter deep-link too long: ${startPayload}`);

    const keyboard = levelsKeyboard(blockKey, themeKey, 0);
    const levelButtons = flattenButtons(keyboard).filter((button) => button.callback_data.startsWith("level:"));
    assert.equal(levelButtons.length, 1);
    assert.doesNotMatch(levelButtons[0].text, /\d+\s*·/u);
    assertCallbackSizes(keyboard);

    const result = buildGenericResult(blockKey, themeKey, levelKey);
    assert.ok(result, `${blockKey}.${themeKey} must build a starter result`);
    assert.match(result.text, /^🌿🧠 \*Стан\*/u);
    assert.ok(result.text.includes(level.articleTitle));
    assert.ok(result.text.includes("🌿🧠 *Стан*"));
    assert.ok(result.text.includes("🧩⚠️ *Що заважає*"));
    assert.ok(result.text.includes("🪞🎁 *Що тримає цей сценарій*"));
    assert.ok(result.text.includes("🌟🧭 *Навіщо це змінювати*"));
    assert.ok(result.text.includes("1️⃣"));
    assert.ok(result.text.includes("2️⃣"));
    assert.ok(result.text.includes("3️⃣"));
    assert.ok(result.text.includes("🔑✨ *Рішення*"));
    assert.ok(result.text.includes("🧭 *Тема цього рішення*"));
    assert.doesNotMatch(result.text, /\*Афірмація\*/u);
    assert.ok(result.text.length < 4000, `${blockKey}.${themeKey} result exceeds Telegram limit`);

    const resultNav = starterResultKeyboard(blockKey, themeKey, 0);
    const callbacks = flattenButtons(resultNav).map((button) => button.callback_data);
    assert.ok(callbacks.includes(`levels:${blockKey}:${themeKey}:0`));
    assert.ok(callbacks.includes(`block:${blockKey}`));
    assert.ok(callbacks.includes("home"));
    assert.ok(!callbacks.some((callback) => callback.startsWith("solution:")));
    assert.ok(!callbacks.some((callback) => callback.startsWith("reroll:")));
    assertCallbackSizes(resultNav);
  }
}

assert.equal(starterLevelCount, 15, "five starter blocks × three subthemes must expose 15 starter situations");
assert.equal(starterSlugs.size, 15);
assert.equal(findLevelByArticleSlug("not-a-real-article"), null);
assert.equal(allArticleSlugs.size, 45, "HabitTeen must keep exactly 45 mature article topics");
assert.equal(totalPoolItems, 7500, "HabitTeen must keep exactly 7,500 pool items");

console.log(
  "✅ HabitTeen solution-flow test passed: clear state-first messages + 500-item pools + exact next-solution routing"
);
