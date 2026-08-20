import assert from "node:assert/strict";
import {
  getLifeSubtopicPoolIndices,
  INDEPENDENT_LIFE_POOLS,
  POOL_SIZE
} from "../src/independent-life-pools.js";

const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];
const STARTS_WITH_INFINITIVE = /^Я\s+(?:не\s+)?[А-Яа-яІіЇїЄєҐґ’'-]+(?:ти|тися|тись)\b/u;
const OLD_AFFIRMATION_FRAME = /^Я\s+(?:можу|обираю|маю право)\b/u;

assert.equal(INDEPENDENT_LIFE_POOLS.affirmations.length, POOL_SIZE);
assert.equal(new Set(INDEPENDENT_LIFE_POOLS.affirmations).size, POOL_SIZE);

for (const text of INDEPENDENT_LIFE_POOLS.affirmations) {
  const sentences = splitSentences(text).map((part) => part.trim());
  assert.equal(sentences.length, 2, `Affirmation must have exactly 2 sentences: ${text}`);

  for (const part of sentences) {
    assert.match(part, /^Я\s/u, `Every affirmation sentence must start with Я: ${text}`);
    assert.doesNotMatch(part, OLD_AFFIRMATION_FRAME, `No old modal frame: ${text}`);
    assert.doesNotMatch(part, STARTS_WITH_INFINITIVE, `Affirmation must be a direct statement, not Я + infinitive: ${text}`);
  }
}

const listening = getLifeSubtopicPoolIndices("friends", "listening", "affirmations")
  .map((index) => INDEPENDENT_LIFE_POOLS.affirmations[index]);

assert.equal(listening.length, 20);
assert.equal(new Set(listening).size, 20);
assert.ok(listening.every((text) => !/залишаюся собою поруч із друзями/u.test(text)));
assert.ok(listening.every((text) => /дослуховую|поважаю|слухаю|не перебиваю|даю/u.test(text)));
assert.ok(listening.includes("Я дослуховую інших до кінця. Я поважаю думку іншої людини."));

console.log("✅ Affirmations: all 4000 are two direct same-subtopic statements; listening matches the approved style");
