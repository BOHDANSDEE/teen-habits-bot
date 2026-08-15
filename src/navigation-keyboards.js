import { decorateLevelName } from "./rich-copy.js";
import { getActiveBlocks, getBlock, getBlockSubtheme } from "./navigation.js";

export const LEVELS_PER_PAGE = 8;
export const LEVEL_COLUMNS = 2;

function normalizePage(page, totalPages) {
  const numeric = Number.parseInt(page, 10);
  const requested = Number.isFinite(numeric) ? numeric : 0;
  return Math.min(Math.max(requested, 0), Math.max(totalPages - 1, 0));
}

function cleanMenuLabel(text) {
  return String(text || "")
    .replace(/[✨⭐🌟]/gu, "")
    .replace(/\b\d+\s*·\s*/u, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getLevelsPageMeta(blockKey, themeKey, page = 0) {
  const theme = getBlockSubtheme(blockKey, themeKey);
  const entries = Object.entries(theme?.levels || {});
  const totalPages = Math.max(1, Math.ceil(entries.length / LEVELS_PER_PAGE));
  const safePage = normalizePage(page, totalPages);

  return {
    entries,
    totalItems: entries.length,
    totalPages,
    page: safePage,
    start: safePage * LEVELS_PER_PAGE,
    end: Math.min((safePage + 1) * LEVELS_PER_PAGE, entries.length)
  };
}

export function getLevelPage(blockKey, themeKey, levelKey) {
  const theme = getBlockSubtheme(blockKey, themeKey);
  const keys = Object.keys(theme?.levels || {});
  const index = keys.indexOf(levelKey);
  return index < 0 ? 0 : Math.floor(index / LEVELS_PER_PAGE);
}

export function mainMenuKeyboard(recommendation = null) {
  const rows = [];

  if (recommendation) {
    rows.push([
      {
        text: "🎲 Підказка",
        callback_data: `recommend:${recommendation.blockKey}:${recommendation.themeKey}:${recommendation.levelKey}`
      }
    ]);
  }

  rows.push(
    ...getActiveBlocks().map((block) => [
      {
        text: cleanMenuLabel(block.name),
        callback_data: `block:${block.key}`
      }
    ])
  );

  rows.push([{ text: "🔄 Інша підказка", callback_data: "home" }]);
  return { inline_keyboard: rows };
}

export function subthemesKeyboard(blockKey) {
  const block = getBlock(blockKey);
  const rows = Object.entries(block?.subthemes || {}).map(([key, theme]) => [
    {
      text: cleanMenuLabel(theme.name),
      callback_data: `theme:${blockKey}:${key}:0`
    }
  ]);

  rows.push([{ text: "🏠 Головне меню", callback_data: "home" }]);
  return { inline_keyboard: rows };
}

export function levelsKeyboard(blockKey, themeKey, page = 0) {
  const meta = getLevelsPageMeta(blockKey, themeKey, page);
  const pageEntries = meta.entries.slice(meta.start, meta.end);
  const rows = [];

  for (let index = 0; index < pageEntries.length; index += LEVEL_COLUMNS) {
    rows.push(
      pageEntries.slice(index, index + LEVEL_COLUMNS).map(([levelKey, level]) => ({
        text: cleanMenuLabel(decorateLevelName(themeKey, levelKey, level.name)),
        callback_data: `level:${blockKey}:${themeKey}:${levelKey}:${meta.page}`
      }))
    );
  }

  if (meta.totalPages > 1) {
    const pagination = [];
    if (meta.page > 0) {
      pagination.push({
        text: "⬅️",
        callback_data: `levels:${blockKey}:${themeKey}:${meta.page - 1}`
      });
    }
    pagination.push({ text: `📄 ${meta.page + 1}/${meta.totalPages}`, callback_data: "noop" });
    if (meta.page < meta.totalPages - 1) {
      pagination.push({
        text: "➡️",
        callback_data: `levels:${blockKey}:${themeKey}:${meta.page + 1}`
      });
    }
    rows.push(pagination);
  }

  rows.push([{ text: "⬅️ До блоку", callback_data: `block:${blockKey}` }]);
  rows.push([{ text: "🏠 Головне меню", callback_data: "home" }]);
  return { inline_keyboard: rows };
}

export function resultKeyboard(blockKey, themeKey, levelKey, page = 0, next = null) {
  const solutionCallback =
    next?.themeKey && next?.levelKey
      ? `solution:${next.themeKey}:${next.levelKey}`
      : `solution:${blockKey}:${themeKey}`;

  return {
    inline_keyboard: [
      [{ text: "💡 Хочу рішення", callback_data: solutionCallback }],
      [{ text: "⬅️ До ситуацій", callback_data: `levels:${blockKey}:${themeKey}:${page}` }],
      [{ text: "⬅️ До блоку", callback_data: `block:${blockKey}` }],
      [{ text: "🏠 Головне меню", callback_data: "home" }]
    ]
  };
}

export function starterResultKeyboard(blockKey, themeKey, page = 0) {
  return {
    inline_keyboard: [
      [{ text: "⬅️ До ситуацій", callback_data: `levels:${blockKey}:${themeKey}:${page}` }],
      [{ text: "⬅️ До блоку", callback_data: `block:${blockKey}` }],
      [{ text: "🏠 Головне меню", callback_data: "home" }]
    ]
  };
}
