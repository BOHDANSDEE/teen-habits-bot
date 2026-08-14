import { getLevel, getRandomLevelKey, getRandomRelatedTheme, getSubtheme } from "./content.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool } from "./level-context-pools.js";
import { BODY_STATE_POOLS } from "./body-state-pools.js";
import { getLevelProblemPool } from "./problem-pools.js";
import { LAZY_AFTER_STATES } from "./after-state-lazy.js";
import { APATHY_AFTER_STATES } from "./after-state-apathy.js";
import { PROCRASTINATION_AFTER_STATES } from "./after-state-procrastination.js";
import { buildPlainSecondaryGain } from "./plain-secondary-gain.js";

const POOL_SIZE = 500;
const AFTER_STATE_POOLS = {
  lazy: LAZY_AFTER_STATES,
  apathy: APATHY_AFTER_STATES,
  procrastination: PROCRASTINATION_AFTER_STATES
};

const sentence = (text = "") => {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
};

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();

function normalizeVariant(requestedVariant) {
  return Number.isInteger(requestedVariant)
    ? ((requestedVariant % POOL_SIZE) + POOL_SIZE) % POOL_SIZE
    : Math.floor(Math.random() * POOL_SIZE);
}

function takeVisible(pool = [], index, fallback = "") {
  return sentence(pool[index] || fallback);
}

function nextTarget(themeKey) {
  const nextThemeKey = getRandomRelatedTheme(themeKey);
  const nextLevelKey = getRandomLevelKey(nextThemeKey);
  const theme = getSubtheme(nextThemeKey);
  const level = getLevel(nextThemeKey, nextLevelKey);
  if (!theme || !level) return null;
  return {
    themeKey: nextThemeKey,
    levelKey: nextLevelKey,
    themeName: theme.name,
    articleTitle: level.articleTitle,
    summary: level.summary
  };
}

const readCount = () => 3 + Math.floor(Math.random() * 7);

export function buildResult(themeKey, levelKey, requestedVariant = null) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const index = normalizeVariant(requestedVariant);
  const state = takeVisible(
    BODY_STATE_POOLS[themeKey] || [],
    index,
    "Ти відчуваєш напругу або важкість у тілі перед потрібною дією."
  );
  const problem = takeVisible(
    getLevelProblemPool(themeKey, levelKey),
    index,
    `У тебе це проявляється так: ${cleanName(level.name)}. Через це потрібний крок знову відкладається.`
  );
  const gainRaw = takeVisible(
    getLevelSecondaryGainPool(themeKey, levelKey),
    index,
    "На короткий час тобі стає легше, бо не треба починати прямо зараз."
  );
  const gain = buildPlainSecondaryGain(gainRaw);
  const meaning = takeVisible(
    getLevelLifeMeaningPool(themeKey, levelKey),
    index,
    "У житті це повторюється у твоїх рішеннях і забирає частину уваги."
  );
  const solution = takeVisible(
    theme.pools?.affirmations || [],
    index,
    "Я дозволяю собі не вирішувати все одразу. Я обираю один спокійний крок."
  );
  const afterState = takeVisible(
    AFTER_STATE_POOLS[themeKey] || [],
    index,
    "Тепер ти відчуваєш, що тіло стало трохи м’якшим, а наступний рух — простішим."
  );
  const count = readCount();
  const next = nextTarget(themeKey);
  const problemName = cleanName(level.name) || level.articleTitle;

  return {
    themeKey,
    levelKey,
    variantIndex: index,
    bodyVariantIndex: index,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    readCount: count,
    afterState,
    afterStates: [afterState],
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${gain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑 *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${count} разів.\n\n✨ *Тепер ти відчуваєш*\n${afterState}`
  };
}

export function buildContinuation(previousThemeKey, targetThemeKey = null, targetLevelKey = null) {
  const requestedTheme = targetThemeKey ? getSubtheme(targetThemeKey) : null;
  const requestedLevel = requestedTheme && targetLevelKey ? getLevel(targetThemeKey, targetLevelKey) : null;
  const themeKey = requestedTheme && requestedLevel ? targetThemeKey : getRandomRelatedTheme(previousThemeKey);
  const levelKey = requestedTheme && requestedLevel ? targetLevelKey : getRandomLevelKey(themeKey);
  return buildResult(themeKey, levelKey);
}
