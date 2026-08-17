import { INDEPENDENT_LIFE_POOLS } from "../src/independent-life-pools.js";

for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  const ranked = pool
    .map((text, index) => ({ index, text, length: text.length }))
    .sort((a, b) => b.length - a.length);
  const avg = pool.reduce((sum, text) => sum + text.length, 0) / pool.length;
  console.log(`METRIC ${name}: max=${ranked[0].length} avg=${avg.toFixed(1)}`);
  for (const item of ranked.slice(0, 3)) console.log(`LONG ${name} #${item.index}: ${item.text}`);
}
