import { getBlock, getBlockSubtheme } from "./navigation.js";
import { buildGenericPools } from "./generic-500-pools.js";

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
const pick = (items = []) => items[Math.floor(Math.random() * items.length)] || "";
const readCount = () => 3 + Math.floor(Math.random() * 7);

export function buildGenericResult(blockKey, themeKey, levelKey) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const level = theme?.levels?.[levelKey];
  if (!block || !theme || !level) return null;

  const pools = buildGenericPools(level);
  const state = pick(pools.states);
  const problem = pick(pools.problems);
  const gain = pick(pools.gains);
  const meaning = pick(pools.meanings);
  const solution = pick(pools.solutions);
  const afterState = pick(pools.results);
  const count = readCount();
  const problemName = cleanName(level.name) || level.articleTitle;

  return {
    blockKey,
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    readCount: count,
    afterState,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${gain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${count} разів.\n\n✨ *Результат*\n${afterState}`
  };
}
