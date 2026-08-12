import { getBlock, getBlockSubtheme } from "./navigation.js";

const formatActions = (actions = []) =>
  actions
    .slice(0, 3)
    .map((action, index) => `${["1️⃣", "2️⃣", "3️⃣"][index]} ${action}`)
    .join("\n");

export function buildGenericResult(blockKey, themeKey, levelKey) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const level = theme?.levels?.[levelKey];
  if (!block || !theme || !level) return null;

  const note = level.note ? `\n\n🛟 *Важлива межа*\n${level.note}` : "";

  return {
    blockKey,
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    text: `🪞 *Ти відчуваєш це так*\nТи відчуваєш, що ${level.state}\n\nТобі найбільше заважає те, що ${level.problem}\n\nСтарий сценарій тримається, бо він допомагає ${level.secondaryGain}\n\nЗмінювати його варто, щоб ${level.meaning}\n\n🎯 У цій темі фокус такий: ${level.summary}\n\n🚀✅ *Що спробувати зараз*\n${formatActions(level.actions)}${note}\n\n🔑✨ *Рішення*\n${level.affirmation}\n\n_Скажи це своїми словами й підтверди одним маленьким кроком сьогодні._`
  };
}
