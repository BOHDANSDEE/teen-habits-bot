import { getBlock, getBlockSubtheme } from "./navigation.js";
import { buildGenericPools } from "./generic-500-pools.js";

const POOL_SIZE = 500;
const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
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
  const state = pools.states[index] || pools.states[0] || "";
  const problem = pools.problems[index] || pools.problems[0] || "";
  const gain = pools.gains[index] || pools.gains[0] || "";
  const meaning = pools.meanings[index] || pools.meanings[0] || "";
  const solution = pools.solutions[index] || pools.solutions[0] || "";
  const afterState = pools.results[index] || pools.results[0] || "";
  const count = readCount();
  const problemName = cleanName(level.name) || level.articleTitle;

  return {
    blockKey,
    themeKey,
    levelKey,
    variantIndex: index,
    bodyVariantIndex: index,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    readCount: count,
    afterState,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${gain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑 *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${count} разів.\n\n✨ *Тепер ти відчуваєш*\n${afterState}`
  };
}
