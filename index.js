import TelegramBot from "node-telegram-bot-api";
import "dotenv/config";
import http from "http";
import { createHash, timingSafeEqual } from "crypto";
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
  starterResultKeyboard,
  subthemesKeyboard
} from "./src/navigation-keyboards.js";
import { buildGenericResult } from "./src/generic-result.js";
import { buildContinuation, buildResult } from "./src/renderer.js";
import { getStats, getUser, registerEvent, updateUser } from "./src/storage.js";

const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;
const PORT = process.env.PORT || 10000;
const PRIMARY_BLOCK_KEY = "state_action";
const ARTICLE_START_PREFIX = "article_";
const WEBHOOK_ALLOWED_UPDATES = ["message", "callback_query"];
const WEBHOOK_RETRY_DELAYS_MS = [700, 1400, 2800, 5000];

if (!token) {
  console.error("❌ BOT_TOKEN не знайдено в Environment Variables");
  process.exit(1);
}

const webhookSecret = createHash("sha256")
  .update(`habitteen-webhook:${token}`)
  .digest("hex");
const WEBHOOK_PATH = `/telegram/webhook/${webhookSecret.slice(0, 24)}`;

const bot = new TelegramBot(token, { polling: false });
console.log("✅ Telegram bot запущено у webhook-режимі");

