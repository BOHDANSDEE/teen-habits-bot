import assert from "node:assert/strict";
import {
  MAIN_BLOCK,
  getLevel,
  getRandomLevelKey
} from "../src/content.js";
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

for (const themeKey of expectedThemes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const levelKeys = Object.keys(theme.levels);

  assert.equal(levelKeys.length, 10, `${themeKey} must have exactly 10 article-based levels`);

  for (const poolName of poolNames) {
    const pool = theme.pools[poolName];
    assert.equal(pool.length, 100, `${themeKey}.${poolName} must contain exactly 100 items`);
    assert.equal(
      new Set(pool).size,
      100,
      `${themeKey}.${poolName} must contain 100 unique items`
    );
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
      "🔹 Стан",
      "🔹 Проблема",
      "🔹 Можлива вторинна вигода",
      "🔹 Значення в житті",
      "🔹 Що зробити зараз",
      "🔑 Афірмація"
    ]) {
      assert.ok(result.text.includes(marker), `${themeKey}.${levelKey} is missing ${marker}`);
    }
  }

  for (let i = 0; i < 50; i += 1) {
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

assert.equal(allArticleSlugs.size, 30, "bot must map exactly 30 unique article topics");

console.log("✅ HabitTeen v2 content test passed: 30 levels + 15 pools × 100 unique items");
