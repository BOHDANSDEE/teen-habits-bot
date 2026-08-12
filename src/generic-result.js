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
    text: `🌿🧠 *Стан*\n${level.state}\n\n🧩⚠️ *Що заважає*\n${level.problem}\n\n🪞🎁 *Що тримає цей сценарій*\n${level.secondaryGain}\n\n🌟🧭 *Навіщо це змінювати*\n${level.meaning}\n\n🚀✅ *Що зробити зараз*\n${formatActions(level.actions)}\n\n🔑✨ *Рішення*\n${level.affirmation}\n\n🕯️ Не просто перечитай рішення. Обери з нього одну думку, яку підтвердиш конкретною дією сьогодні.${note}\n\n🧭 *Тема цього рішення*\n${level.articleTitle}\n\n${level.summary}`
  };
}
