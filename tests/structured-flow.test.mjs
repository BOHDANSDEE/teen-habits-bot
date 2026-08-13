import assert from "node:assert/strict";
import { MAIN_BLOCK } from "../src/content.js";
import { FUTURE_BLOCKS } from "../src/future-blocks.js";
import { buildGenericResult } from "../src/generic-result.js";
import {
  getLevelLifeMeaningPool,
  getLevelSecondaryGainPool,
  getProblemFact
} from "../src/level-context-pools.js";
import { resultKeyboard, starterResultKeyboard } from "../src/navigation-keyboards.js";
import { findLevelByArticleSlug, getAllLevelTargets } from "../src/navigation.js";
import { buildContinuation, buildResult } from "../src/renderer.js";

const PRIMARY = "state_action";
const themes = ["lazy", "apathy", "procrastination"];
const activeThemePools = ["states", "affirmations"];
const forbiddenVisible = [
  "📖 *Історія",
  "Коротке опитування",
  "Що може допомогти далі",
  "Що спробувати зараз",
  "*Афірмація*",
  "Хочу рішення про це"
];
const legacyPoolLanguage = [
  "Стан зараз виглядає так:",
  "Проблема тут у тому, що",
  "Вторинна вигода цього патерну —",
  "Значення цього досвіду в житті —",
  "У цьому рівні",
  "цей рівень",
  "людина"
];
const softDirectPatterns = [
  /Ти можеш/iu,
  /Тобі може/iu,
  /може бути/iu,
  /може проявлятися/iu,
  /може допомагати/iu,
  /(?<!\p{L})можливо(?!\p{L})/iu
];
const directPerson = /(ти|тобі|тебе|твоє|твій|твоя|твоєму|твоїх)/iu;

const cleanName = (name = "") => String(name).replace(/^\d+\s*·\s*/u, "").trim();
const sentenceCount = (text = "") => String(text).trim().split(/(?<=[.!?…])\s+/u).filter(Boolean).length;
const buttons = (keyboard) => keyboard.inline_keyboard.flat();

function sections(text) {
  const state = "🌿🧠 *Стан*\n";
  const problem = "🧩⚠️ *Проблема — ";
  const gain = "🪞🎁 *Вторинна вигода*\n";
  const meaning = "🌟🧭 *Значення в житті*\n";
  const solution = "🔑✨ *Рішення*\n";
  const read = "🔁 Прочитай це рішення ";
  const i1 = text.indexOf(state);
  const i2 = text.indexOf(problem);
  const i3 = text.indexOf(gain);
  const i4 = text.indexOf(meaning);
  const i5 = text.indexOf(solution);
  const i6 = text.indexOf(read);
  assert.equal(i1, 0);
  assert.ok(i2 > i1 && i3 > i2 && i4 > i3 && i5 > i4 && i6 > i5);
  const problemBody = text.indexOf("\n", i2) + 1;
  return {
    state: text.slice(i1 + state.length, i2).trim(),
    problem: text.slice(problemBody, i3).trim(),
    gain: text.slice(i3 + gain.length, i4).trim(),
    meaning: text.slice(i4 + meaning.length, i5).trim(),
    solution: text.slice(i5 + solution.length, i6).trim()
  };
}

function assertDirectPoolItem(poolName, item, label) {
  const lower = item.toLocaleLowerCase("uk-UA");
  for (const legacy of legacyPoolLanguage) {
    assert.ok(!lower.includes(legacy.toLocaleLowerCase("uk-UA")), `${label} leaked legacy language: ${legacy}`);
  }

  if (poolName !== "affirmations") {
    for (const pattern of softDirectPatterns) {
      assert.ok(!pattern.test(item), `${label} still uses soft direct language: ${pattern}`);
    }
  }

  if (poolName === "affirmations") {
    assert.match(item, /^(я|сьогодні я)/iu, `${label} must be first-person`);
    return;
  }

  assert.match(item, directPerson, `${label} must address the person directly`);
}

function assertContextPool(pool, label) {
  assert.equal(pool.length, 500, `${label} must contain 500 variants`);
  assert.equal(new Set(pool).size, 500, `${label} must contain 500 unique variants`);
  for (const item of pool) {
    assert.match(item, directPerson, `${label} must address the person directly`);
    for (const pattern of softDirectPatterns) {
      assert.ok(!pattern.test(item), `${label} must stay direct: ${pattern}`);
    }
  }
}

