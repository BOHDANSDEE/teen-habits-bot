import { getLevel, getRandomLevelKey, getRandomRelatedTheme, getSubtheme, pickRandom } from "./content.js";
import { getLevelLifeMeaningPool, getLevelSecondaryGainPool, getProblemFact } from "./level-context-pools.js";
import { LAZY_AFTER_STATES } from "./after-state-lazy.js";
import { APATHY_AFTER_STATES } from "./after-state-apathy.js";
import { PROCRASTINATION_AFTER_STATES } from "./after-state-procrastination.js";

const REFERRAL = /фахів|лікар|професійн\w*\s+оцінк|медичн\w*\s+оцінк/iu;
const AFTER = {
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
const pickSafe = (pool = [], fallback = "") => {
  const safe = pool.filter((item) => !REFERRAL.test(String(item || "")));
  return sentence(pickRandom(safe) || fallback);
};

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

function readCount() {
  return 3 + Math.floor(Math.random() * 7);
}

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const pools = theme.pools || {};
  const state = pickSafe(pools.states, "Ти відчуваєш втому, напругу або опір перед дією.");
  const fact = getProblemFact(themeKey, levelKey);
  const problem = fact && !REFERRAL.test(fact)
    ? sentence(fact)
    : `Тобі заважає конкретний сценарій: ${cleanName(level.name)}.`;
  const gain = pickSafe(
    getLevelSecondaryGainPool(themeKey, levelKey),
    "Ти отримуєш коротке полегшення, бо зміни не потрібні прямо зараз."
  );
  const meaning = pickSafe(
    getLevelLifeMeaningPool(themeKey, levelKey),
    "У житті це повторюється у твоїх рішеннях і забирає частину уваги."
  );
  const solution = pickSafe(pools.affirmations, "Я обираю один конкретний крок і роблю його зараз.");
  const afterState = pickSafe(AFTER[themeKey], "Ти відчуваєш більше ясності й менше напруги щодо наступного кроку.");
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
    afterState,
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
