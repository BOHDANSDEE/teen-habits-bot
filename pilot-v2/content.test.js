import test from "node:test";
import assert from "node:assert/strict";
import {
  PILOT_THEME,
  buildResult,
  getFirstLevel,
  getTransitionText,
  pickNextSubtheme
} from "./content.js";

const keys = ["lazy", "apathy", "procrastination"];

test("pilot has one shared block and three subthemes", () => {
  assert.equal(PILOT_THEME.key, "energy_action");
  assert.deepEqual(Object.keys(PILOT_THEME.subthemes), keys);
});

test("each subtheme has at least one level and all final sections", () => {
  for (const key of keys) {
    assert.ok(getFirstLevel(key));
    const result = buildResult(key, { rng: () => 0 });

    for (const marker of [
      "🔹 Стан",
      "🔹 Проблема",
      "🔹 Вторинна вигода",
      "🔹 Значення в житті",
      "🔹 Афірмація"
    ]) {
      assert.match(result.text, new RegExp(marker));
    }
  }
});

test("continuation always moves to another subtheme", () => {
  for (const key of keys) {
    const nextLow = pickNextSubtheme(key, { rng: () => 0 });
    const nextHigh = pickNextSubtheme(key, { rng: () => 0.999 });

    assert.notEqual(nextLow, key);
    assert.notEqual(nextHigh, key);
    assert.ok(keys.includes(nextLow));
    assert.ok(keys.includes(nextHigh));
    assert.ok(getTransitionText(key, nextLow).length > 20);
  }
});
