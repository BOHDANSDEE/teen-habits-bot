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

function makeDefinite(text = "") {
  return String(text || "")
    .replace(/може бути/gu, "є")
    .replace(/можуть бути/gu, "є")
    .replace(/може відрізнятися/gu, "відрізняється")
    .replace(/можуть відрізнятися/gu, "відрізняються")
    .replace(/може викликати/gu, "викликає")
    .replace(/можуть викликати/gu, "викликають")
    .replace(/може проявлятися/gu, "проявляється")
    .replace(/можуть проявлятися/gu, "проявляються")
    .replace(/може впливати/gu, "впливає")
    .replace(/можуть впливати/gu, "впливають")
    .replace(/може допомагати/gu, "допомагає")
    .replace(/може допомогти/gu, "допомагає")
    .replace(/може стати/gu, "стає")
    .replace(/може здаватися/gu, "здається")
    .replace(/може означати/gu, "означає")
    .replace(/може переходити/gu, "переходить")
    .replace(/може виникати/gu, "виникає")
    .replace(/може посилювати/gu, "посилює")
    .replace(/може знижувати/gu, "знижує")
    .replace(/може давати/gu, "дає")
    .replace(/може залишатися/gu, "залишається")
    .replace(/може триматися/gu, "тримається")
    .trim();
}

function sentenceCore(text = "") {
  return makeDefinite(String(firstSentence(text)).replace(/[.!?…]+$/u, "").trim());
}

function lowerFirst(text = "") {
  const value = String(text || "").trim();
  if (!value) return value;
  return `${value.charAt(0).toLocaleLowerCase("uk-UA")}${value.slice(1)}`;
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
    ensureSentence(`Ти відчуваєш, що ${lowerFirst(sentenceCore(level.state))}`),
    "Це впливає на твою увагу, енергію та спосіб реагувати в цій темі.",
    "Ти помічаєш цей стан найсильніше саме в моментах, де потрібен новий вибір."
  ].join(" ");
  const problem = [
    ensureSentence(`Тобі заважає те, що ${lowerFirst(sentenceCore(level.problem))}`),
    "Це призводить до повторення того самого сценарію й забирає простір для іншої реакції.",
    level.note
      ? firstSentence(level.note)
      : "Коли це повторюється, проблема переходить з одного моменту у звичний спосіб дії."
  ].join(" ");
  const secondaryGain = [
    ensureSentence(`Тобі по-своєму вигідно залишатися в цьому сценарії, тому що ${lowerFirst(sentenceCore(level.secondaryGain))}`),
    "Так ти отримуєш коротке полегшення й залишаєшся в знайомій реакції.",
    "Саме ця коротка вигода пояснює, чому старий сценарій тримається навіть тоді, коли вже шкодить."
  ].join(" ");
  const meaning = [
    ensureSentence(`У твоєму житті ця тема проявляється так: ${lowerFirst(sentenceCore(level.meaning))}`),
    "Це видно у твоїх рішеннях, звичках, ставленні до себе та реакціях у схожих ситуаціях.",
    "Коли ти бачиш цей зв’язок, ти точніше розумієш, що саме змінювати."
  ].join(" ");
  const solution = [
    firstSentence(level.affirmation),
    "Я закріплюю це рішення поступово й без вимоги змінити все за один день.",
    "Я повертаюся до цієї думки щоразу, коли старий сценарій знову стає автоматичним."
  ].join(" ");

  return {
    blockKey,
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    readCount,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${secondaryGain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${readCount} разів не поспішаючи.`
  };
}
