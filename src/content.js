import { LEVELS_BY_THEME } from "./levels-45.js";
import { THEME_POOLS } from "./pools.js";

export const MAIN_BLOCK = {
  key: "state_action",
  name: "⚡ Стан, енергія та дія",
  description:
    "Один блок для роботи з лінню, апатією й прокрастинацією та їхніми перетинами. Обери напрям, який зараз найближчий.",
  subthemes: {
    lazy: {
      name: "😴 Лінь",
      description:
        "Бар’єр старту, втома, мотивація, сон, звички, самодисципліна та середовище.",
      pools: THEME_POOLS.lazy,
      levels: LEVELS_BY_THEME.lazy
    },
    apathy: {
      name: "🌫 Апатія",
      description:
        "Зниження енергії та інтересу, сонливість, стрес, вигорання, ізоляція, підтримка й межі самодопомоги.",
      pools: THEME_POOLS.apathy,
      levels: LEVELS_BY_THEME.apathy
    },
    procrastination: {
      name: "⏳ Прокрастинація",
      description:
        "Відкладання, перфекціонізм, навчання, дедлайни, увага, пріоритети, завершення справ і швидка винагорода.",
      pools: THEME_POOLS.procrastination,
      levels: LEVELS_BY_THEME.procrastination
    }
  }
};

export const FEELING_INTROS = [
  "💭 Ти так це відчуваєш?",
  "🧭 Розкладемо цей стан по частинах.",
  "🔎 Ось як працює цей патерн.",
  "💬 Подивись на свій стан через цей розбір.",
  "📍 Ти обрав цей рівень — розберемо його конкретно.",
  "⚙️ Розбираємо механізм без зайвих ярликів.",
  "🧩 Зараз з’єднаємо стан, проблему, вигоду й наступний крок.",
  "🧠 Подивись, що утримує цей сценарій у повсякденному житті.",
  "💡 Тут важливий не ярлик, а конкретний механізм.",
  "🔸 Розберемо, де саме застрягає енергія або дія.",
  "📌 Зараз фокус на тому, що відбувається і що з цим робити.",
  "🗺 Ось карта цього стану: від відчуття до рішення.",
  "🌱 Розберемо цей рівень так, щоб після тексту залишився конкретний крок.",
  "🔥 Переходимо від назви проблеми до її внутрішньої логіки.",
  "🧭 Зараз головне — побачити патерн і змінити наступну дію.",
  "💬 Розкладемо ситуацію прямо: стан, проблема, вигода, сенс, дія.",
  "🔎 Подивись, де саме цей сценарій забирає ресурс.",
  "⚡ Тут працюємо не з самокритикою, а з конкретною поведінкою.",
  "🧠 Зараз ти побачиш, що підтримує цей стан і де його можна змінити.",
  "📍 Беремо один рівень і розбираємо його до практичного рішення."
];

export const CONTINUATION_BRIDGES = [
  "Попередній розбір зачепив одну частину ситуації. Тепер беремо суміжний напрям.",
  "Одна проблема часто підживлює іншу. Переходимо до наступного вузла.",
  "Не повертаємося в меню — продовжуємо розбір із іншого боку.",
  "Тепер дивимося на ту саму ситуацію через інший пов’язаний механізм.",
  "Цей напрям пов’язаний із попереднім, але працює з іншою точкою напруги.",
  "Розбір продовжується: наступний блок показує іншу частину того самого циклу.",
  "Змінюємо кут і беремо інший рівень, щоб не ходити по одному колу.",
  "Попередня дія була першим кроком. Тепер додаємо другий рівень роботи.",
  "Наступний блок розширює попереднє рішення і переводить фокус на іншу тему.",
  "Продовжуємо без нового старту: бот обрав інший напрям і новий рівень."
];

export function getSubtheme(themeKey) {
  return MAIN_BLOCK.subthemes[themeKey] || null;
}

export function getLevel(themeKey, levelKey) {
  return getSubtheme(themeKey)?.levels?.[levelKey] || null;
}

export function getFirstLevelKey(themeKey) {
  const levels = getSubtheme(themeKey)?.levels || {};
  return Object.keys(levels)[0] || null;
}

export function getRandomLevelKey(themeKey) {
  const levels = Object.keys(getSubtheme(themeKey)?.levels || {});
  if (!levels.length) return null;
  return levels[Math.floor(Math.random() * levels.length)];
}

export function getRandomRelatedTheme(currentThemeKey) {
  const keys = Object.keys(MAIN_BLOCK.subthemes).filter((key) => key !== currentThemeKey);
  return keys[Math.floor(Math.random() * keys.length)] || currentThemeKey;
}

export function pickRandom(items = []) {
  if (!items.length) return "";
  return items[Math.floor(Math.random() * items.length)];
}
