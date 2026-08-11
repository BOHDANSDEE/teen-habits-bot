import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import http from "http";
import {
  findLevelByArticleSlug,
  getBlock,
  getBlockSubtheme,
  getRandomRecommendation
} from "./src/navigation.js";
import {
  getLevelPage,
  getLevelsPageMeta,
  levelsKeyboard,
  mainMenuKeyboard,
  resultKeyboard,
  subthemesKeyboard
} from "./src/navigation-keyboards.js";
import { buildContinuation, buildResult } from "./src/renderer.js";
import { getStats, getUser, registerEvent, updateUser } from "./src/storage.js";

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;
const PORT = process.env.PORT || 10000;
const PRIMARY_BLOCK_KEY = "state_action";
const ARTICLE_START_PREFIX = "article_";

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

function telegramDescription(error) {
  return error?.response?.body?.description || error?.message || "невідома помилка";
}

async function safeSend(chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (error) {
    console.error("❌ sendMessage:", telegramDescription(error));
    return null;
  }
}

async function renderNavigation(chatId, messageId, text, options = {}) {
  if (messageId) {
    try {
      const edited = await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        ...options
      });
      updateUser(chatId, { menuMessageId: messageId });
      return edited;
    } catch (error) {
      const description = telegramDescription(error);
      if (/message is not modified/i.test(description)) {
        updateUser(chatId, { menuMessageId: messageId });
        return { message_id: messageId };
      }
      console.error("⚠️ editMessageText:", description);
    }
  }

  const sent = await safeSend(chatId, text, options);
  if (sent?.message_id) updateUser(chatId, { menuMessageId: sent.message_id });
  return sent;
}

function recommendationText(recommendation) {
  if (!recommendation) return "";

  return `\n\n🎲✨ Вам рекомендується зараз:\n${recommendation.theme.name}\n🎯 ${recommendation.level.name}\n📖 ${recommendation.level.articleTitle}\n\nНатисни «Відкрити рекомендований рівень» — бот одразу покаже розбір і практичні кроки.`;
}

async function showHome(chatId, messageId = null) {
  const user = getUser(chatId);
  const targetMessageId = messageId || user.menuMessageId || null;
  const recommendation = getRandomRecommendation();

  updateUser(chatId, {
    currentBlockKey: null,
    currentThemeKey: null,
    currentLevelKey: null
  });

  await renderNavigation(
    chatId,
    targetMessageId,
    `👋✨ HabitTeen${recommendationText(recommendation)}\n\n🧭 Або обери блок самостійно. Усередині будуть підблоки, а далі — конкретні рівні.\n\n🔄 Меню працює в одному повідомленні: натискаєш кнопку — ця ж сторінка змінюється, тому старі кнопки не накопичуються в чаті.`,
    { reply_markup: mainMenuKeyboard(recommendation) }
  );
}

async function showAbout(chatId, messageId = null) {
  await renderNavigation(
    chatId,
    messageId,
    `ℹ️🧭 Як це працює\n\n1️⃣ У головному меню бот випадково рекомендує один рівень із доступних тем.\n2️⃣ Можна відкрити рекомендацію одразу або самостійно обрати великий блок і підблок.\n3️⃣ Рівні показуються сторінками по 8 кнопок — між сторінками можна рухатися стрілками ⬅️ ➡️.\n4️⃣ Один рівень відповідає окремій темі статті HabitTeen.\n5️⃣ Якщо перейти з кнопки всередині статті, бот одразу відкриє саме її рівень — повторно шукати тему не потрібно.\n6️⃣ Після вибору отримуєш розгорнутий розбір: стан, проблему, вторинну вигоду, значення в житті, 3 практичні кроки та афірмацію.\n7️⃣ З результату можна повернутися до рівнів, до блоку або одразу в головне меню.\n\n🧩 Архітектура вже готова для майбутніх блоків інших напрямів. Поки їхні теми не визначені, порожні кнопки користувачам не показуються.`,
    { reply_markup: mainMenuKeyboard(getRandomRecommendation()) }
  );
}

