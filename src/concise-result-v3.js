import { getLevel, getRandomLevelKey, getRandomRelatedTheme, getSubtheme } from "./content.js";
import { getLevelProblemPool } from "./problem-pools.js";
import { getDirectSecondaryGainPool } from "./plain-secondary-gain.js";
import { getDirectLifeMeaningPool } from "./life-meaning-pools.js";
import {
  buildLevelAffirmationPool,
  buildLevelResultPool,
  buildNextPreview,
  cleanLevelName
} from "./level-output-pools.js";

const POOL_SIZE = 500;

const sentence = (text = "") => {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
};

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
    summary: level.summary,
    level
  };
}

const readCount = () => 3 + Math.floor(Math.random() * 7);

export function buildResult(themeKey, levelKey, requestedVariant = null) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const index = normalizeVariant(requestedVariant);
  const problemName = cleanLevelName(level.name || level.articleTitle);
  const problem = takeVisible(
    getLevelProblemPool(themeKey, levelKey),
    index,
    `Ти регулярно стикаєшся з проблемою «${problemName}». Через це потрібна зміна відкладається.`
  );
  const gain = takeVisible(
    getDirectSecondaryGainPool(themeKey, levelKey),
    index,
    "Ця проблема дає тобі коротке відчуття полегшення й безпеки. Тому тобі вигідно залишити все як є прямо зараз."
  );
  const meaning = takeVisible(
    getDirectLifeMeaningPool(themeKey, levelKey),
    index,
    "Через цю проблему важливі справи отримують менше уваги."
  );
  const affirmation = takeVisible(
    buildLevelAffirmationPool(level),
    index,
    "Я можу змінювати цю проблему без тиску на себе. Я обираю один конкретний крок."
  );
  const resultText = takeVisible(
    buildLevelResultPool(level),
    index,
    `Тепер тобі легше працювати з проблемою «${problemName}». Ти бачиш наступний крок чіткіше.`
  );
  const count = readCount();
  const nextWithLevel = nextTarget(themeKey);
  const nextPreview = nextWithLevel ? buildNextPreview(nextWithLevel.level, index) : null;
  const next = nextWithLevel
    ? {
        themeKey: nextWithLevel.themeKey,
        levelKey: nextWithLevel.levelKey,
        themeName: nextWithLevel.themeName,
        articleTitle: nextWithLevel.articleTitle,
        summary: nextWithLevel.summary
      }
    : null;
  const nextBlock = nextPreview ? `\n\n${nextPreview.title}\n${nextPreview.text}` : "";

  return {
    themeKey,
    levelKey,
    variantIndex: index,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    readCount: count,
    resultText,
    text: `📖 *Інструкція:* Прочитай текст повільно від початку до кінця.\n\n🔎 *Проблема: ${problemName}*\n\n🔹 *Проблема*\n${problem}\n\n🪞 *Вторинна вигода*\n${gain}\n\n🌟 *Значення в житті*\n${meaning}\n\n🔑 *Афірмація*\n${affirmation}\n\n🔁 Повтори афірмацію ${count} разів.\n\n✨ *Результат*\n${resultText}${nextBlock}`
  };
}

export function buildContinuation(previousThemeKey, targetThemeKey = null, targetLevelKey = null) {
  const requestedTheme = targetThemeKey ? getSubtheme(targetThemeKey) : null;
  const requestedLevel = requestedTheme && targetLevelKey ? getLevel(targetThemeKey, targetLevelKey) : null;
  const themeKey = requestedTheme && requestedLevel ? targetThemeKey : getRandomRelatedTheme(previousThemeKey);
  const levelKey = requestedTheme && requestedLevel ? targetLevelKey : getRandomLevelKey(themeKey);
  return buildResult(themeKey, levelKey);
}
