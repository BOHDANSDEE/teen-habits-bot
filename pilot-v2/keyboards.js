import { PILOT_THEME, getSubtheme } from "./content.js";

export function startKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🧭 Почати розбір", callback_data: "pilot:start" }]
    ]
  };
}

export function themeKeyboard() {
  return {
    inline_keyboard: [
      [{ text: PILOT_THEME.name, callback_data: `pilot:theme:${PILOT_THEME.key}` }]
    ]
  };
}

export function subthemesKeyboard() {
  return {
    inline_keyboard: [
      ...Object.values(PILOT_THEME.subthemes).map((subtheme) => [
        {
          text: subtheme.name,
          callback_data: `pilot:subtheme:${subtheme.key}`
        }
      ]),
      [{ text: "⬅️ Назад", callback_data: "pilot:start" }]
    ]
  };
}

export function levelsKeyboard(subthemeKey) {
  const subtheme = getSubtheme(subthemeKey);

  if (!subtheme) {
    return { inline_keyboard: [[{ text: "🏠 На початок", callback_data: "pilot:start" }]] };
  }

  return {
    inline_keyboard: [
      ...Object.values(subtheme.levels).map((level) => [
        {
          text: level.name,
          callback_data: `pilot:level:${subthemeKey}:${level.key}`
        }
      ]),
      [{ text: "⬅️ До підблоків", callback_data: `pilot:theme:${PILOT_THEME.key}` }],
      [{ text: "🏠 На початок", callback_data: "pilot:start" }]
    ]
  };
}

export function resultKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "💡 Хочу рішення", callback_data: "pilot:more" }],
      [{ text: "🔄 Обрати іншу тему", callback_data: `pilot:theme:${PILOT_THEME.key}` }],
      [{ text: "🏠 На початок", callback_data: "pilot:start" }]
    ]
  };
}
