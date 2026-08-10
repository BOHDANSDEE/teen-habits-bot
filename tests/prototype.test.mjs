import assert from "node:assert/strict";
import {
  CONTINUATION_BRIDGES,
  FEELING_INTROS,
  MAIN_BLOCK,
  getLevel,
  getRandomLevelKey
} from "../src/content.js";
import { levelsKeyboard } from "../src/keyboards.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const expectedThemes = ["lazy", "apathy", "procrastination"];
const poolNames = [
  "states",
  "problems",
  "secondaryGains",
  "meanings",
  "affirmations"
];

assert.deepEqual(Object.keys(MAIN_BLOCK.subthemes), expectedThemes);

const allArticleSlugs = new Set();
let totalPoolItems = 0;

for (const themeKey of expectedThemes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const levelKeys = Object.keys(theme.levels);

  assert.equal(levelKeys.length, 15, `${themeKey} must have exactly 15 article-based levels`);

  const keyboard = levelsKeyboard(themeKey);
  assert.equal(keyboard.inline_keyboard.length, 17, `${themeKey} must show 15 levels + 2 navigation rows`);
  for (const row of keyboard.inline_keyboard.slice(0, 15)) {
    assert.match(row[0].text, /[\p{Extended_Pictographic}]/u, `${themeKey} level button must contain emoji`);
  }

  for (const poolName of poolNames) {
    const pool = theme.pools[poolName];
    assert.equal(pool.length, 500, `${themeKey}.${poolName} must contain exactly 500 items`);
    assert.equal(
      new Set(pool).size,
      500,
      `${themeKey}.${poolName} must contain 500 unique items`
    );

    for (const item of pool) {
      assert.ok(!/можлив|ймовірн|схоже на/i.test(item), `${themeKey}.${poolName} contains hedging: ${item}`);
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
    assert.ok(result.text.length >= 1800, `${themeKey}.${levelKey} result must be richer than old short format`);
    assert.ok(result.text.length < 4000, `${themeKey}.${levelKey} result must stay below Telegram message limit`);
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

for (const text of [...FEELING_INTROS, ...CONTINUATION_BRIDGES]) {
  assert.ok(!/можлив|ймовірн|схоже на/i.test(text), `direct-tone text contains hedging: ${text}`);
}

assert.equal(allArticleSlugs.size, 45, "bot must map exactly 45 unique article topics");
assert.equal(totalPoolItems, 7500, "bot must expose exactly 7,500 pool items");

console.log("✅ HabitTeen rich-copy test passed: 45 levels, emoji UI, long blocks, 7,500 pool items");
