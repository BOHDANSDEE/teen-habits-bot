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

const firstSentence = (text = "") => {
  const value = String(text || "").trim();
  const first = value.split(/(?<=[.!?…])\s+/u).filter(Boolean)[0] || value;
  return sentence(first);
};

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
const pickSafe = (pool = [], fallback = "") => {
  const safe = pool.filter((item) => !REFERRAL.test(String(item || "")));
  return sentence(pickRandom(safe) || fallback);
};

function pickTwoSafe(pool = [], fallbacks = []) {
  const safe = [...new Set(pool.filter((item) => !REFERRAL.test(String(item || ""))).map(sentence).filter(Boolean))];
  const first = pickRandom(safe) || sentence(fallbacks[0] || "");
  const secondPool = safe.filter((item) => item !== first);
  const second = pickRandom(secondPool) || sentence(fallbacks[1] || fallbacks[0] || "");
  return [first, second].filter(Boolean);
}

function cleanFocus(text = "") {
  const value = firstSentence(text)
    .replace(/^Фокус\s*[—:-]\s*/u, "")
    .replace(/^У цьому розборі\s+/iu, "")
    .trim();
  return REFERRAL.test(value) ? "" : value;
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

function readCount() {
  return 3 + Math.floor(Math.random() * 7);
}

export function buildResult(themeKey, levelKey) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const pools = theme.pools || {};
  const stateParts = pickTwoSafe(pools.states, [
    "Ти відчуваєш втому, напругу або опір перед дією.",
    "Найсильніше це помітно саме перед першим кроком."
  ]);
  const state = stateParts.join(" ");

  const fact = getProblemFact(themeKey, levelKey);
  const problemFirst = fact && !REFERRAL.test(fact)
    ? sentence(fact)
    : `Тобі заважає конкретний сценарій: ${cleanName(level.name)}.`;
  const focus = cleanFocus(level.summary);
  const problemSecond = focus
    ? sentence(`Тут головне — ${focus.charAt(0).toLocaleLowerCase("uk-UA")}${focus.slice(1).replace(/[.!?…]+$/u, "")}`)
    : "Через це той самий сценарій повторюється знову.";
  const problem = `${problemFirst} ${problemSecond}`;

  const gainParts = pickTwoSafe(getLevelSecondaryGainPool(themeKey, levelKey), [
    "Ти отримуєш коротке полегшення, бо зміни не потрібні прямо зараз.",
    "Саме це коротке полегшення й утримує старий сценарій."
  ]);
  const gain = gainParts.join(" ");

  const meaningParts = pickTwoSafe(getLevelLifeMeaningPool(themeKey, levelKey), [
    "У житті це повторюється у твоїх рішеннях і забирає частину уваги.",
    "З часом це впливає на твій звичний ритм і вибір."
  ]);
  const meaning = meaningParts.join(" ");

  const solutionParts = pickTwoSafe(pools.affirmations, [
    "Я обираю один конкретний крок і роблю його зараз.",
    "Сьогодні я підтверджую це рішення дією."
  ]);
  const solution = solutionParts.join(" ");

  const afterStates = pickTwoSafe(AFTER[themeKey], [
    "Ти відчуваєш більше ясності й менше напруги щодо наступного кроку.",
    "Ти відчуваєш, що дія стала простішою й конкретнішою."
  ]);
  const afterState = afterStates.join(" ");

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
    afterStates,
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