function telegramDescription(error) {
  return error?.response?.body?.description || error?.message || "невідома помилка";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasValidWebhookSecret(req) {
  const received = String(req.headers["x-telegram-bot-api-secret-token"] || "");
  const expected = webhookSecret;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (Buffer.byteLength(body, "utf8") > 1_000_000) {
      throw new Error("Webhook payload is too large");
    }
  }
  return JSON.parse(body || "{}");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === WEBHOOK_PATH) {
    if (!hasValidWebhookSecret(req)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    try {
      const update = await readJsonBody(req);
      bot.processUpdate(update);
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("OK");
    } catch (error) {
      console.error("❌ webhook update:", telegramDescription(error));
      res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Bad Request");
    }
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bot is running");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

function webhookMatches(info, webhookUrl) {
  return Boolean(info?.url && info.url === webhookUrl);
}

function logWebhookInfo(info, webhookUrl, prefix = "✅ Telegram webhook активний") {
  console.log(`${prefix}: ${info?.url || webhookUrl}`);
  if (info?.pending_update_count) {
    console.log(`📨 Telegram pending updates: ${info.pending_update_count}`);
  }
  if (info?.last_error_message) {
    console.warn(`⚠️ Telegram webhook last error: ${info.last_error_message}`);
  }
}

async function configureWebhook() {
  const baseUrl = (process.env.WEBHOOK_BASE_URL || process.env.RENDER_EXTERNAL_URL || "")
    .trim()
    .replace(/\/+$/, "");

  if (!baseUrl) {
    throw new Error("WEBHOOK_BASE_URL/RENDER_EXTERNAL_URL не знайдено");
  }

  const webhookUrl = `${baseUrl}${WEBHOOK_PATH}`;
  const currentInfo = await bot.getWebHookInfo();

  if (webhookMatches(currentInfo, webhookUrl)) {
    logWebhookInfo(currentInfo, webhookUrl, "✅ Telegram webhook уже налаштований");
    return currentInfo;
  }

  let lastError = null;

  for (let attempt = 0; attempt <= WEBHOOK_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await bot.setWebHook(webhookUrl, {
        secret_token: webhookSecret,
        allowed_updates: WEBHOOK_ALLOWED_UPDATES
      });

      const info = await bot.getWebHookInfo();
      if (!webhookMatches(info, webhookUrl)) {
        throw new Error(`Telegram повернув інший webhook URL: ${info?.url || "empty"}`);
      }

      logWebhookInfo(info, webhookUrl);
      return info;
    } catch (error) {
      lastError = error;
      const description = telegramDescription(error);
      const isSetWebhookConflict = /409|terminated by other setWebhook/i.test(description);

      if (!isSetWebhookConflict) {
        throw error;
      }

      const racedInfo = await bot.getWebHookInfo().catch(() => null);
      if (webhookMatches(racedInfo, webhookUrl)) {
        logWebhookInfo(
          racedInfo,
          webhookUrl,
          "✅ Telegram webhook налаштований паралельним Render-інстансом"
        );
        return racedInfo;
      }

      const retryDelay = WEBHOOK_RETRY_DELAYS_MS[attempt];
      if (retryDelay == null) break;

      const delayWithJitter = retryDelay + Math.floor(Math.random() * 250);
      console.warn(
        `⚠️ setWebhook conflict, повтор через ${delayWithJitter}ms (${attempt + 1}/${WEBHOOK_RETRY_DELAYS_MS.length})`
      );
      await sleep(delayWithJitter);
    }
  }

  throw lastError || new Error("Не вдалося налаштувати Telegram webhook");
}

async function startWebhookServer() {
  try {
    await configureWebhook();
  } catch (error) {
    console.error("❌ webhook startup:", telegramDescription(error));
    process.exit(1);
    return;
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 Health/webhook server: ${PORT}`);
    console.log(`🟢 Webhook endpoint ready: ${WEBHOOK_PATH}`);
  });
}

startWebhookServer();

function isAdmin(chatId) {
  return adminId && String(chatId) === String(adminId);
}

async function safeSend(chatId, text, options = {}) {
  try {
    return await bot.sendMessage(chatId, text, options);
  } catch (error) {
    console.error("❌ sendMessage:", telegramDescription(error));
    return null;
  }
}

async function retireActiveMenu(chatId) {
  const user = getUser(chatId);
  const previousMenuMessageId = user.menuMessageId || null;

  updateUser(chatId, { menuMessageId: null });

  if (!previousMenuMessageId) return null;

  try {
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [] },
      {
        chat_id: chatId,
        message_id: previousMenuMessageId
      }
    );
  } catch (error) {
    const description = telegramDescription(error);
    if (
      !/message is not modified|message to edit not found|message can't be edited/i.test(
        description
      )
    ) {
      console.warn("⚠️ retireActiveMenu:", description);
    }
  }

  return previousMenuMessageId;
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

function humanizeNavigationText(text = "") {
  return String(text || "")
    .replace(/конкретний рівень ситуації/gu, "конкретну ситуацію")
    .replace(/Пілотні рівні/gu, "Пілотні варіанти");
}

function recommendationText(recommendation) {
  if (!recommendation) return "";

  return `\n\n🎲 Можеш почати з цього:\n${recommendation.theme.name}\n📖 ${recommendation.level.articleTitle}`;
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
    `🧭 Обери, що хочеш розібрати.${recommendationText(recommendation)}`,
    { reply_markup: mainMenuKeyboard(recommendation) }
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
    `${block.name}\n\n${humanizeNavigationText(block.description)}\n\n🧩 Обери напрям, який зараз найближчий до твоєї ситуації.`,
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
    `${theme.name}\n\n${humanizeNavigationText(theme.description)}\n\n📚 Обери ситуацію, яка зараз найближча. Усього ${meta.totalItems}.\n📄 ${meta.page + 1}/${meta.totalPages}`,
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
  const result =
    blockKey === PRIMARY_BLOCK_KEY
      ? buildResult(themeKey, levelKey)
      : buildGenericResult(blockKey, themeKey, levelKey);

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

  const replyMarkup =
    blockKey === PRIMARY_BLOCK_KEY
      ? resultKeyboard(blockKey, themeKey, levelKey, page, result.next)
      : starterResultKeyboard(blockKey, themeKey, page);

  await renderNavigation(chatId, messageId, result.text, {
    parse_mode: "Markdown",
    reply_markup: replyMarkup
  });
}

async function sendContinuation(
  chatId,
  blockKey,
  previousThemeKey,
  targetThemeKey = null,
  targetLevelKey = null,
  messageId = null
) {
  if (blockKey !== PRIMARY_BLOCK_KEY) {
    await showBlock(chatId, blockKey, messageId);
    return;
  }

  const continuation = buildContinuation(
    previousThemeKey,
    targetThemeKey,
    targetLevelKey
  );
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

  if (messageId) {
    await retireActiveMenu(chatId);
  }

  await renderNavigation(chatId, null, continuation.text, {
    parse_mode: "Markdown",
    reply_markup: resultKeyboard(
      blockKey,
      continuation.themeKey,
      continuation.levelKey,
      page,
      continuation.next
    )
  });
}

bot.onText(/\/start(?:\s+([A-Za-z0-9_-]+))?$/, async (msg, match) => {
  const payload = match?.[1] || "";
  registerEvent("start", msg.chat.id, {
    username: msg.from?.username || null,
    payload: payload || null
  });

  const retirePromise = retireActiveMenu(msg.chat.id);

  if (payload.startsWith(ARTICLE_START_PREFIX)) {
    const articleSlug = payload.slice(ARTICLE_START_PREFIX.length);
    const target = findLevelByArticleSlug(articleSlug);

    if (target) {
      const page = getLevelPage(target.blockKey, target.themeKey, target.levelKey);
      await sendResult(
        msg.chat.id,
        target.blockKey,
        target.themeKey,
        target.levelKey,
        page,
        "article-deeplink",
        null
      );
      await retirePromise;
      return;
    }
  }

  await showHome(msg.chat.id, null);
  await retirePromise;
});

bot.onText(/\/stats$/, async (msg) => {
  if (!isAdmin(msg.chat.id)) {
    await safeSend(msg.chat.id, "⛔ Немає доступу.");
    return;
  }

  const stats = getStats();
  await safeSend(
    msg.chat.id,
    `📊 Бот\n\n/start: ${stats.starts}\nРезультатів: ${stats.results}\nПродовжень: ${stats.continuations}\nПодій у журналі: ${stats.events.length}`
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
    await showHome(chatId, messageId);
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
    const targetThemeKey = parts[1] || null;
    const targetLevelKey = parts[2] || null;
    const targetTheme =
      parts.length === 3 && targetThemeKey
        ? getBlockSubtheme(PRIMARY_BLOCK_KEY, targetThemeKey)
        : null;

    if (targetTheme?.levels?.[targetLevelKey]) {
      const previousThemeKey = getUser(chatId).currentThemeKey || targetThemeKey;
      await sendContinuation(
        chatId,
        PRIMARY_BLOCK_KEY,
        previousThemeKey,
        targetThemeKey,
        targetLevelKey,
        messageId
      );
      return;
    }

    const blockKey =
      parts.length >= 3 && getBlock(parts[1]) ? parts[1] : PRIMARY_BLOCK_KEY;
    const themeKey =
      blockKey === PRIMARY_BLOCK_KEY && parts[1] !== PRIMARY_BLOCK_KEY
        ? parts[1]
        : parts[2];
    await sendContinuation(chatId, blockKey, themeKey, null, null, messageId);
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

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM: завершуємо HTTP server без видалення Telegram webhook");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
});

process.on("unhandledRejection", (error) => {
  console.error("❌ unhandledRejection:", error);
});
