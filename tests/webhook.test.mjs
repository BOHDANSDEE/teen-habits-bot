import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../index.js", import.meta.url), "utf8");

assert.match(source, /new TelegramBot\(token, \{ polling: false \}\)/, "polling must be disabled");
assert.match(source, /bot\.getWebHookInfo\(/, "startup must inspect current webhook before changing it");
assert.match(source, /webhookMatches\(currentInfo, webhookUrl\)/, "matching webhook must be reused instead of reset");
assert.match(source, /bot\.setWebHook\(/, "bot must be able to register Telegram webhook when needed");
assert.match(source, /WEBHOOK_RETRY_DELAYS_MS/, "setWebhook conflicts must use bounded retries");
assert.match(source, /terminated by other setWebhook/i, "parallel setWebhook conflict must be handled explicitly");
assert.match(source, /налаштований паралельним Render-інстансом/, "parallel instance success must be accepted");
assert.match(source, /startWebhookServer\(\)/, "startup must gate server boot on webhook configuration");
assert.match(source, /await configureWebhook\(\)/, "webhook must be configured before server is exposed as ready");
assert.match(source, /server\.listen\(PORT, "0\.0\.0\.0"/, "Render server must bind on 0.0.0.0");
assert.match(source, /bot\.processUpdate\(/, "HTTP webhook must pass updates to the bot");
assert.match(source, /RENDER_EXTERNAL_URL/, "webhook URL must use Render external URL");
assert.match(source, /X-Telegram-Bot-Api-Secret-Token/i, "webhook requests must verify Telegram secret header");
assert.match(source, /webhookSecret\.slice\(0, 24\)/, "webhook route must change if bot token changes");
assert.match(source, /async function retireActiveMenu\(chatId\)/, "/start must retire the previously active menu");
assert.match(source, /bot\.editMessageReplyMarkup\(\s*\{ inline_keyboard: \[\] \}/s, "old inline keyboard must be removed");
assert.match(source, /updateUser\(chatId, \{ menuMessageId: null \}\)/, "stored old menu id must be cleared before fresh start");
assert.match(source, /const retirePromise = retireActiveMenu\(msg\.chat\.id\);/, "/start must begin retiring the old menu before rendering the new one");
assert.match(source, /"article-deeplink",\s*null\s*\)/s, "article deep-link must open as a fresh message at the bottom");
assert.match(source, /await showHome\(msg\.chat\.id, null\);/, "manual /start must open a fresh menu message");
assert.match(source, /await retirePromise;/, "old menu cleanup must complete after fresh rendering starts");
assert.doesNotMatch(source, /"article-deeplink",\s*user\.menuMessageId/s, "article deep-link must not edit a stale menu message");
assert.doesNotMatch(source, /bot\.on\(["']polling_error["']/, "polling error listener should be removed");
assert.doesNotMatch(source, /polling:\s*true/, "long polling must not be enabled");

console.log("✅ HabitTeen webhook/start test passed: stable webhook + fresh /start menu behavior enabled");
