import assert from "node:assert/strict";
import {
  getIndependentLifeVariant,
  INDEPENDENT_LIFE_POOLS,
  POOL_SIZE
} from "../src/independent-life-pools.js";

const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];

assert.equal(INDEPENDENT_LIFE_POOLS.gains.length, POOL_SIZE);
assert.equal(INDEPENDENT_LIFE_POOLS.meanings.length, POOL_SIZE);
assert.equal(new Set(INDEPENDENT_LIFE_POOLS.gains).size, POOL_SIZE);
assert.equal(new Set(INDEPENDENT_LIFE_POOLS.meanings).size, POOL_SIZE);

for (const text of INDEPENDENT_LIFE_POOLS.gains) {
  const sentences = splitSentences(text).map((part) => part.trim());
  assert.equal(sentences.length, 2, `Secondary Gain must have exactly 2 sentences: ${text}`);
  assert.match(sentences[0], /(?:легше|отримуєш|зберігаєш)/iu, `Secondary Gain must state an immediate concrete benefit: ${text}`);
  assert.match(sentences[1], /^Тому тобі вигідно залишатися у такому способі дій/u);
  assert.doesNotMatch(text, /тримати всі справи вище за себе|ставити всі справи вище за себе/iu);
}

for (const text of INDEPENDENT_LIFE_POOLS.meanings) {
  const count = splitSentences(text).length;
  assert.ok(count === 1 || count === 2, `Meaning must have 1–2 sentences: ${text}`);
  assert.doesNotMatch(text, /Коли відпочиваєш,\s*(?:тому|через це|у підсумку)\s+ти/iu);
  assert.doesNotMatch(text, /проблема дає наслідок|результат такий|це видно так/iu);
}

for (let index = 0; index < POOL_SIZE; index += 1) {
  const variant = getIndependentLifeVariant(index);
  const problemSentences = splitSentences(variant.problem).map((part) => part.trim());
  assert.ok(problemSentences.length >= 2);
  const directCost = problemSentences[1]
    .replace(/^Через це\s+/u, "")
    .replace(/[.!?…]+$/u, "")
    .trim()
    .toLowerCase();
  assert.ok(directCost.length > 5);
  assert.ok(
    !variant.meaning.toLowerCase().includes(directCost),
    `Meaning must not repeat Problem consequence verbatim: ${variant.problem} / ${variant.meaning}`
  );
}

console.log("✅ Secondary Gain states a real immediate benefit; Meaning no longer repeats Problem consequence");