async function showBlock(chatId, blockKey, messageId = null) {
  const block = getBlock(blockKey);
  if (!block || block.enabled === false) {
    await showHome(chatId, messageId);
    return;
  }

  updateUser(chatId, {
    currentBlockKey: blockKey,
    currentThemeKey: null,
    currentLevelKey: null
  });

  await renderNavigation(
    chatId,
    messageId,
    `${block.name}\n\n${block.description}\n\n🧩 Обери підблок, який зараз найближчий до твоєї ситуації.`,
    { reply_markup: subthemesKeyboard(blockKey) }
  );
}

async function showTheme(chatId, blockKey, themeKey, page = 0, messageId = null) {
  const theme = getBlockSubtheme(blockKey, themeKey);
  if (!theme) {
    await showBlock(chatId, blockKey, messageId);
    return;
  }

  const meta = getLevelsPageMeta(blockKey, themeKey, page);
  updateUser(chatId, {
    currentBlockKey: blockKey,
    currentThemeKey: themeKey,
    currentLevelKey: null,
    currentLevelPage: meta.page
  });

  await renderNavigation(
    chatId,
    messageId,
    `${theme.name}\n\n${theme.description}\n\n📚 Обери рівень. Усього ${meta.totalItems}; на одній сторінці показуємо максимум 8.\n📄 Сторінка ${meta.page + 1}/${meta.totalPages}.`,
    { reply_markup: levelsKeyboard(blockKey, themeKey, meta.page) }
  );
}

async function sendResult(
  chatId,
  blockKey,
  themeKey,
  levelKey,
  page = 0,
  source = "level",
  messageId = null
) {
  if (blockKey !== PRIMARY_BLOCK_KEY) {
    await showBlock(chatId, blockKey, messageId);
    return;
  }

  const result = buildResult(themeKey, levelKey);
  if (!result) {
    await showTheme(chatId, blockKey, themeKey, page, messageId);
    return;
  }

  const user = getUser(chatId);
  updateUser(chatId, {
    currentBlockKey: blockKey,
    currentThemeKey: themeKey,
    currentLevelKey: levelKey,
    currentLevelPage: page,
    resultsShown: (user.resultsShown || 0) + 1
  });
  registerEvent("result", chatId, { blockKey, themeKey, levelKey, page, source });

  await renderNavigation(chatId, messageId, result.text, {
    parse_mode: "Markdown",
    reply_markup: resultKeyboard(blockKey, themeKey, levelKey, page)
  });
}

async function sendContinuation(chatId, blockKey, previousThemeKey, messageId = null) {
  if (blockKey !== PRIMARY_BLOCK_KEY) {
    await showBlock(chatId, blockKey, messageId);
    return;
  }

  const continuation = buildContinuation(previousThemeKey);
  if (!continuation) {
    await showBlock(chatId, blockKey, messageId);
    return;
  }

  const page = getLevelPage(blockKey, continuation.themeKey, continuation.levelKey);
  const user = getUser(chatId);
  updateUser(chatId, {
    currentBlockKey: blockKey,
    currentThemeKey: continuation.themeKey,
    currentLevelKey: continuation.levelKey,
    currentLevelPage: page,
    continuationsShown: (user.continuationsShown || 0) + 1
  });
  registerEvent("continuation", chatId, {
    blockKey,
    fromThemeKey: previousThemeKey,
    toThemeKey: continuation.themeKey,
    levelKey: continuation.levelKey,
    page
  });

  await renderNavigation(chatId, messageId, continuation.text, {
    parse_mode: "Markdown",
    reply_markup: resultKeyboard(blockKey, continuation.themeKey, continuation.levelKey, page)
  });
}

