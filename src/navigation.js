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

const ARTICLE_SLUG_ALIASES = Object.freeze({
  "yak-poboroty-lin-i-pochaty-diiaty": "yak-poboroty-lin",
  "chomu-nichoho-ne-khochetsia-robyty": "prychyny-lini",
  "yak-zmusyty-sebe-shchos-robyty-koly-ne-khochetsia": "yak-diiaty-koly-nemaie-motyvatsii",
  "chomu-vidkladaiu-navit-prosti-spravy": "yak-poboroty-lin",
  "chomu-pislia-zrobliu-potim-staie-lehshe": "prychyny-lini",
  "ne-znaiu-z-choho-pochaty": "yak-poboroty-lin",
  "yak-pochaty-velyku-spravu": "yak-poboroty-lin",
  "chomu-bahato-planuiu-ale-ne-pochynaiu": "yak-poboroty-lin",
  "yak-perestaty-chekaty-pravylnoho-momentu": "yak-diiaty-koly-nemaie-motyvatsii",
  "chomu-spysok-sprav-demotyvuie": "prychyny-lini",
  "boiusia-pochaty-bo-mozhu-zrobyty-pohano": "prychyny-lini",
  "yak-perestaty-vidkladaty-cherez-strakh-pomylky": "prychyny-lini",
  "ne-khochetsia-robyty-koly-ne-vpevnenyi": "prychyny-lini",
  "chomu-lehshe-ne-probuvaty": "prychyny-lini",
  "yak-pochaty-koly-rezultat-ne-harantovanyi": "yak-poboroty-lin",
  "prosti-spravy-vidchuvaiutsia-zanadto-vazhkymy": "prychyny-lini",
  "yak-perestaty-vidvolikatysia-na-telefon": "chomu-ne-vystachaie-syly-voli",
  "chomu-robliu-dribnytsi-zamist-vazhlyvoi-spravy": "chomu-ne-vystachaie-syly-voli",
  "chomu-pochynaiu-lyshe-pered-dedlainom": "yak-rozvynuty-samodystsyplinu",
  "ne-bachu-sensu-robyty-khocha-treba": "prychyny-lini"
});

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

  const resolvedSlug = ARTICLE_SLUG_ALIASES[normalized] || normalized;
  return (
    getAllLevelTargets().find(
      (target) => String(target.level?.articleSlug || "").toLowerCase() === resolvedSlug
    ) || null
  );
}
