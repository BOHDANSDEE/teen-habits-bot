import { LEVELS_BY_THEME } from "./levels.js";
import { THEME_POOLS } from "./pools.js";

export const MAIN_BLOCK = {
  key: "state_action",
  name: "⚡ Стан, енергія та дія",
  description:
    "Один блок для ситуацій, де лінь, апатія й прокрастинація можуть перетинатися. Обери напрям, який зараз найближчий.",
  subthemes: {
    lazy: {
      name: "😴 Лінь",
      description:
        "Бар’єр старту, втома, мотивація, сон, великі задачі, самодисципліна та середовище.",
      pools: THEME_POOLS.lazy,
      levels: LEVELS_BY_THEME.lazy
    },
    apathy: {
      name: "🌫 Апатія",
      description:
        "Зниження енергії та інтересу, сонливість, стрес, вигорання, підтримка й межі самодопомоги.",
      pools: THEME_POOLS.apathy,
      levels: LEVELS_BY_THEME.apathy
    },
    procrastination: {
      name: "⏳ Прокрастинація",
      description:
        "Відкладання, тривога, перфекціонізм, навчання, дедлайни, телефон, сон і робочі інтервали.",
      pools: THEME_POOLS.procrastination,
      levels: LEVELS_BY_THEME.procrastination
    }
  }
};

export const FEELING_INTROS = [
  "💭 Ти так це відчуваєш?",
  "💭 Схоже на твою ситуацію?",
  "🧭 Перевір, наскільки це про тебе.",
  "🔎 Подивись на цю версію як на гіпотезу про твій стан.",
  "💬 Можливо, зараз у тебе працює приблизно такий сценарій.",
  "🧩 Перевір, чи складається твоя ситуація приблизно так.",
  "📍 Подивись, чи впізнаєш тут свій теперішній стан.",
  "🔍 Це лише одна можлива версія. Перевір її на своїй ситуації.",
  "💡 Можливо, проблема не там, де ти звик її шукати.",
  "🧠 Спробуй подивитися на ситуацію як на набір механізмів, а не як на рису характеру.",
  "🗺 Ось один із можливих способів розкласти твою ситуацію.",
  "⚙️ Перевіримо, який механізм може зараз підтримувати цей стан.",
  "📌 Зістав цей опис зі своїм досвідом, не приймаючи його автоматично за істину.",
  "🔸 Можливо, зараз важливо помітити не ярлик, а конкретний бар’єр.",
  "🧪 Сприймай цей варіант як маленьку перевірку, а не як діагноз.",
  "🌱 Подивись, чи є в цьому описі щось, що пояснює твій наступний крок.",
  "🧭 Не обов’язково погоджуватися з усім — відміть лише те, що справді підходить.",
  "💬 Якщо це близько до твоєї ситуації, зверни увагу на наступні блоки.",
  "🔎 Спробуй відокремити факт про свій стан від автоматичної оцінки себе.",
  "🧩 Можливо, кілька частин цього опису одночасно стосуються твоєї ситуації."
];

export const CONTINUATION_BRIDGES = [
  "Попередній розбір міг зачепити лише частину ситуації. Спробуємо суміжний напрям.",
  "Якщо полегшення неповне, причина може бути поруч, а не точно в тому самому місці.",
  "Наступне рішення дивиться на ситуацію з іншого боку, щоб не зациклюватися на одному поясненні.",
  "Твій стан може складатися з кількох механізмів одночасно. Перевіримо ще один.",
  "Цей напрям пов’язаний із попереднім, але фокус буде іншим.",
  "Іноді одна проблема підтримує іншу. Перевіримо ще один можливий вузол.",
  "Не потрібно починати весь тест заново — просто подивимося на сусідню причину.",
  "Змінимо кут: наступний розбір може пояснити іншу частину тієї самої ситуації.",
  "Якщо перший варіант був лише частково точним, ось інший пов’язаний сценарій.",
  "Продовжимо без повернення в меню: цього разу бот випадково обрав інший напрям."
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
