import { MAIN_BLOCK } from "./content.js";
import { FUTURE_BLOCKS } from "./future-blocks.js";
import { getRandomHint } from "./hint-pool.js";

export const BLOCKS = {
  [MAIN_BLOCK.key]: {
    ...MAIN_BLOCK,
    enabled: true,
    siteStatus: "live"
  },
  ...FUTURE_BLOCKS
};

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
        targets.push({ blockKey: block.key, block, themeKey, theme, levelKey, level });
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
  return getActiveBlocks().filter((block) =>
    Object.values(block.subthemes || {}).some(
      (theme) => Object.keys(theme?.levels || {}).length > 0
    )
  );
}

export function getRandomRecommendation() {
  const block = pickRandomEntry(getRecommendableBlocks());
  if (!block) return null;

  return {
    blockKey: block.key,
    block,
    themeKey: null,
    levelKey: null,
    theme: { name: getRandomHint() },
    level: {
      articleTitle: `Спочатку відкриється блок «${cleanHintLabel(block.name)}», далі ти обереш підблок і рівень.`
    }
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
