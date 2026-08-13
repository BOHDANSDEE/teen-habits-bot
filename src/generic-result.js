import { getBlock, getBlockSubtheme } from "./navigation.js";

function splitSentences(text = "") {
  return String(text || "")
    .trim()
    .split(/(?<=[.!?…])\s+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureSentence(text = "") {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
}

function firstSentence(text = "") {
  return ensureSentence(splitSentences(text)[0] || text);
}

function cleanLevelName(name = "") {
  return String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
}

function randomReadCount() {
  return 3 + Math.floor(Math.random() * 7);
}

export function buildGenericResult(blockKey, themeKey, levelKey) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const level = theme?.levels?.[levelKey];
  if (!block || !theme || !level) return null;

  const readCount = randomReadCount();
  const problemName = cleanLevelName(level.name) || level.articleTitle;
  const state = [
    firstSentence(level.state),
    "Це може впливати на те, скільки в тебе залишається уваги, енергії або бажання діяти в цій темі.",
    "Замість того щоб оцінювати себе за цей стан, корисніше помітити, у які моменти він стає сильнішим."
  ].join(" ");
  const problem = [
    firstSentence(level.problem),
    "Саме ця точка найчастіше підтримує обраний сценарій і не дає йому змінитися сам по собі.",
    "Коли вона повторюється, проблема починає впливати не лише на один момент, а й на звичний спосіб дії."
  ].join(" ");
  const secondaryGain = [
    firstSentence(`Тобі може бути по-своєму вигідно залишатися в цьому сценарії, тому що ${level.secondaryGain}`),
    "Це дає коротке полегшення або відчуття знайомості, тому мозок може повертатися до цього способу знову.",
    "Вторинна вигода не робить проблему корисною — вона лише пояснює, чому змінювати її іноді складніше, ніж здається."
  ].join(" ");
  const meaning = [
    firstSentence(level.meaning),
    "У житті це може проявлятися в рішеннях, звичках, ставленні до себе та реакціях у схожих ситуаціях.",
    "Коли ти починаєш помічати цей зв’язок, стає легше вибирати інший спосіб дії."
  ].join(" ");
  const solution = [
    firstSentence(level.affirmation),
    "Я дозволяю собі закріплювати це рішення поступово, без вимоги змінитися за один день.",
    "Я повертаюся до цієї думки щоразу, коли старий сценарій знову стає автоматичним."
  ].join(" ");
  const note = level.note ? `\n\n🛟 *Важлива межа*\n${level.note}` : "";

  return {
    blockKey,
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    readCount,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${secondaryGain}\n\n🌟🧭 *Значення в житті*\n${meaning}${note}\n\n🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це ${readCount} разів не поспішаючи.`
  };
}
