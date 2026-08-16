import assert from "node:assert/strict";
import {
  getIndependentLifeVariant,
  getLifeThemePoolIndices,
  INDEPENDENT_LIFE_POOLS,
  LIFE_RANDOM_THEMES,
  LIFE_THEME_COUNT,
  LIFE_THEME_POOL_SIZE,
  POOL_SIZE
} from "../src/independent-life-pools.js";

const SECTIONS = Object.freeze([
  ["problems", "problemIndex"],
  ["gains", "gainIndex"],
  ["meanings", "meaningIndex"],
  ["affirmations", "affirmationIndex"],
  ["results", "resultIndex"]
]);

const MEANING_AREA = Object.freeze({
  friends: /У дружбі/u,
  family: /У сім[’']ї/u,
  study: /У навчанні/u,
  money: /У грошах/u,
  health: /У здоров[’']ї/u,
  sleep: /У сні/u,
  household: /У побуті/u,
  "self-esteem": /У самооцінці/u,
  future: /У майбутньому/u,
  rest: /У відпочинку/u,
  "social-media": /У соцмережах/u,
  work: /У роботі/u,
  sport: /У спорті/u,
  boundaries: /У особистих межах/u,
  communication: /У спілкуванні/u,
  decisions: /У рішеннях/u,
  goals: /У цілях/u,
  emotions: /В емоціях/u,
  responsibility: /У відповідальності/u,
  development: /У особистому розвитку/u
});

assert.equal(POOL_SIZE, 4000);
assert.equal(LIFE_THEME_COUNT, 20);
assert.equal(LIFE_THEME_POOL_SIZE, 200);
assert.equal(LIFE_RANDOM_THEMES.length, 20);

for (const [section] of SECTIONS) {
  const allThemeIndices = [];

  for (const theme of LIFE_RANDOM_THEMES) {
    const indices = getLifeThemePoolIndices(theme.key, section);
    assert.equal(indices.length, LIFE_THEME_POOL_SIZE, `${theme.key}/${section}: 200 texts`);
    assert.equal(new Set(indices).size, LIFE_THEME_POOL_SIZE, `${theme.key}/${section}: no duplicates`);
    assert.ok(indices.every((index) => index >= 0 && index < POOL_SIZE));
    allThemeIndices.push(...indices);

    if (section === "meanings") {
      for (const index of indices) {
        assert.match(
          INDEPENDENT_LIFE_POOLS.meanings[index],
          MEANING_AREA[theme.key],
          `${theme.key}: Meaning must stay inside its visible life area`
        );
      }
    }
  }

  assert.equal(allThemeIndices.length, POOL_SIZE, `${section}: all 4000 texts assigned`);
  assert.equal(new Set(allThemeIndices).size, POOL_SIZE, `${section}: themes partition the pool without overlap`);
}

const themeCounts = new Map(LIFE_RANDOM_THEMES.map((theme) => [theme.key, 0]));
const themeIndexSets = Object.fromEntries(
  LIFE_RANDOM_THEMES.map((theme) => [
    theme.key,
    Object.fromEntries(SECTIONS.map(([section]) => [section, new Set(getLifeThemePoolIndices(theme.key, section))]))
  ])
);

for (let variantIndex = 0; variantIndex < POOL_SIZE; variantIndex += 1) {
  const variant = getIndependentLifeVariant(variantIndex);
  const expectedTheme = LIFE_RANDOM_THEMES[variantIndex % LIFE_THEME_COUNT];
  assert.equal(variant.themeKey, expectedTheme.key);
  assert.equal(variant.themeName, expectedTheme.name);
  themeCounts.set(variant.themeKey, themeCounts.get(variant.themeKey) + 1);

  for (const [section, indexField] of SECTIONS) {
    assert.ok(
      themeIndexSets[variant.themeKey][section].has(variant[indexField]),
      `${variantIndex}: ${indexField} escaped theme ${variant.themeKey}`
    );
  }
}

for (const [themeKey, count] of themeCounts) {
  assert.equal(count, LIFE_THEME_POOL_SIZE, `${themeKey}: deterministic mode must cover 200 cards`);
}

const originalRandom = Math.random;
const sequence = [0.31, 0.01, 0.21, 0.41, 0.61, 0.81];
let calls = 0;
try {
  Math.random = () => sequence[calls++];
  const variant = getIndependentLifeVariant();
  assert.equal(calls, 6, "production mode chooses one theme, then five section slots");

  const expectedTheme = LIFE_RANDOM_THEMES[Math.floor(sequence[0] * LIFE_THEME_COUNT)];
  assert.equal(variant.themeKey, expectedTheme.key);

  for (let i = 0; i < SECTIONS.length; i += 1) {
    const [section, indexField] = SECTIONS[i];
    const themedIndices = getLifeThemePoolIndices(expectedTheme.key, section);
    const expectedIndex = themedIndices[Math.floor(sequence[i + 1] * LIFE_THEME_POOL_SIZE)];
    assert.equal(variant[indexField], expectedIndex, `${section}: random slot must stay inside selected theme`);
  }
} finally {
  Math.random = originalRandom;
}

console.log("✅ Theme coherence: one of 20 themes is chosen first; all five random sections stay inside it");
