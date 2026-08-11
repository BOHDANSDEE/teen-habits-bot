import assert from "node:assert/strict";
import {
  CONTINUATION_BRIDGES,
  FEELING_INTROS,
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
  getRandomBlockHint,
  getRandomLevelHint,
  getRandomThemeHint
} from "../src/navigation.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY_BLOCK_KEY = "state_action";
const expectedThemes = ["lazy", "apathy", "procrastination"];
const poolNames = ["states", "problems", "secondaryGains", "meanings", "affirmations"];
const futureBlockKeys = ["wellbeing", "growth", "future", "relations", "life"];

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
assert.equal(LEVELS_PER_PAGE, 8, "level pagination must show 8 items per page");
assert.equal(RESERVED_BLOCK_SLOTS.length, 8, "architecture must keep extra reserved slots");
assert.ok(RESERVED_BLOCK_SLOTS.every((slot) => slot.enabled === false));
assert.equal(getActiveBlocks().length, 6, "main block plus five starter blocks must be active");
assert.equal(getAllLevelTargets().length, 60, "45 mature levels + 15 starter levels must be discoverable");

const blockHint = getRandomBlockHint();
assert.ok(blockHint, "main menu hint must be able to suggest a block");
assert.ok(getActiveBlocks().some((block) => block.key === blockHint.blockKey));
assert.equal(blockHint.themeKey, undefined, "first hint stage must not preselect a subtheme");
assert.equal(blockHint.levelKey, undefined, "first hint stage must not preselect a level");

const themeHint = getRandomThemeHint(blockHint.blockKey);
assert.ok(themeHint?.themeKey, "second hint stage must suggest a subtheme");
assert.equal(themeHint.levelKey, undefined, "second hint stage must not preselect a level");

const levelHint = getRandomLevelHint(blockHint.blockKey, themeHint.themeKey);
assert.ok(levelHint?.levelKey, "third hint stage must suggest a level");
assert.ok(levelHint.level?.articleSlug);

const homeKeyboard = mainMenuKeyboard();
assert.equal(
  homeKeyboard.inline_keyboard.length,
  8,
  "home shows one hint button, six active blocks and about button"
);
assert.ok(
  flattenButtons(homeKeyboard).some((button) => button.callback_data === "hint:block"),
  "home must expose the first staged hint action"
);
assert.ok(
  !flattenButtons(homeKeyboard).some((button) => button.callback_data.startsWith("recommend:")),
  "new home menu must not expose direct-to-result recommendation callbacks"
);
for (const blockKey of [PRIMARY_BLOCK_KEY, ...futureBlockKeys]) {
  assert.ok(
    flattenButtons(homeKeyboard).some((button) => button.callback_data === `block:${blockKey}`),
    `home must expose block ${blockKey}`
  );
}
assert.ok(!flattenButtons(homeKeyboard).some((button) => /block:future_/i.test(button.callback_data)));
assertCallbackSizes(homeKeyboard);

const hintedHomeKeyboard = mainMenuKeyboard(blockHint);
assert.ok(
  flattenButtons(hintedHomeKeyboard).some((button) => button.callback_data === `block:${blockHint.blockKey}`),
  "a block hint must remain a choice, not an automatic navigation"
);
assert.ok(
  flattenButtons(hintedHomeKeyboard).some((button) => button.callback_data === "hint:block"),
  "a person must be able to request another block hint"
);
assertCallbackSizes(hintedHomeKeyboard);

const blockKeyboard = subthemesKeyboard(PRIMARY_BLOCK_KEY);
assert.equal(blockKeyboard.inline_keyboard.length, 5, "primary block shows hint, 3 subthemes and main menu");
assert.ok(
  flattenButtons(blockKeyboard).some(
    (button) => button.callback_data === `hint:theme:${PRIMARY_BLOCK_KEY}`
  )
);
assertCallbackSizes(blockKeyboard);

const allArticleSlugs = new Set();
let totalPoolItems = 0;

