import { MAIN_BLOCK } from "./content.js";

// Єдина точка реєстрації великих блоків бота.
// Нові сайти/напрями додаються сюди як окремі блоки без переписування навігації.
export const BLOCKS = {
  [MAIN_BLOCK.key]: {
    ...MAIN_BLOCK,
    enabled: true
  }
};

// Резервні слоти — це закладки в архітектурі, а не видимі кнопки.
// Коли будуть обрані теми майбутніх сайтів, слот перетворюється на реальний BLOCKS-елемент.
export const RESERVED_BLOCK_SLOTS = Object.freeze(
  Array.from({ length: 8 }, (_, index) => ({
    key: `future_${index + 1}`,
    enabled: false,
    name: null,
    description: null,
    subthemes: {}
  }))
);

export function getBlock(blockKey) {
  return BLOCKS[blockKey] || null;
}

export function getActiveBlocks() {
  return Object.values(BLOCKS).filter((block) => block.enabled !== false && block.name);
}

export function getBlockSubtheme(blockKey, themeKey) {
  return getBlock(blockKey)?.subthemes?.[themeKey] || null;
}

export function getAllLevelTargets() {
  const targets = [];

  for (const block of getActiveBlocks()) {
    for (const [themeKey, theme] of Object.entries(block.subthemes || {})) {
      for (const [levelKey, level] of Object.entries(theme.levels || {})) {
        targets.push({
          blockKey: block.key,
          block,
          themeKey,
          theme,
          levelKey,
          level
        });
      }
    }
  }

  return targets;
}

export function getRandomRecommendation() {
  const targets = getAllLevelTargets();
  if (!targets.length) return null;
  return targets[Math.floor(Math.random() * targets.length)];
}

export function findLevelByArticleSlug(articleSlug) {
  const normalized = String(articleSlug || "").trim().toLowerCase();
  if (!normalized) return null;

  return (
    getAllLevelTargets().find(
      (target) => String(target.level?.articleSlug || "").toLowerCase() === normalized
    ) || null
  );
}
