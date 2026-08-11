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

function cleanHintLabel(text) {
  return String(text || "")
    .replace(/[✨⭐🌟]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
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

// Підказка обирається ієрархічно, а не з плоского списку всіх рівнів:
// 1) випадковий активний блок;
// 2) випадковий підблок у ньому;
// 3) випадковий рівень у підблоці.
// Так великі блоки з десятками рівнів не витісняють маленькі нові напрями.
export function getRandomRecommendation() {
  const blockChoice = pickRandomEntry(getRecommendableBlocks());
  if (!blockChoice) return null;

  const [themeKey, theme] = pickRandomEntry(blockChoice.themes) || [];
  if (!themeKey || !theme) return null;

  const [levelKey, level] = pickRandomEntry(Object.entries(theme.levels || {})) || [];
  if (!levelKey || !level) return null;

  const block = blockChoice.block;

  return {
    blockKey: block.key,
    block: {
      ...block,
      name: `💡 Підказка\n🧩 Блок: ${cleanHintLabel(block.name)}`
    },
    themeKey,
    theme: {
      ...theme,
      name: `📂 Підблок: ${cleanHintLabel(theme.name)}`
    },
    levelKey,
    level
  };
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
