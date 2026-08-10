import { MAIN_BLOCK } from "./content.js";

export function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: MAIN_BLOCK.name, callback_data: "block:state_action" }],
      [{ text: "ℹ️ Як це працює", callback_data: "about" }]
    ]
  };
}

export function subthemesKeyboard() {
  const rows = Object.entries(MAIN_BLOCK.subthemes).map(([key, theme]) => [
    { text: theme.name, callback_data: `theme:${key}` }
  ]);

  rows.push([{ text: "🏠 На початок", callback_data: "home" }]);
  return { inline_keyboard: rows };
}

export function levelsKeyboard(themeKey) {
  const theme = MAIN_BLOCK.subthemes[themeKey];
  const rows = Object.entries(theme?.levels || {}).map(([levelKey, level]) => [
    { text: level.name, callback_data: `level:${themeKey}:${levelKey}` }
  ]);

  rows.push([{ text: "⬅️ Назад", callback_data: "block:state_action" }]);
  rows.push([{ text: "🏠 На початок", callback_data: "home" }]);
  return { inline_keyboard: rows };
}

export function resultKeyboard(themeKey, levelKey) {
  return {
    inline_keyboard: [
      [{ text: "💡 Хочу ще рішення", callback_data: `solution:${themeKey}:${levelKey}` }],
      [{ text: "🎲 Інший варіант", callback_data: `reroll:${themeKey}:${levelKey}` }],
      [{ text: "🧭 Обрати іншу тему", callback_data: "block:state_action" }],
      [{ text: "🏠 На початок", callback_data: "home" }]
    ]
  };
}
