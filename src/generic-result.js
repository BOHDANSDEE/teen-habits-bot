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
    text: `🧭✨ *${block.name}*\n${theme.name}\n\n🎯✨ *${level.articleTitle}*\n\n🧭 ${level.summary}\n\n🌿🧠 *Стан*\n${level.state}\n\n🧩⚠️ *Проблема*\n${level.problem}\n\n🪞🎁 *Вторинна вигода*\n${level.secondaryGain}\n\n🌟🧭 *Значення в житті*\n${level.meaning}\n\n🚀✅ *Що зробити зараз*\n${formatActions(level.actions)}\n\n🔑✨ *Афірмація*\n${level.affirmation}${note}\n\n🌱 Це стартовий рівень майбутнього тематичного блоку. Коли для напряму буде окремий сайт, цей рівень можна напряму зв’язати зі статтею через той самий articleSlug.`
  };
}
