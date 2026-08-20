import assert from "node:assert/strict";
import {
  getLifeSubtopicPoolIndices,
  INDEPENDENT_LIFE_POOLS,
  LIFE_RANDOM_THEMES,
  LIFE_SUBTOPIC_POOL_SIZE
} from "../src/independent-life-pools.js";

const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];
const sentenceCount = (text) => splitSentences(text).length;
const OLD_SLEEP_COPY = /ритуал|сигналом,?\s+що день закінчується|повторюваних дій/iu;
const EMPTY_GAIN = /користь є (?:одразу|зараз)|міняти не хочеться|зміна — потім/iu;
const SLEEP_CONTEXT = /сон|сну|спати|лягати|засин|вечір|день|відпочин/iu;

const sleep = LIFE_RANDOM_THEMES.find((theme) => theme.key === "sleep");
assert.ok(sleep, "sleep theme exists");
const routine = sleep.subtopics.find((subtopic) => subtopic.key === "routine");
assert.ok(routine, "sleep/routine subtopic exists");
assert.equal(routine.name, "Підготовка до сну");
assert.doesNotMatch(routine.name, OLD_SLEEP_COPY);

const sections = Object.fromEntries(["problems", "gains", "meanings", "affirmations"].map((section) => {
  const indices = getLifeSubtopicPoolIndices("sleep", "routine", section);
  assert.equal(indices.length, LIFE_SUBTOPIC_POOL_SIZE);
  const texts = indices.map((index) => INDEPENDENT_LIFE_POOLS[section][index]);
  assert.equal(new Set(texts).size, LIFE_SUBTOPIC_POOL_SIZE, `${section}: 20 unique sleep/routine texts`);
  assert.ok(texts.every((text) => !OLD_SLEEP_COPY.test(text)), `${section}: no ritual/signal jargon`);
  return [section, texts];
}));

assert.ok(sections.problems.slice(0, 10).every((text) => sentenceCount(text) === 2));
assert.ok(sections.problems.slice(10).every((text) => sentenceCount(text) === 3));
for (const text of sections.problems) {
  const parts = splitSentences(text).map((part) => part.trim());
  assert.match(parts[1], /^Через це /u);
  assert.match(text, SLEEP_CONTEXT);
}

for (const text of sections.gains) {
  const parts = splitSentences(text).map((part) => part.trim());
  assert.equal(parts.length, 2);
  assert.match(parts[0], /^У такому способі дії ти /u);
  assert.match(parts[1], /^Тому тобі вигідно залишатися у такому способі дій — /u);
  assert.doesNotMatch(text, EMPTY_GAIN);
  assert.ok(parts[1].split("—")[1]?.trim().length >= 18, `Gain must explain why: ${text}`);
}

assert.ok(sections.meanings.slice(0, 10).every((text) => sentenceCount(text) === 1));
assert.ok(sections.meanings.slice(10).every((text) => sentenceCount(text) === 2));
assert.ok(sections.meanings.every((text) => SLEEP_CONTEXT.test(text)));

for (const text of sections.affirmations) {
  const parts = splitSentences(text).map((part) => part.trim());
  assert.equal(parts.length, 2);
  assert.ok(parts.every((part) => /^Я\s/u.test(part)));
  assert.doesNotMatch(text, /Я (?:можу|обираю|маю право)\b/iu);
  assert.match(text, /сн|вечір|справ|завтра/iu);
}

console.log("✅ Sleep routine: plain preparation-to-sleep copy replaces ritual/signal wording in all four blocks");
