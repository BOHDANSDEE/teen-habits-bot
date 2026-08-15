import { getLevel, getRandomLevelKey, getRandomRelatedTheme, getSubtheme } from "./content.js";
import { getIndependentLifeVariant, POOL_SIZE } from "./independent-life-pools.js";
import { buildNextPreview, cleanLevelName } from "./level-output-pools.js";

function normalizeVariant(requestedVariant) {
  return Number.isInteger(requestedVariant)
    ? ((requestedVariant % POOL_SIZE) + POOL_SIZE) % POOL_SIZE
    : Math.floor(Math.random() * POOL_SIZE);
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
  const variant = getIndependentLifeVariant(Number.isInteger(requestedVariant) ? index : null);
  const problemName = cleanLevelName(level.name || level.articleTitle);
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
    independentIndices: {
      problem: variant.problemIndex,
      gain: variant.gainIndex,
      meaning: variant.meaningIndex,
      affirmation: variant.affirmationIndex,
      result: variant.resultIndex
    },
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    next,
    readCount: count,
    resultText: variant.result,
    text: `📖 *Інструкція:* Прочитай текст повільно від початку до кінця.\n\n🔎 *Проблема: ${problemName}*\n\n🔹 *Проблема*\n${variant.problem}\n\n🪞 *Вторинна вигода*\n${variant.gain}\n\n🌟 *Значення в житті*\n${variant.meaning}\n\n🔑 *Афірмація*\n${variant.affirmation}\n\n🔁 Повтори афірмацію ${count} разів.\n\n✨ *Результат*\n${variant.result}${nextBlock}`
  };
}

export function buildContinuation(previousThemeKey, targetThemeKey = null, targetLevelKey = null) {
  const requestedTheme = targetThemeKey ? getSubtheme(targetThemeKey) : null;
  const requestedLevel = requestedTheme && targetLevelKey ? getLevel(targetThemeKey, targetLevelKey) : null;
  const themeKey = requestedTheme && requestedLevel ? targetThemeKey : getRandomRelatedTheme(previousThemeKey);
  const levelKey = requestedTheme && requestedLevel ? targetLevelKey : getRandomLevelKey(themeKey);
  return buildResult(themeKey, levelKey);
}
