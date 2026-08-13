import { getLevel, getSubtheme } from "./content.js";
import { FEELING_GUIDE_INTROS } from "./feeling-guide-intros.js";
import { FEELING_BODY_ANCHORS, FEELING_IMAGES } from "./feeling-guide-scenes.js";

export const FEELING_GUIDE_VARIANTS = 500;

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();

export function buildFeelingGuide(themeKey, levelKey, requestedVariant = null) {
  const theme = getSubtheme(themeKey);
  const level = getLevel(themeKey, levelKey);
  if (!theme || !level) return null;

  const index = Number.isInteger(requestedVariant)
    ? ((requestedVariant % 500) + 500) % 500
    : Math.floor(Math.random() * 500);
  const intro = FEELING_GUIDE_INTROS[Math.floor(index / 25)];
  const scene = index % 25;
  const anchor = FEELING_BODY_ANCHORS[Math.floor(scene / 5)];
  const image = FEELING_IMAGES[scene % 5];
  const levelName = cleanName(level.name) || level.articleTitle || "цей стан";
  const solution = `Я не маю вирішити все одразу. Я обираю один спокійний крок у темі «${levelName}».`;

  return {
    themeKey,
    levelKey,
    variantIndex: index,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    text: `💭 *Ти так це відчуваєш?*\n\n${intro} Давай пройдемо тему «${levelName}» не через довгі пояснення, а через кілька простих відчуттів.\n\n🔷 *Крок 1: Стан*\nЗверни увагу на ${anchor.notice}. ${image.state}\n\n🔷 *Крок 2: Дихання*\n${image.breath} Помічай навіть невелику різницю між напругою на початку й зараз.\n\n🔷 *Крок 3: Опора*\n${image.support} ${anchor.movement}.\n\n🔷 *Крок 4: Рух*\nНе потрібно робити великий ривок. Обери один невеликий рух, який реально можеш зробити після цього повідомлення.\n\n🔑 *Рішення*\n${solution}\n\n✨ *Результат*\n${anchor.release}. У тілі з’являється трохи більше простору для наступного кроку без зайвого поспіху.`
  };
}
