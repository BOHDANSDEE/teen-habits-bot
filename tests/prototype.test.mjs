import assert from "node:assert/strict";
import { MAIN_BLOCK, getFirstLevelKey } from "../src/content.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const expectedThemes = ["lazy", "apathy", "procrastination"];

assert.deepEqual(Object.keys(MAIN_BLOCK.subthemes), expectedThemes);

for (const themeKey of expectedThemes) {
  const levelKey = getFirstLevelKey(themeKey);
  assert.ok(levelKey, `${themeKey} must have at least one level`);

  const result = buildResult(themeKey, levelKey);
  assert.ok(result, `${themeKey} must build a result`);

  for (const marker of [
    "🔹 Стан",
    "🔹 Проблема",
    "🔹 Можлива вторинна вигода",
    "🔹 Значення в житті",
    "🔹 Що зробити зараз",
    "🔑 Афірмація"
  ]) {
    assert.ok(result.text.includes(marker), `${themeKey} is missing ${marker}`);
  }

  const continuation = buildContinuation(themeKey);
  assert.ok(continuation, `${themeKey} must build a continuation`);
  assert.notEqual(
    continuation.themeKey,
    themeKey,
    `${themeKey} continuation must switch to a related theme`
  );
}

console.log("✅ HabitTeen v2 prototype smoke-test passed");
