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

function pickRandomEntry(entries = []) {
  if (!entries.length) return null;
  return entries[Math.floor(Math.random() * entries.length)] || null;
}

function getRecommendableBlocks() {
  return getActiveBlocks()
    .map((block) => {
      const themes = Object.entries(block.subthemes || {}).filter(
        ([, theme]) => Object.keys(theme?.levels || {}).length > 0
      );
      return themes.length ? { block, themes } : null;
    })
    .filter(Boolean);
}

// Підказка тепер працює поетапно. Кожен виклик обирає лише ОДИН наступний крок,
// щоб людина бачила рекомендацію, але зберігала право обрати інший варіант.
export function getRandomBlockHint() {
  const choice = pickRandomEntry(getRecommendableBlocks());
  if (!choice) return null;
  return {
    blockKey: choice.block.key,
    block: choice.block
  };
}

export function getRandomThemeHint(blockKey) {
  const block = getBlock(blockKey);
  if (!block || block.enabled === false) return null;

  const themes = Object.entries(block.subthemes || {}).filter(
    ([, theme]) => Object.keys(theme?.levels || {}).length > 0
  );
  const [themeKey, theme] = pickRandomEntry(themes) || [];
  if (!themeKey || !theme) return null;

  return {
    blockKey: block.key,
    block,
    themeKey,
    theme
  };
}

export function getRandomLevelHint(blockKey, themeKey) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  if (!block || !theme) return null;

  const [levelKey, level] = pickRandomEntry(Object.entries(theme.levels || {})) || [];
  if (!levelKey || !level) return null;

  return {
    blockKey: block.key,
    block,
    themeKey,
    theme,
    levelKey,
    level
  };
}

// Залишаємо стару функцію як сумісний utility, але інтерфейс бота більше
// не використовує її для стрибка одразу у фінальний результат.
export function getRandomRecommendation() {
  const blockHint = getRandomBlockHint();
  if (!blockHint) return null;
  const themeHint = getRandomThemeHint(blockHint.blockKey);
  if (!themeHint) return null;
  return getRandomLevelHint(blockHint.blockKey, themeHint.themeKey);
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
