import { getLevel, getRandomLevelKey, getRandomRelatedTheme, getSubtheme, pickRandom } from "./content.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool } from "./level-context-pools.js";
import { BODY_STATE_POOLS } from "./body-state-pools.js";
import { getLevelProblemPool } from "./problem-pools.js";
import { LAZY_AFTER_STATES } from "./after-state-lazy.js";
import { APATHY_AFTER_STATES } from "./after-state-apathy.js";
import { PROCRASTINATION_AFTER_STATES } from "./after-state-procrastination.js";
import { buildPlainSecondaryGain } from "./plain-secondary-gain.js";

const REFERRAL = /фахів|лікар|професійн\w*\s+оцінк|медичн\w*\s+оцінк/iu;

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

function pickSafe(pool = [], fallback = "") {
  const safe = pool.filter((item) => !REFERRAL.test(String(item || "")));
  return sentence(pickRandom(safe) || fallback);
}

function pickTwoSafe(pool = [], fallbacks = []) {
  const safe = [...new Set(pool.filter((item) => !REFERRAL.test(String(item || ""))).map(sentence).filter(Boolean))];
  const first = pickRandom(safe) || sentence(fallbacks[0] || "");
  const secondPool = safe.filter((item) => item !== first);
  const second = pickRandom(secondPool) || sentence(fallbacks[1] || fallbacks[0] || "");
  return [first, second].filter(Boolean);
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
const bodyVariantIndex = () => Math.floor(Math.random() * 500);

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const bodyPool = BODY_STATE_POOLS[themeKey] || [];
  const afterPool = AFTER_STATE_POOLS[themeKey] || [];
  const bodyIndex = bodyVariantIndex();
  const state = sentence(
    bodyPool[bodyIndex] ||
      "Ти відчуваєш напругу або важкість у тілі перед потрібною дією."
  );

  const problem = pickSafe(
    getLevelProblemPool(themeKey, levelKey),
    `У тебе це проявляється так: ${cleanName(level.name)}. Через це потрібний крок знову відкладається.`
  );

  const gainRaw = pickSafe(
    getLevelSecondaryGainPool(themeKey, levelKey),
    "не витрачати сили на зміни прямо зараз"
  );
  const gain = buildPlainSecondaryGain(gainRaw);

  const meaning = pickTwoSafe(getLevelLifeMeaningPool(themeKey, levelKey), [
    "У житті це повторюється у твоїх рішеннях і забирає частину уваги.",
    "З часом це впливає на твій звичний ритм і вибір."
  ]).join(" ");

  const solution = pickTwoSafe(theme.pools?.affirmations || [], [
    "Я обираю один конкретний крок і роблю його зараз.",
    "Сьогодні я підтверджую це рішення дією."
  ]).join(" ");

  const afterState = sentence(
    afterPool[bodyIndex] ||
      "Тепер ти відчуваєш, що тіло стало трохи м’якшим, а наступний рух — простішим."
  );
  const count = readCount();
  const next = nextTarget(themeKey);
  const problemName = cleanName(level.name) || level.articleTitle;

  return {
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    readCount: count,
    bodyVariantIndex: bodyIndex,
    afterState,
    afterStates: [afterState],
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${gain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${count} разів.\n\n✨ *Тепер ти відчуваєш*\n${afterState}`
  };
}

export function buildContinuation(previousThemeKey, targetThemeKey = null, targetLevelKey = null) {
  const requestedTheme = targetThemeKey ? getSubtheme(targetThemeKey) : null;
  const requestedLevel = requestedTheme && targetLevelKey ? getLevel(targetThemeKey, targetLevelKey) : null;
  const themeKey = requestedTheme && requestedLevel ? targetThemeKey : getRandomRelatedTheme(previousThemeKey);
  const levelKey = requestedTheme && requestedLevel ? targetLevelKey : getRandomLevelKey(themeKey);
  return buildResult(themeKey, levelKey);
}