function assertResult(result, label, expectNext = true) {
  const value = sections(result.text);
  for (const [key, text] of Object.entries(value)) {
    assert.equal(sentenceCount(text), 3, `${label}.${key} must have 3 sentences`);
  }
  assert.match(value.state, directPerson, `${label}.state must address the person directly`);
  assert.match(value.gain, directPerson, `${label}.gain must address the person directly`);
  assert.match(value.meaning, directPerson, `${label}.meaning must address the person directly`);
  for (const section of [value.state, value.problem, value.gain, value.meaning]) {
    for (const pattern of softDirectPatterns) {
      assert.ok(!pattern.test(section), `${label} must use definite direct language: ${pattern}`);
    }
  }
  assert.ok(result.readCount >= 3 && result.readCount <= 9);
  assert.match(result.text, new RegExp(`Прочитай це рішення ${result.readCount} разів`, "u"));
  for (const item of forbiddenVisible) assert.ok(!result.text.includes(item), `${label}: ${item}`);
  if (expectNext) {
    assert.ok(result.next, `${label} needs next target`);
    assert.ok(result.text.includes("➡️ *Хочеш продовжити?* Наступний розбір допоможе тобі"), `${label} needs explicit next-step benefit`);
  }
  assert.ok(result.text.length < 4000);
}

assert.deepEqual(Object.keys(MAIN_BLOCK.subthemes), themes);
assert.equal(getAllLevelTargets().length, 60);

let themePoolItems = 0;
let contextualVariants = 0;
const articleSlugs = new Set();
for (const themeKey of themes) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  assert.equal(Object.keys(theme.levels).length, 15);

  for (const poolName of activeThemePools) {
    const pool = theme.pools[poolName];
    assert.equal(pool.length, 500);
    assert.equal(new Set(pool).size, 500);
    for (let index = 0; index < pool.length; index += 1) {
      assertDirectPoolItem(poolName, pool[index], `${themeKey}.${poolName}[${index}]`);
    }
    themePoolItems += 500;
  }

  for (const [levelKey, level] of Object.entries(theme.levels)) {
    articleSlugs.add(level.articleSlug);
    const target = findLevelByArticleSlug(level.articleSlug);
    assert.equal(target?.blockKey, PRIMARY);
    assert.equal(target?.themeKey, themeKey);
    assert.equal(target?.levelKey, levelKey);

    const fact = getProblemFact(themeKey, levelKey);
    assert.ok(fact, `${themeKey}.${levelKey} needs an objective problem fact`);
    assert.match(fact, directPerson, `${themeKey}.${levelKey} problem fact must address the person directly`);

    const gainPool = getLevelSecondaryGainPool(themeKey, levelKey);
    const lifePool = getLevelLifeMeaningPool(themeKey, levelKey);
    assertContextPool(gainPool, `${themeKey}.${levelKey}.secondaryGain`);
    assertContextPool(lifePool, `${themeKey}.${levelKey}.lifeMeaning`);
    contextualVariants += gainPool.length + lifePool.length;

    for (let i = 0; i < 8; i += 1) {
      const result = buildResult(themeKey, levelKey);
      assert.ok(result.text.includes(`🧩⚠️ *Проблема — ${cleanName(level.name)}*`));
      assert.ok(result.text.includes(fact), `${themeKey}.${levelKey} must render its exact factual problem statement`);
      assertResult(result, `${themeKey}.${levelKey}`);
      const keyboard = resultKeyboard(PRIMARY, themeKey, levelKey, 0, result.next);
      const nextButton = buttons(keyboard).find((button) => button.callback_data.startsWith("solution:"));
      assert.equal(nextButton?.text, "➡️ Продовжити");
      assert.ok(Buffer.byteLength(nextButton.callback_data, "utf8") <= 64);
      assert.ok(!buttons(keyboard).some((button) => button.text.includes("Хочу рішення")));
    }
    const continuation = buildContinuation(themeKey);
    assertResult(continuation, `${themeKey}.continuation`);
  }
}

const cleaningGain = getLevelSecondaryGainPool("lazy", "l6").join(" ");
const cleaningLife = getLevelLifeMeaningPool("lazy", "l6").join(" ");
assert.match(cleaningGain, /знайомому стані|передбачуваність|звичний порядок/iu, "cleaning gain must include stability/familiarity mechanism");
assert.match(cleaningLife, /кличеш людей|гост|соціального життя/iu, "cleaning life impact must include social-home consequences");
assert.match(cleaningLife, /пошук речей|побутові справи|власному просторі/iu, "cleaning life impact must include concrete home consequences");

let starters = 0;
for (const [blockKey, block] of Object.entries(FUTURE_BLOCKS)) {
  for (const [themeKey, theme] of Object.entries(block.subthemes)) {
    const [[levelKey, level]] = Object.entries(theme.levels);
    starters += 1;
    const result = buildGenericResult(blockKey, themeKey, levelKey);
    assert.ok(result.text.includes(`🧩⚠️ *Проблема — ${cleanName(level.name)}*`));
    assertResult(result, `${blockKey}.${themeKey}`, false);
    const keyboard = starterResultKeyboard(blockKey, themeKey, 0);
    for (const button of buttons(keyboard)) assert.ok(Buffer.byteLength(button.callback_data, "utf8") <= 64);
  }
}

assert.equal(articleSlugs.size, 45);
assert.equal(starters, 15);
assert.equal(themePoolItems, 3000);
assert.equal(contextualVariants, 45000);
console.log("✅ Context flow: 45 factual problems; 500 level-specific gains + 500 life impacts per problem; direct 3-sentence output");
