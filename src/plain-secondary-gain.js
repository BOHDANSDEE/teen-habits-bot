import { getLevelSecondaryGainPool } from "./level-context-pools.js";

const directPoolCache = new Map();

const PREFIXES = [
  "Тобі по-своєму вигідно",
  "Коротка вигода цього сценарію для тебе —",
  "Цей сценарій дає тобі можливість",
  "Так ти зберігаєш можливість",
  "У цьому сценарії ти отримуєш право",
  "Залишаючись у цьому сценарії, ти продовжуєш",
  "Цей спосіб дозволяє тобі",
  "Саме зараз цей сценарій допомагає тобі",
  "Ти тримаєшся за цей сценарій, щоб",
  "Ти залишаєш усе як є, щоб",
  "Ти повторюєш цей сценарій, щоб",
  "Для тебе прихована вигода тут —",
  "Ця поведінка зберігає для тебе можливість",
  "Через цей сценарій ти уникаєш потреби",
  "Цей сценарій тимчасово звільняє тебе від потреби",
  "Так ти відкладаєш момент, коли доведеться",
  "Ця реакція дає тобі коротку можливість",
  "У короткій перспективі тобі вигідно",
  "Поки сценарій не змінюється, ти продовжуєш",
  "Цей звичний спосіб залишає тобі можливість"
];

const BENEFIT_OPENERS = [
  "Ця проблема дає тобі {benefit}",
  "Залишаючись у цій проблемі, ти отримуєш {benefit}",
  "Так ти зберігаєш {benefit}",
  "У цій проблемі для тебе є {benefit}",
  "Старий спосіб тримається, бо дає тобі {benefit}",
  "Цей вибір повторюється, бо дає тобі {benefit}",
  "Ти повертаєшся до цієї проблеми заради {benefit}",
  "Коротка вигода цієї проблеми — {benefit}",
  "Для тебе ця проблема зберігає {benefit}",
  "Саме тут ти отримуєш {benefit}",
  "Ця поведінка залишається вигідною через {benefit}",
  "Проблема повторюється, бо в ній є {benefit}",
  "Ти не поспішаєш змінювати це через {benefit}",
  "Старий вибір здається зручним через {benefit}",
  "Триматися за цю проблему допомагає {benefit}",
  "Ця проблема тимчасово забезпечує {benefit}",
  "Тобі легше залишити все як є через {benefit}",
  "Зміни відкладаються, бо старий спосіб дає {benefit}",
  "У короткий момент ця проблема створює {benefit}",
  "Саме {benefit} робить цю проблему вигідною зараз"
];

function sentence(text = "") {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
}

function plainWords(text = "") {
  return String(text || "")
    .replace(/сценарі(й|ю|єм|ї)/giu, "звичний спосіб")
    .replace(/патерн\w*/giu, "звичка")
    .replace(/механізм\w*/giu, "реакція")
    .replace(/внутрішн(я|ю) систем\w*/giu, "ця реакція")
    .replace(/\s{2,}/gu, " ")
    .trim();
}

function secondaryGainParts(text = "") {
  let value = String(text || "").trim();
  let variant = 0;

  for (let index = 0; index < PREFIXES.length; index += 1) {
    const prefix = PREFIXES[index];
    if (value.startsWith(prefix)) {
      value = value.slice(prefix.length).trim();
      variant = index;
      break;
    }
  }

  value = value.replace(/^[—:,-]\s*/u, "").replace(/[.!?…]+$/u, "").trim();
  return { core: plainWords(value), variant };
}

function benefitFromCore(core = "") {
  const text = String(core).toLocaleLowerCase("uk-UA");
  if (/знайом|передбач|звичн|не міняти середовище|не перебудов/u.test(text)) return "відчуття стабільності й передбачуваності";
  if (/сил|ресурс|навантаж|зусилл|енерг/u.test(text)) return "можливість зберегти сили прямо зараз";
  if (/нудьг|напруг|дискомфорт|неприєм|емоці/u.test(text)) return "швидке полегшення від неприємного відчуття";
  if (/вільн|обов’яз|обов'яз|план|правил/u.test(text)) return "відчуття свободи від обов'язку прямо зараз";
  if (/виріш|вибір|визначен|відповідальн/u.test(text)) return "можливість не робити складний вибір";
  if (/оцін|результат|чернет|ідеаль/u.test(text)) return "захист від оцінки неідеального результату";
  if (/невдач|помил|розчар/u.test(text)) return "відчуття безпеки від можливої невдачі";
  if (/контрол|дикту|тиск/u.test(text)) return "відчуття контролю над моментом і рішенням";
  if (/винагород|стимул|задовол|приєм/u.test(text)) return "швидке приємне відчуття без очікування";
  if (/дедлайн|термінов|останн/u.test(text)) return "зовнішній поштовх, який не треба створювати самому";
  if (/інш|чуж|соціал|помітн|коментар/u.test(text)) return "захист від чужої оцінки й зайвої уваги";
  if (/самому|самостій|допомог/u.test(text)) return "відчуття самостійності й контролю";
  if (/сон|вечір|ніч/u.test(text)) return "відчуття особистого часу й свободи";
  return "коротке відчуття полегшення й безпеки";
}

export function secondaryGainCore(text = "") {
  return secondaryGainParts(text).core;
}

export function buildPlainSecondaryGain(text = "", forcedBenefit = null) {
  const { core, variant } = secondaryGainParts(text);
  if (!core) {
    return "Ця проблема дає тобі коротке відчуття полегшення й безпеки. Тому тобі вигідно залишити все як є прямо зараз.";
  }

  const benefit = forcedBenefit || benefitFromCore(core);
  const opener = BENEFIT_OPENERS[variant] || BENEFIT_OPENERS[0];
  return `${sentence(opener.replaceAll("{benefit}", benefit))} ${sentence(`Тому тобі вигідно ${core}`)}`;
}

export function getDirectSecondaryGainPool(themeKey, levelKey) {
  const cacheKey = `${themeKey}.${levelKey}`;
  if (directPoolCache.has(cacheKey)) return directPoolCache.get(cacheKey);
  const source = getLevelSecondaryGainPool(themeKey, levelKey);
  const pool = source.map((text, index) => {
    const cleanupStability = cacheKey === "lazy.l6" && index < 250
      ? "відчуття стабільності й передбачуваності"
      : null;
    return buildPlainSecondaryGain(text, cleanupStability);
  });
  if (pool.length !== 500 || new Set(pool).size !== 500) {
    throw new Error(`${cacheKey}: secondary gain pool must have 500 unique visible texts`);
  }
  directPoolCache.set(cacheKey, pool);
  return pool;
}
