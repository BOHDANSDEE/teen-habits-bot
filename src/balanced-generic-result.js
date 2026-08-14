import { getBlock, getBlockSubtheme } from "./navigation.js";
import { buildGenericPools } from "./generic-500-pools.js";

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
const pick = (items = []) => items[Math.floor(Math.random() * items.length)] || "";
const readCount = () => 3 + Math.floor(Math.random() * 7);
const bodyVariantIndex = () => Math.floor(Math.random() * 500);

export function buildGenericResult(blockKey, themeKey, levelKey) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const level = theme?.levels?.[levelKey];
  if (!block || !theme || !level) return null;

  const pools = buildGenericPools(level);
  const bodyIndex = bodyVariantIndex();
  const state = pools.states[bodyIndex] || pools.states[0] || "";
  const problem = pick(pools.problems);
  const gain = pick(pools.gains);
  const meaning = pick(pools.meanings);
  const solution = pick(pools.solutions);
  const afterState = pools.results[bodyIndex] || pools.results[0] || "";
  const count = readCount();
  const problemName = cleanName(level.name) || level.articleTitle;

  return {
    blockKey,
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    readCount: count,
    bodyVariantIndex: bodyIndex,
    afterState,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${gain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${count} разів.\n\n✨ *Тепер ти відчуваєш*\n${afterState}`
  };
}
