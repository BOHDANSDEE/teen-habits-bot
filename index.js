import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import http from "http";
import { MAIN_BLOCK, getSubtheme } from "./src/content.js";
import {
  levelsKeyboard,
  mainMenuKeyboard,
  resultKeyboard,
  subthemesKeyboard
} from "./src/keyboards.js";
import { buildContinuation, buildResult } from "./src/renderer.js";
import { getStats, getUser, registerEvent, updateUser } from "./src/storage.js";

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;
const PORT = process.env.PORT || 10000;

if (!token) {
  console.error("❌ BOT_TOKEN не знайдено в Environment Variables");
  process.exit(1);
}

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("HabitTeen bot v2 is running");
  })
  .listen(PORT, () => console.log(`🌐 Health server: ${PORT}`));

const bot = new TelegramBot(token, { polling: true });
console.log("✅ HabitTeen bot v2 запущено");

function isAdmin(chatId) {
  return adminId && String(chatId) === String(adminId);
}

async function safeSend(chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (error) {
    console.error("❌ sendMessage:", error.message);
    return null;
  }
}

async function showHome(chatId) {
  getUser(chatId);
  await safeSend(
    chatId,
    `👋 HabitTeen

Тут не потрібно проходити довгий курс по черзі.

Обери ситуацію, яка зараз найближча. Бот дасть короткий розбір і один практичний крок. Якщо одного рішення мало, можна одразу перейти до суміжної причини без повернення на початок.`,
    { reply_markup: mainMenuKeyboard() }
  );
}

async function showBlock(chatId) {
  await safeSend(
    chatId,
    `${MAIN_BLOCK.name}

${MAIN_BLOCK.description}

Що зараз найближче до твоєї ситуації?`,
    { reply_markup: subthemesKeyboard() }
  );
}

async function showTheme(chatId, themeKey) {
  const theme = getSubtheme(themeKey);
  if (!theme) {
    await showBlock(chatId);
    return;
  }

  updateUser(chatId, { currentThemeKey: themeKey, currentLevelKey: null });
  const levelCount = Object.keys(theme.levels || {}).length;

  await safeSend(
    chatId,
    `${theme.name}

${theme.description}

Обери рівень. Тут ${levelCount} рівнів: одна тема статті = один рівень.`,
    { reply_markup: levelsKeyboard(themeKey) }
  );
}

async function sendResult(chatId, themeKey, levelKey, source = "level") {
  const result = buildResult(themeKey, levelKey);
  if (!result) {
    await safeSend(chatId, "Не вдалося знайти цей рівень. Обери тему ще раз.", {
      reply_markup: subthemesKeyboard()
    });
    return;
  }

  const user = getUser(chatId);
  updateUser(chatId, {
    currentThemeKey: themeKey,
    currentLevelKey: levelKey,
    resultsShown: (user.resultsShown || 0) + 1
  });
  registerEvent("result", chatId, { themeKey, levelKey, source });

  await safeSend(chatId, result.text, {
    parse_mode: "Markdown",
    reply_markup: resultKeyboard(themeKey, levelKey)
  });
}

async function sendContinuation(chatId, previousThemeKey) {
  const continuation = buildContinuation(previousThemeKey);
  if (!continuation) {
    await showBlock(chatId);
    return;
  }

  const user = getUser(chatId);
  updateUser(chatId, {
    currentThemeKey: continuation.themeKey,
    currentLevelKey: continuation.levelKey,
    continuationsShown: (user.continuationsShown || 0) + 1
  });
  registerEvent("continuation", chatId, {
    fromThemeKey: previousThemeKey,
    toThemeKey: continuation.themeKey,
    levelKey: continuation.levelKey
  });

  await safeSend(chatId, continuation.text, {
    parse_mode: "Markdown",
    reply_markup: resultKeyboard(continuation.themeKey, continuation.levelKey)
  });
}

bot.onText(/\/start(?:\s+.*)?$/, async (msg) => {
  registerEvent("start", msg.chat.id, {
    username: msg.from?.username || null
  });
  await showHome(msg.chat.id);
});

bot.onText(/\/stats$/, async (msg) => {
  if (!isAdmin(msg.chat.id)) {
    await safeSend(msg.chat.id, "⛔ Немає доступу.");
    return;
  }

  const stats = getStats();
  await safeSend(
    msg.chat.id,
    `📊 HabitTeen v2

/start: ${stats.starts}
Результатів: ${stats.results}
Продовжень: ${stats.continuations}
Подій у журналі: ${stats.events.length}`
  );
});

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const data = query.data || "";
  if (!chatId) return;

  try {
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("❌ answerCallbackQuery:", error.message);
  }

  if (data === "home") {
    await showHome(chatId);
    return;
  }

  if (data === "about") {
    await safeSend(
      chatId,
      `ℹ️ Як це працює

1. Обираєш близьку ситуацію.
2. Обираєш один із 15 рівнів у темі — кожен рівень відповідає окремій статті HabitTeen.
3. Отримуєш одну з варіацій: стан, проблема, вторинна вигода, значення в житті, практичний крок та афірмація.
4. Кнопка «Хочу ще рішення» переводить у випадково обрану суміжну тему й випадковий рівень, щоб продовжити розбір без нового старту.

Для кожної підтеми є по 500 варіантів стану, проблеми, вторинної вигоди, значення в житті та афірмації.`,
      { reply_markup: mainMenuKeyboard() }
    );
    return;
  }

  if (data === "block:state_action") {
    await showBlock(chatId);
    return;
  }

  if (data.startsWith("theme:")) {
    const [, themeKey] = data.split(":");
    await showTheme(chatId, themeKey);
    return;
  }

  if (data.startsWith("level:")) {
    const [, themeKey, levelKey] = data.split(":");
    await sendResult(chatId, themeKey, levelKey, "level");
    return;
  }

  if (data.startsWith("reroll:")) {
    const [, themeKey, levelKey] = data.split(":");
    await sendResult(chatId, themeKey, levelKey, "reroll");
    return;
  }

  if (data.startsWith("solution:")) {
    const [, themeKey] = data.split(":");
    await sendContinuation(chatId, themeKey);
    return;
  }

  await showHome(chatId);
});

bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (!text || text.startsWith("/")) return;

  await safeSend(
    msg.chat.id,
    "Бот працює через кнопки. Натисни /start, щоб відкрити меню.",
    { reply_markup: mainMenuKeyboard() }
  );
});

bot.on("polling_error", (error) => {
  console.error("❌ polling_error:", error.message);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ unhandledRejection:", error);
});
