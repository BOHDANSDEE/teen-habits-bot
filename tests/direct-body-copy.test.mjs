import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildResult } from "../src/renderer.js";
import { buildGenericResult } from "../src/generic-result.js";

const FORBIDDEN_OLD = /🌿🧠 \*Стан\*|(?:^|\n)Ти відчуваєш (?:легкий |слабкий |помітний |виражений )?(?:біль(?=\s|[.,!?…]|$)|важкість|напругу|втому|тиск)|💭 \*Ти так це відчуваєш\?\*|✨ \*Тепер ти відчуваєш\*|Тіло:\s*Інтуїтивне/imu;

const cleanupLevel = MAIN_BLOCK.subthemes.lazy.levels.l6;
assert.ok(cleanupLevel, "lazy.l6 cleanup level must exist");

const cleanupTexts = Array.from({ length: 500 }, (_, index) => buildResult("lazy", "l6", index));
assert.equal(cleanupTexts.length, 500);
assert.equal(new Set(cleanupTexts.map((item) => item.text)).size, 500, "cleanup full visible outputs unique");
assert.ok(cleanupTexts.every((item) => item.text.includes("🔎 *Проблема: Лінь прибирати*")));
assert.ok(cleanupTexts.every((item) => item.text.includes("Ти відкладаєш прибирання")), "problem directly names cleanup behavior");
assert.ok(cleanupTexts.every((item) => !FORBIDDEN_OLD.test(item.text)), "old body-state format removed");

const stabilityCount = cleanupTexts.filter((item) => /відчуття стабільності|стабільності й передбачуваності/iu.test(item.text)).length;
assert.ok(stabilityCount >= 100, "cleanup secondary-gain variants include stability as a concrete benefit when familiarity drives the problem");

for (const item of cleanupTexts) {
  const resultStart = item.text.indexOf("✨ *Результат*\n");
  assert.ok(resultStart >= 0);
  const after = item.text.slice(resultStart + "✨ *Результат*\n".length);
  assert.ok(/Тепер /u.test(after));
  assert.ok(item.text.includes("🔑 *Афірмація*"));
  assert.ok(item.text.includes("🪞 *Вторинна вигода*"));
  assert.ok(item.text.includes("🌟 *Значення в житті*"));
  assert.ok(item.text.length < 4096);
}

let genericChecked = 0;
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  if (block.enabled === false) continue;
  for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
    for (const levelKey of Object.keys(theme.levels || {})) {
      const rendered = buildGenericResult(blockKey, themeKey, levelKey, 0);
      assert.ok(rendered);
      assert.doesNotMatch(rendered.text, FORBIDDEN_OLD);
      assert.ok(rendered.text.includes("🔹 *Проблема*"));
      assert.ok(rendered.text.includes("🪞 *Вторинна вигода*"));
      assert.ok(rendered.text.includes("🌟 *Значення в житті*"));
      assert.ok(rendered.text.includes("🔑 *Афірмація*"));
      assert.ok(rendered.text.includes("✨ *Результат*"));
      genericChecked += 1;
    }
  }
}
assert.ok(genericChecked > 0);

console.log("✅ Old body-state format removed; cleanup and generic cards use the new problem → gain → meaning → affirmation → result structure");
