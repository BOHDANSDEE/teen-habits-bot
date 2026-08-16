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

const metrics = {};
let combinedLongest = 0;
for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  assert.equal(pool.length, POOL_SIZE, `${name}: exactly ${POOL_SIZE}`);
  assert.equal(new Set(pool).size, POOL_SIZE, `${name}: all ${POOL_SIZE} texts stay unique`);

  metrics[name] = {
    max: longest(pool),
    average: average(pool)
  };
  combinedLongest += metrics[name].max;
}

const failures = Object.entries(metrics).flatMap(([name, value]) => {
  const items = [];
  if (value.max > LIMITS[name]) items.push(`${name}: max ${value.max} > ${LIMITS[name]}`);
  if (value.average > AVERAGE_LIMITS[name]) {
    items.push(`${name}: avg ${value.average.toFixed(1)} > ${AVERAGE_LIMITS[name]}`);
  }
  return items;
});
if (combinedLongest > 670) failures.push(`combined max ${combinedLongest} > 670`);

assert.equal(
  failures.length,
  0,
  `compactness failures: ${failures.join("; ")}; metrics=${JSON.stringify(
    Object.fromEntries(Object.entries(metrics).map(([name, value]) => [name, { max: value.max, avg: Number(value.average.toFixed(1)) }]))
  )}`
);

console.log(`✅ Short shared pools: 5 × ${POOL_SIZE}; metrics ${JSON.stringify(metrics)}; combined max ${combinedLongest}`);
