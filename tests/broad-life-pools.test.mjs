import assert from "node:assert/strict";
import {
  getIndependentLifeVariant,
  INDEPENDENT_LIFE_POOLS,
  POOL_SIZE
} from "../src/independent-life-pools.js";

const sentenceCount = (text) => (String(text).match(/[.!?…](?=\s|$)/gu) || []).length;

assert.equal(POOL_SIZE, 4000);
for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  assert.equal(pool.length, POOL_SIZE, `${name}: exactly ${POOL_SIZE}`);
  assert.equal(new Set(pool).size, POOL_SIZE, `${name}: all visible texts are unique`);
}

const broadText = `${INDEPENDENT_LIFE_POOLS.problems.join(" ")} ${INDEPENDENT_LIFE_POOLS.meanings.join(" ")}`;
for (const sphere of [
  /друз|друж/iu,
  /сім/iu,
  /навчан/iu,
  /грош/iu,
  /стосунк/iu,
  /здоров/iu,
  /майбут/iu,
  /побут/iu,
  /самооцін/iu,
  /меж/iu,
  /час/iu,
  /відпоч/iu,
  /соцмереж/iu,
  /робот/iu,
  /спорт/iu,
  /спілкуван/iu,
  /ціл/iu,
  /емоці/iu,
  /відповідальн/iu,
  /розвит/iu
]) {
  assert.match(broadText, sphere, `missing broad life sphere: ${sphere}`);
}

assert.doesNotMatch(
  broadText,
  /під час прогулянк|відпочин(?:ок|ку) з друз|після уроків з друз|роботі або підробітку|нових знайомствах|домашньому просторі|розмовах про майбутнє/iu,
  "shared pools should stay broad instead of locking a text to a narrow scene"
);

assert.ok(
  INDEPENDENT_LIFE_POOLS.gains.every((text) => /тобі вигідно/iu.test(text)),
  "every secondary gain directly explains why staying in the problem feels beneficial"
);
assert.ok(
  INDEPENDENT_LIFE_POOLS.results.every((text) => sentenceCount(text) === 3),
  "every result has exactly three sentences"
);
assert.ok(
  INDEPENDENT_LIFE_POOLS.results.every((text) => /^Ти відчуваєш полегшення/iu.test(text)),
  "every result starts with a body-relief sentence"
);
assert.ok(
  INDEPENDENT_LIFE_POOLS.results.every((text) => /Тепер тобі стало легше/iu.test(text)),
  "every result includes the easier-next-action sentence"
);

const samples = [0, 37, 999, 1999, 2000, 3999].map((index) => getIndependentLifeVariant(index));
for (const sample of samples) {
  assert.equal(new Set([
    sample.problemIndex,
    sample.gainIndex,
    sample.meaningIndex,
    sample.affirmationIndex,
    sample.resultIndex
  ]).size, 5, "the five blocks keep separate deterministic indices");
}

console.log(`✅ Broad independent pools: 5 × ${POOL_SIZE} unique texts across general life spheres`);
