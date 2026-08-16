import assert from "node:assert/strict";
import { INDEPENDENT_LIFE_POOLS, POOL_SIZE } from "../src/independent-life-pools.js";

// Реальна кількість рядків залежить від ширини екрана та розміру шрифту.
// Ці межі тримають 4 звичайні секції приблизно в масштабі 2–2.5 мобільних рядка,
// а Result — приблизно 3–3.5 рядка на типовому екрані Telegram.
const LIMITS = Object.freeze({
  problems: 125,
  gains: 130,
  meanings: 115,
  affirmations: 120,
  results: 180
});

const AVERAGE_LIMITS = Object.freeze({
  problems: 100,
  gains: 115,
  meanings: 80,
  affirmations: 100,
  results: 165
});

const longest = (pool) => Math.max(...pool.map((text) => String(text).length));
const average = (pool) => pool.reduce((sum, text) => sum + String(text).length, 0) / pool.length;

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

  const avgLength = average(pool);
  assert.ok(
    avgLength <= AVERAGE_LIMITS[name],
    `${name}: average text is ${avgLength.toFixed(1)}, compact average limit is ${AVERAGE_LIMITS[name]}`
  );

  combinedLongest += maxLength;
}

assert.ok(
  combinedLongest <= 670,
  `five longest shared sections total ${combinedLongest} chars; compact limit is 670`
);

console.log(`✅ Short shared pools: 5 × ${POOL_SIZE}; longest five-section body ${combinedLongest} chars`);