for (const themeKey of expectedThemes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const levelKeys = Object.keys(theme.levels);
  assert.equal(levelKeys.length, 15, `${themeKey} must have exactly 15 article-based levels`);

  const firstPage = levelsKeyboard(PRIMARY_BLOCK_KEY, themeKey, 0);
  const secondPage = levelsKeyboard(PRIMARY_BLOCK_KEY, themeKey, 1);
  const firstPageLevelButtons = flattenButtons(firstPage).filter((button) =>
    button.callback_data.startsWith("level:")
  );
  const secondPageLevelButtons = flattenButtons(secondPage).filter((button) =>
    button.callback_data.startsWith("level:")
  );

  assert.equal(firstPageLevelButtons.length, 8, `${themeKey} first page must show 8 levels`);
  assert.equal(secondPageLevelButtons.length, 7, `${themeKey} second page must show remaining 7 levels`);
  assert.ok(flattenButtons(firstPage).some((button) => button.text === "➡️"));
  assert.ok(flattenButtons(secondPage).some((button) => button.text === "⬅️"));
  assert.ok(flattenButtons(firstPage).some((button) => button.text === "📄 1/2"));
  assert.ok(flattenButtons(secondPage).some((button) => button.text === "📄 2/2"));
  assert.ok(
    flattenButtons(firstPage).some(
      (button) => button.callback_data === `hint:level:${PRIMARY_BLOCK_KEY}:${themeKey}`
    )
  );
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
      `${themeKey} level button must contain emoji`
    );
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
    assert.ok(target, `article slug must resolve to a bot level: ${level.articleSlug}`);
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
    assert.ok(
      result.text.length >= 1800,
      `${themeKey}.${levelKey} result must be richer than old short format`
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
    assert.ok(theme.levels[randomLevelKey], `${themeKey} random level must exist`);

    const continuation = buildContinuation(themeKey);
    assert.ok(continuation, `${themeKey} must build a continuation`);
    assert.notEqual(
      continuation.themeKey,
      themeKey,
      `${themeKey} continuation must switch to a related theme`
    );
    assert.ok(
      MAIN_BLOCK.subthemes[continuation.themeKey].levels[continuation.levelKey],
      "continuation must choose an existing random level"
    );
  }
}

const starterSlugs = new Set();
let starterLevelCount = 0;

for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  assert.equal(block.enabled, true, `${blockKey} must be visible`);
  assert.equal(block.siteStatus, "planned", `${blockKey} must be marked as a planned-site starter`);
  assert.equal(Object.keys(block.subthemes).length, 3, `${blockKey} must start with 3 subthemes`);

  const subthemes = subthemesKeyboard(blockKey);
  assert.equal(subthemes.inline_keyboard.length, 5, `${blockKey} shows hint, 3 subthemes plus home`);
  assert.ok(
    flattenButtons(subthemes).some((button) => button.callback_data === `hint:theme:${blockKey}`)
  );
  assertCallbackSizes(subthemes);

  for (const [themeKey, theme] of Object.entries(block.subthemes)) {
    const levelEntries = Object.entries(theme.levels);
    assert.equal(levelEntries.length, 1, `${blockKey}.${themeKey} must start with exactly one level`);
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
    assert.ok(
      flattenButtons(keyboard).some(
        (button) => button.callback_data === `hint:level:${blockKey}:${themeKey}`
      )
    );
    assertCallbackSizes(keyboard);

    const result = buildGenericResult(blockKey, themeKey, levelKey);
    assert.ok(result, `${blockKey}.${themeKey} must build a starter result`);
    assert.ok(result.text.includes(block.name));
    assert.ok(result.text.includes(theme.name));
    assert.ok(result.text.includes(level.articleTitle));
    assert.ok(result.text.includes("🌿🧠 *Стан*"));
    assert.ok(result.text.includes("🧩⚠️ *Проблема*"));
    assert.ok(result.text.includes("🪞🎁 *Вторинна вигода*"));
    assert.ok(result.text.includes("🌟🧭 *Значення в житті*"));
    assert.ok(result.text.includes("1️⃣"));
    assert.ok(result.text.includes("2️⃣"));
    assert.ok(result.text.includes("3️⃣"));
    assert.ok(result.text.includes("🔑✨ *Афірмація*"));
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

assert.equal(starterLevelCount, 15, "five starter blocks × three subthemes must expose 15 starter levels");
assert.equal(starterSlugs.size, 15);
assert.equal(findLevelByArticleSlug("not-a-real-article"), null);

for (const text of [...FEELING_INTROS, ...CONTINUATION_BRIDGES]) {
  assert.ok(
    !/можлив|ймовірн|схоже на/i.test(text),
    `direct-tone text contains hedging: ${text}`
  );
}

assert.equal(allArticleSlugs.size, 45, "HabitTeen must keep exactly 45 mature article topics");
assert.equal(totalPoolItems, 7500, "HabitTeen must keep exactly 7,500 pool items");

console.log(
  "✅ HabitTeen multi-block test passed: 45 mature levels + 15 starter levels + staged hints"
);
