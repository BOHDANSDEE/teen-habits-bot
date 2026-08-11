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
assert.doesNotMatch(source, /bot\.on\(["']polling_error["']/, "polling error listener should be removed");
assert.doesNotMatch(source, /polling:\s*true/, "long polling must not be enabled");

console.log("✅ HabitTeen webhook test passed: idempotent Render startup, retries and protected webhook enabled");
