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

function cleanHintDestination(text) {
  return cleanMenuLabel(text)
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
}

function hintButtonLabel(text) {
  const destination = Array.from(cleanHintDestination(text));
  const maxDestinationLength = 46;
  const shortDestination =
    destination.length > maxDestinationLength
      ? `${destination.slice(0, maxDestinationLength - 1).join("")}…`
      : destination.join("");

  return `🎲 Підказка (${shortDestination || "наступний крок"})`;
}

function pickRandomEntry(entries = []) {
  if (!entries.length) return null;
  return entries[Math.floor(Math.random() * entries.length)] || null;
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

  if (recommendation?.blockKey && recommendation?.block) {
    rows.push([
      {
        text: hintButtonLabel(recommendation.block.name),
        callback_data: `block:${recommendation.blockKey}`
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
  const themeEntries = Object.entries(block?.subthemes || {});
  const hintEntry = pickRandomEntry(
    themeEntries.filter(([, theme]) => Object.keys(theme?.levels || {}).length > 0)
  );
  const rows = [];

  if (hintEntry) {
    const [hintThemeKey, hintTheme] = hintEntry;
    rows.push([
      {
        text: hintButtonLabel(hintTheme.name),
        callback_data: `theme:${blockKey}:${hintThemeKey}:0`
      }
    ]);
    rows.push([{ text: "🔄 Інша підказка", callback_data: `block:${blockKey}` }]);
  }

  rows.push(
    ...themeEntries.map(([key, theme]) => [
      {
        text: cleanMenuLabel(theme.name),
        callback_data: `theme:${blockKey}:${key}:0`
      }
    ])
  );

  rows.push([{ text: "🏠 Головне меню", callback_data: "home" }]);
  return { inline_keyboard: rows };
}

export function levelsKeyboard(blockKey, themeKey, page = 0) {
  const meta = getLevelsPageMeta(blockKey, themeKey, page);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const pageEntries = meta.entries.slice(meta.start, meta.end);
  const hintEntry = pickRandomEntry(meta.entries);
  const rows = [];

  if (hintEntry) {
    const [hintLevelKey, hintLevel] = hintEntry;
    const hintPage = getLevelPage(blockKey, themeKey, hintLevelKey);
    rows.push([
      {
        text: hintButtonLabel(
          decorateLevelName(themeKey, hintLevelKey, hintLevel.name || hintLevel.articleTitle)
        ),
        callback_data: `level:${blockKey}:${themeKey}:${hintLevelKey}:${hintPage}`
      }
    ]);
    rows.push([
      {
        text: "🔄 Інша підказка",
        callback_data: `levels:${blockKey}:${themeKey}:${meta.page}`
      }
    ]);
  }

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
