import { getBlock, getBlockSubtheme } from "./navigation.js";
import { buildGenericPools } from "./generic-500-pools.js";
import { cleanLevelName } from "./level-output-pools.js";

const POOL_SIZE = 500;
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

  const pools = buildGenericPools(level);
  const index = normalizeVariant(requestedVariant);
  const problem = pools.problems[index] || pools.problems[0] || "";
  const gain = pools.gains[index] || pools.gains[0] || "";
  const meaning = pools.meanings[index] || pools.meanings[0] || "";
  const affirmation = pools.affirmations[index] || pools.affirmations[0] || "";
  const resultText = pools.results[index] || pools.results[0] || "";
  const count = readCount();
  const problemName = cleanLevelName(level.name || level.articleTitle);

  return {
    blockKey,
    themeKey,
    levelKey,
    variantIndex: index,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    readCount: count,
    resultText,
    text: `📖 *Інструкція:* Прочитай текст повільно від початку до кінця.\n\n🔎 *Проблема: ${problemName}*\n\n🔹 *Проблема*\n${problem}\n\n🪞 *Вторинна вигода*\n${gain}\n\n🌟 *Значення в житті*\n${meaning}\n\n🔑 *Афірмація*\n${affirmation}\n\n🔁 Повтори афірмацію ${count} разів.\n\n✨ *Результат*\n${resultText}`
  };
}
