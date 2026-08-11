import { MAIN_BLOCK } from "./content.js";
import { FUTURE_BLOCKS } from "./future-blocks.js";

// Єдина точка реєстрації великих блоків бота.
// HabitTeen лишається основним повним блоком, а FUTURE_BLOCKS — робочі заготовки
// майбутніх тематичних сайтів із одним стартовим рівнем на кожен підблок.
export const BLOCKS = {
  [MAIN_BLOCK.key]: {
    ...MAIN_BLOCK,
    enabled: true,
    siteStatus: "live"
  },
  ...FUTURE_BLOCKS
};

// Додаткові резервні слоти лишаються прихованими до появи нових напрямів.
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
