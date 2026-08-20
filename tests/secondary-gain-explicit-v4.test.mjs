import assert from "node:assert/strict";
import {
  getLifeSubtopicPoolIndices,
  INDEPENDENT_LIFE_POOLS,
  POOL_SIZE
} from "../src/independent-life-pools.js";

const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];
const gains = INDEPENDENT_LIFE_POOLS.gains;

assert.equal(gains.length, POOL_SIZE);
assert.equal(new Set(gains).size, POOL_SIZE, "all 4000 Secondary Gain texts stay unique");

for (const text of gains) {
  const sentences = splitSentences(text).map((part) => part.trim());
  assert.equal(sentences.length, 2, `Secondary Gain must stay exactly 2 sentences: ${text}`);
  assert.match(sentences[0], /^У такому способі дії ти\s/u, `Gain must start directly: ${text}`);
  assert.doesNotMatch(sentences[0], /^У знайомому способі|^Коли дієш по-старому|^Поки все лишається як є/iu);
  assert.match(
    sentences[1],
    /^Тому тобі вигідно залишатися у такому способі дій —\s+\S/u,
    `Gain must explain why the old way is attractive: ${text}`
  );
  const explanation = sentences[1].split("—").slice(1).join("—").trim();
  assert.ok(explanation.length >= 25, `Gain explanation is too vague: ${text}`);
}

const manyGoalGains = getLifeSubtopicPoolIndices("goals", "many", "gains")
  .map((index) => gains[index]);
assert.equal(manyGoalGains.length, 20);
assert.ok(manyGoalGains.every((text) => /приємний заряд від кожної нової ідеї/u.test(text)));
assert.ok(manyGoalGains.every((text) => /—.*(?:ціл|іде|нов|пріоритет|напрям)/iu.test(text)));
assert.ok(manyGoalGains.some((text) => /можна знову захопитися новим/u.test(text)));

console.log("✅ Secondary Gain: 4000 texts start directly and explain why the old behavior feels useful now");
