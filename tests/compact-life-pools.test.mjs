import assert from "node:assert/strict";
import { INDEPENDENT_LIFE_POOLS, POOL_SIZE } from "../src/independent-life-pools.js";

const LIMITS = Object.freeze({
  problems: 350,
  gains: 270,
  meanings: 240,
  affirmations: 340,
  results: 410
});

const longest = (pool) => Math.max(...pool.map((text) => String(text).length));

assert.equal(POOL_SIZE, 4000);

let combinedLongest = 0;
for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  assert.equal(pool.length, POOL_SIZE, `${name}: exactly ${POOL_SIZE}`);
  assert.equal(new Set(pool).size, POOL_SIZE, `${name}: all ${POOL_SIZE} texts stay unique`);

  const maxLength = longest(pool);
  assert.ok(
    maxLength <= LIMITS[name],
    `${name}: longest text is ${maxLength}, compact limit is ${LIMITS[name]}`
  );
  combinedLongest += maxLength;
}

assert.ok(
  combinedLongest <= 1600,
  `five longest shared sections total ${combinedLongest} chars; compact limit is 1600`
);

console.log(`✅ Compact shared pools: 5 × ${POOL_SIZE}; longest five-section body ${combinedLongest} chars`);