bot.onText(/\/start(?:\s+([A-Za-z0-9_-]+))?$/, async (msg, match) => {
  const payload = match?.[1] || "";
  registerEvent("start", msg.chat.id, {
    username: msg.from?.username || null,
    payload: payload || null
  });

  if (payload.startsWith(ARTICLE_START_PREFIX)) {
    const articleSlug = payload.slice(ARTICLE_START_PREFIX.length);
    const target = findLevelByArticleSlug(articleSlug);

    if (target) {
      const page = getLevelPage(target.blockKey, target.themeKey, target.levelKey);
      const user = getUser(msg.chat.id);
      await sendResult(
        msg.chat.id,
        target.blockKey,
        target.themeKey,
        target.levelKey,
        page,
        "article-deeplink",
        user.menuMessageId || null
      );
      return;
    }
  }

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
    `📊 HabitTeen v2\n\n/start: ${stats.starts}\nРезультатів: ${stats.results}\nПродовжень: ${stats.continuations}\nПодій у журналі: ${stats.events.length}`
  );
});

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const messageId = query.message?.message_id;
  const data = query.data || "";
  if (!chatId) return;

  try {
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("❌ answerCallbackQuery:", telegramDescription(error));
  }

  if (messageId) updateUser(chatId, { menuMessageId: messageId });

  if (data === "noop") return;
  if (data === "home") {
    await showHome(chatId, messageId);
    return;
  }
  if (data === "about") {
    await showAbout(chatId, messageId);
    return;
  }

  if (data.startsWith("recommend:")) {
    const [, blockKey, themeKey, levelKey] = data.split(":");
    const page = getLevelPage(blockKey, themeKey, levelKey);
    await sendResult(
      chatId,
      blockKey,
      themeKey,
      levelKey,
      page,
      "menu-recommendation",
      messageId
    );
    return;
  }

  if (data.startsWith("block:")) {
    const [, blockKey] = data.split(":");
    await showBlock(chatId, blockKey, messageId);
    return;
  }

  if (data.startsWith("theme:")) {
    const parts = data.split(":");
    const blockKey = parts.length >= 4 ? parts[1] : PRIMARY_BLOCK_KEY;
    const themeKey = parts.length >= 4 ? parts[2] : parts[1];
    const page = parts.length >= 4 ? parts[3] : 0;
    await showTheme(chatId, blockKey, themeKey, page, messageId);
    return;
  }

  if (data.startsWith("levels:")) {
    const [, blockKey, themeKey, page] = data.split(":");
    await showTheme(chatId, blockKey, themeKey, page, messageId);
    return;
  }

  if (data.startsWith("level:")) {
    const parts = data.split(":");
    if (parts.length >= 5) {
      const [, blockKey, themeKey, levelKey, page] = parts;
      await sendResult(
        chatId,
        blockKey,
        themeKey,
        levelKey,
        Number(page) || 0,
        "level",
        messageId
      );
    } else {
      const [, themeKey, levelKey] = parts;
      const page = getLevelPage(PRIMARY_BLOCK_KEY, themeKey, levelKey);
      await sendResult(
        chatId,
        PRIMARY_BLOCK_KEY,
        themeKey,
        levelKey,
        page,
        "legacy-level",
        messageId
      );
    }
    return;
  }

  if (data.startsWith("reroll:")) {
    const parts = data.split(":");
    if (parts.length >= 5) {
      const [, blockKey, themeKey, levelKey, page] = parts;
      await sendResult(
        chatId,
        blockKey,
        themeKey,
        levelKey,
        Number(page) || 0,
        "reroll",
        messageId
      );
    } else {
      const [, themeKey, levelKey] = parts;
      const page = getLevelPage(PRIMARY_BLOCK_KEY, themeKey, levelKey);
      await sendResult(
        chatId,
        PRIMARY_BLOCK_KEY,
        themeKey,
        levelKey,
        page,
        "legacy-reroll",
        messageId
      );
    }
    return;
  }

  if (data.startsWith("solution:")) {
    const parts = data.split(":");
    const blockKey =
      parts.length >= 3 && getBlock(parts[1]) ? parts[1] : PRIMARY_BLOCK_KEY;
    const themeKey =
      blockKey === PRIMARY_BLOCK_KEY && parts[1] !== PRIMARY_BLOCK_KEY
        ? parts[1]
        : parts[2];
    await sendContinuation(chatId, blockKey, themeKey, messageId);
    return;
  }

  await showHome(chatId, messageId);
});

bot.on("message", async (msg) => {
  const text = msg.text || "";
  if (!text || text.startsWith("/")) return;

  const user = getUser(msg.chat.id);
  await showHome(msg.chat.id, user.menuMessageId || null);
});

bot.on("polling_error", (error) => {
  console.error("❌ polling_error:", telegramDescription(error));
});

process.on("unhandledRejection", (error) => {
  console.error("❌ unhandledRejection:", error);
});
