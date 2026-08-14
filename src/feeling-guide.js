import { getLevel, getSubtheme } from "./content.js";
import { FEELING_GUIDE_INTROS } from "./feeling-guide-intros.js";
import { FEELING_BODY_ANCHORS, FEELING_IMAGES } from "./feeling-guide-scenes.js";
import { POSITIVE_RESULT_DETAILS } from "./direct-body-copy.js";

export const FEELING_GUIDE_VARIANTS = 500;

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();

export function buildFeelingGuide(themeKey, levelKey, requestedVariant = null) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const index = Number.isInteger(requestedVariant)
    ? ((requestedVariant % FEELING_GUIDE_VARIANTS) + FEELING_GUIDE_VARIANTS) % FEELING_GUIDE_VARIANTS
    : Math.floor(Math.random() * FEELING_GUIDE_VARIANTS);

  const intro = FEELING_GUIDE_INTROS[Math.floor(index / 25)] || FEELING_GUIDE_INTROS[0] || "";
  const scene = index % 25;
  const anchors = FEELING_BODY_ANCHORS[themeKey] || FEELING_BODY_ANCHORS.lazy;
  const anchor = anchors[Math.floor(scene / 5)];
  const detail = FEELING_IMAGES[scene % 5];
  const positiveResult = POSITIVE_RESULT_DETAILS[index % POSITIVE_RESULT_DETAILS.length];
  const levelName = cleanName(level.name) || level.articleTitle || "цей стан";
  const solution = `Я не маю вирішити все одразу. Я обираю один спокійний крок у темі «${levelName}».`;

  return {
    themeKey,
    levelKey,
    variantIndex: index,
    bodyAnchorIndex: Math.floor(scene / 5),
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    text: `💭 *Ти так це відчуваєш?*\n\n${anchor.start}\n\n${intro} Давай на кілька хвилин пройдемо тему «${levelName}» через конкретні відчуття в тілі.\n\n🔷 *Крок 1: Стан*\n${anchor.step1} ${detail.state}\n\n🔷 *Крок 2: Дихання*\n${anchor.breath} ${detail.breath}\n\n🔷 *Крок 3: Опора*\n${anchor.support} ${detail.support}\n\n🔷 *Крок 4: Рух*\n${anchor.move} ${detail.move}\n\n🔑 *Рішення*\n${solution}\n\n✨ *Тепер ти відчуваєш*\n${anchor.release} ${detail.result} ${positiveResult}`
  };
}
