import { getBlock, getBlockSubtheme } from "./navigation.js";
import { getIndependentLifeVariant, POOL_SIZE } from "./independent-life-pools.js";
import { cleanLevelName } from "./level-output-pools.js";

const readCount = () => 3 + Math.floor(Math.random() * 7);

function normalizeVariant(requestedVariant) {
  return Number.isInteger(requestedVariant)
    ? ((requestedVariant % POOL_SIZE) + POOL_SIZE) % POOL_SIZE
    : Math.floor(Math.random() * POOL_SIZE);
}

export function buildGenericResult(blockKey, themeKey, levelKey, requestedVariant = null) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const level = theme?.levels?.[levelKey];
  if (!block || !theme || !level) return null;

  const index = normalizeVariant(requestedVariant);
  const variant = getIndependentLifeVariant(Number.isInteger(requestedVariant) ? index : null);
  const count = readCount();
  const problemName = cleanLevelName(level.name || level.articleTitle);

  return {
    blockKey,
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
    readCount: count,
    resultText: variant.result,
    text: `📖 *Інструкція:* Прочитай текст повільно від початку до кінця.\n\n🔎 *Проблема: ${problemName}*\n\n🔹 *Проблема*\n${variant.problem}\n\n🪞 *Вторинна вигода*\n${variant.gain}\n\n🌟 *Значення в житті*\n${variant.meaning}\n\n🔑 *Афірмація*\n${variant.affirmation}\n\n🔁 Повтори афірмацію ${count} разів.\n\n✨ *Результат*\n${variant.result}`
  };
}
