import { getBlock, getBlockSubtheme } from "./navigation.js";
import { buildPlainSecondaryGain } from "./plain-secondary-gain.js";

const REFERRAL = /фахів|лікар|професійн\w*\s+оцінк|медичн\w*\s+оцінк/iu;

function firstSentence(text = "", fallback = "") {
  const raw = String(text || fallback).trim();
  const first = raw.split(/(?<=[.!?…])\s+/u).filter(Boolean)[0] || raw;
  const value = REFERRAL.test(first) ? String(fallback).trim() : first;
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
}

function lower(text = "") {
  const value = String(text).replace(/[.!?…]+$/u, "").trim();
  return value ? `${value.charAt(0).toLocaleLowerCase("uk-UA")}${value.slice(1)}` : value;
}

const cleanName = (name = "") => String(name || "").replace(/^\d+\s*·\s*/u, "").trim();
const readCount = () => 3 + Math.floor(Math.random() * 7);

export function buildGenericResult(blockKey, themeKey, levelKey) {
  const block = getBlock(blockKey);
  const theme = getBlockSubtheme(blockKey, themeKey);
  const level = theme?.levels?.[levelKey];
  if (!block || !theme || !level) return null;

  const count = readCount();
  const problemName = cleanName(level.name) || level.articleTitle;
  const state = `Ти відчуваєш, що ${lower(firstSentence(level.state, "ця тема зараз впливає на твій стан"))}. Найсильніше це помітно саме тоді, коли потрібно діяти.`;
  const problem = `Тобі заважає те, що ${lower(firstSentence(level.problem, "цей сценарій заважає потрібній зміні"))}. Через це старий сценарій повторюється замість нового вибору.`;
  const gain = buildPlainSecondaryGain(firstSentence(level.secondaryGain, "не витрачати сили на зміни прямо зараз"));
  const meaning = `У житті це проявляється так: ${lower(firstSentence(level.meaning, "ця тема впливає на твої щоденні рішення"))}. З часом це впливає на твої звички й вибір.`;
  const solution = `${firstSentence(level.affirmation, "Я обираю один конкретний крок і роблю його зараз.")} Сьогодні я підтверджую це рішення одним конкретним кроком.`;
  const afterState = "Ти відчуваєш більше ясності й контролю щодо наступного кроку. Напруга стає слабшою, а дія — зрозумілішою.";

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
