import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../index.js", import.meta.url), "utf8");

assert.match(source, /new TelegramBot\(token, \{ polling: false \}\)/, "polling must be disabled");
assert.match(source, /bot\.setWebHook\(/, "bot must register Telegram webhook");
assert.match(source, /bot\.processUpdate\(/, "HTTP webhook must pass updates to the bot");
assert.match(source, /RENDER_EXTERNAL_URL/, "webhook URL must use Render external URL");
assert.match(source, /X-Telegram-Bot-Api-Secret-Token/i, "webhook requests must verify Telegram secret header");
assert.doesNotMatch(source, /bot\.on\(["']polling_error["']/, "polling error listener should be removed");
assert.doesNotMatch(source, /polling:\s*true/, "long polling must not be enabled");

console.log("✅ HabitTeen webhook test passed: polling disabled, webhook endpoint enabled and protected");
