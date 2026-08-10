import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import http from "http";
import {
  PILOT_THEME,
  buildResult,
  getFirstLevel,
  getLevel,
  getSubtheme,
  getTransitionText,
  pickNextSubtheme
} from "./content.js";
import {
  levelsKeyboard,
  resultKeyboard,
  startKeyboard,
  subthemesKeyboard,
  themeKeyboard
} from "./keyboards.js";
import {
  chooseLevel,
  continueWith,
  getSession,
  resetSession
} from "./session.js";

const PORT = Number(process.env.PORT || 10000);
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN не знайдено в Environment Variables");
  process.exit(1);
}

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("HabitTeen pilot v2 is running");
  })
  .listen(PORT, () => {
    console.log(`🌐 Health server: ${PORT}`);
  });

const bot = new TelegramBot(token, { polling: true });

async function showStart(chatId, { reset = true } = {}) {
  if (reset) resetSession(chatId);

  await bot.sendMessage(
    chatId,
    `HabitTeen · пробна версія\n\nЦе короткий розбір ситуації, а не тест із правильними відповідями.\n\nСпочатку обери один блок. Усередині будуть підблоки й рівні.`,
    { reply_markup: themeKeyboard() }
  );
}

async function showSubthemes(chatId) {
  await bot.sendMessage(
    chatId,
    `${PILOT_THEME.name}\n\n${PILOT_THEME.description}\n\nДля пробної версії тут три підблоки, які часто перетинаються між собою. Обери той, що зараз найближчий до твоєї ситуації:`,
    { reply_markup: subthemesKeyboard() }
  );
}

async function showLevels(chatId, subthemeKey) {
  const subtheme = getSubtheme(subthemeKey);

  if (!subtheme) {
    await bot.sendMessage(chatId, "Не знайшов цей підблок.", {
      reply_markup: themeKeyboard()
    });
    return;
  }

  const level = getFirstLevel(subthemeKey);

  await bot.sendMessage(
    chatId,
    `${subtheme.name}\n\n${subtheme.description}\n\nУ пробній версії поки один рівень:\n\n${level ? `• ${level.name}\n${level.description}` : "Рівні ще не додані."}`,
    { reply_markup: levelsKeyboard(subthemeKey) }
  );
}

async function showResult(chatId, subthemeKey, { transitionFrom = null } = {}) {
  const result = buildResult(subthemeKey);
  let prefix = "";

  if (transitionFrom) {
    const from = getSubtheme(transitionFrom);
    const to = getSubtheme(subthemeKey);

    prefix = `🔁 Продовження\n\n${getTransitionText(transitionFrom, subthemeKey)}\n\n${from && to ? `${from.shortName} → ${to.shortName}\n\n` : ""}`;
  }

  await bot.sendMessage(chatId, `${prefix}${result.text}`, {
    reply_markup: resultKeyboard()
  });
}

async function handleMore(chatId) {
  const session = getSession(chatId);

  if (!session.subthemeKey) {
    await bot.sendMessage(chatId, "Спочатку обери підблок і рівень.", {
      reply_markup: startKeyboard()
    });
    return;
  }

  const nextSubthemeKey = pickNextSubtheme(session.subthemeKey);
  const nextLevel = getFirstLevel(nextSubthemeKey);

  if (!nextSubthemeKey || !nextLevel) {
    await bot.sendMessage(chatId, "Для продовження поки немає готового рівня.", {
      reply_markup: resultKeyboard()
    });
    return;
  }

  const previousSubthemeKey = session.subthemeKey;
  continueWith(chatId, nextSubthemeKey, nextLevel.key);
  await showResult(chatId, nextSubthemeKey, {
    transitionFrom: previousSubthemeKey
  });
}

bot.onText(/^\/start(?:\s.*)?$/, async (msg) => {
  await showStart(msg.chat.id);
});

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const data = query.data || "";

  if (!chatId) return;

  try {
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("answerCallbackQuery:", error.message);
  }

  try {
    if (data === "pilot:start") {
      await showStart(chatId);
      return;
    }

    if (data === `pilot:theme:${PILOT_THEME.key}`) {
      await showSubthemes(chatId);
      return;
    }

    if (data.startsWith("pilot:subtheme:")) {
      const subthemeKey = data.split(":")[2];
      await showLevels(chatId, subthemeKey);
      return;
    }

    if (data.startsWith("pilot:level:")) {
      const [, , subthemeKey, levelKey] = data.split(":");
      const level = getLevel(subthemeKey, levelKey);

      if (!level) {
        await bot.sendMessage(chatId, "Не знайшов цей рівень.", {
          reply_markup: themeKeyboard()
        });
        return;
      }

      chooseLevel(chatId, subthemeKey, levelKey);
      await showResult(chatId, subthemeKey);
      return;
    }

    if (data === "pilot:more") {
      await handleMore(chatId);
      return;
    }

    await bot.sendMessage(chatId, "Ця кнопка вже неактуальна. Почни з меню.", {
      reply_markup: startKeyboard()
    });
  } catch (error) {
    console.error("callback error:", error);
    await bot.sendMessage(
      chatId,
      "Сталася технічна помилка. Натисни /start і спробуй ще раз."
    );
  }
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  await bot.sendMessage(
    msg.chat.id,
    "У пробній версії розбір працює через кнопки. Натисни /start.",
    { reply_markup: startKeyboard() }
  );
});

bot.on("polling_error", (error) => {
  console.error("❌ Polling error:", error.message);
});

process.once("SIGINT", async () => {
  await bot.stopPolling();
  process.exit(0);
});

process.once("SIGTERM", async () => {
  await bot.stopPolling();
  process.exit(0);
});

console.log("✅ HabitTeen pilot v2 started");
