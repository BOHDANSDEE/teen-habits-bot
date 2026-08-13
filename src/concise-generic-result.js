import { getBlock, getBlockSubtheme } from "./navigation.js";

const REFERRAL = /фахів|лікар|професійн\w*\s+оцінк|медичн\w*\s+оцінк/iu;

const sentence = (text = "") => {
  const value = String(text || "").trim();
  if (!value) return "";
  const first = value.split(/(?<=[.!?…])\s+/u).filter(Boolean)[0] || value;
  return /[.!?…]$/u.test(first) ? first : `${first}.`;
};

const safe = (text = "", fallback = "") => {
  const value = sentence(text);
  return REFERRAL.test(value) ? sentence(fallback) : value;
};

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
const lowerFirst = (text = "") => {
  const value = String(text || "").replace(/[.!?…]+$/u, "").trim();
  if (!value) return value;
  return `${value.charAt(0).toLocaleLowerCase("uk-UA")}${value.slice(1)}`;
};

function readCount() {
  return 3 + Math.floor(Math.random() * 7);
}

export function buildGenericResult(blockKey, themeKey, levelKey) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const level = theme?.levels?.[levelKey];
  if (!block || !theme || !level) return null;

  const count = readCount();
  const problemName = cleanName(level.name) || level.articleTitle;
  const stateCore = lowerFirst(safe(level.state, "ця тема зараз впливає на твій стан"));
  const problemCore = lowerFirst(safe(level.problem, "цей сценарій заважає потрібній зміні"));
  const gainCore = lowerFirst(safe(level.secondaryGain, "цей сценарій дає коротке полегшення"));
  const meaningCore = lowerFirst(safe(level.meaning, "ця тема впливає на твої щоденні рішення"));
  const solution = safe(level.affirmation, "Я обираю один конкретний крок і роблю його зараз.");
  const state = `Ти відчуваєш, що ${stateCore}.`;
  const problem = `Тобі заважає те, що ${problemCore}.`;
  const gain = `Тобі це дає коротку вигоду: ${gainCore}.`;
  const meaning = `У житті це проявляється так: ${meaningCore}.`;
  const afterState = "Ти відчуваєш більше ясності, спокою й контролю щодо наступного кроку.";

  return {
    blockKey,
    themeKey,
    levelKey,
    articleSlug: level.articleSlug,
    articleTitle: level.articleTitle,
    readCount: count,
    afterState,
    text: `🌿🧠 *Стан*\n${state}\n\n🧩⚠️ *Проблема — ${problemName}*\n${problem}\n\n🪞🎁 *Вторинна вигода*\n${gain}\n\n🌟🧭 *Значення в житті*\n${meaning}\n\n🔑✨ *Рішення*\n${solution}\n\n🔁 Прочитай це рішення ${count} разів.\n\n✨ *Тепер ти відчуваєш*\n${afterState}`
  };
}
