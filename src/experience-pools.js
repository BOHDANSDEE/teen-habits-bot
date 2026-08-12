import { THEME_POOLS } from "./pools.js";

export const EXPERIENCE_MODES = ["mirror", "quiz", "story"];
export const EXPERIENCES_PER_MODE = 350;

const FRAME_COUNT = 14;
const CORE_COUNT = 25;

const PREFIXES = {
  states: /^Стан зараз виглядає так:\s*/u,
  problems: /^Проблема тут у тому, що\s*/u,
  secondaryGains: /^Вторинна вигода цього патерну —\s*/u,
  meanings: /^Значення цього досвіду в житті —\s*/u,
  affirmations: /^Я обираю\s*/u
};

const LETTERS = ["А", "Б", "В", "Г"];

function extractCore(pool = [], key, index) {
  return String(pool[index] || "").replace(PREFIXES[key], "").trim();
}

function buildAtoms(themeKey) {
  const pools = THEME_POOLS[themeKey];
  if (!pools) return [];

  return Array.from({ length: CORE_COUNT }, (_, index) => ({
    state: extractCore(pools.states, "states", index),
    problem: extractCore(pools.problems, "problems", index),
    secondaryGain: extractCore(pools.secondaryGains, "secondaryGains", index),
    meaning: extractCore(pools.meanings, "meanings", index),
    solution: extractCore(pools.affirmations, "affirmations", index)
  }));
}

function compact(text, limit = 108) {
  const value = String(text || "").trim();
  if (value.length <= limit) return value;
  const sliced = value.slice(0, limit - 1);
  const boundary = sliced.lastIndexOf(" ");
  return `${(boundary > 60 ? sliced.slice(0, boundary) : sliced).trim()}…`;
}

function sentence(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return /[.!?…]$/u.test(value) ? value : `${value}.`;
}

const MIRROR_FRAMES = [
  (a) => `🪞 *Ти відчуваєш це так*\nТи відчуваєш, що ${a.state}\n\nНайбільше тобі зараз заважає те, що ${a.problem}\n\nЧастина тебе все одно тримається за цей сценарій, бо він допомагає ${a.secondaryGain}\n\nА змінити його варто не заради «ідеальності», а щоб ${a.meaning}`,
  (a) => `🧠 *Ти помічаєш у собі*\nТи відчуваєш, що ${a.state}\n\nЧерез це в потрібний момент виникає бар’єр: ${sentence(a.problem)}\n\nСценарій не випадковий — коротко він дає тобі можливість ${a.secondaryGain}\n\nТвій сильніший напрям тут — ${sentence(a.meaning)}`,
  (a) => `🌿 *Як це відчувається зсередини*\nТи відчуваєш, що ${a.state}\n\nТи можеш хотіти змін, але одночасно впиратися в те, що ${a.problem}\n\nЗвичний патерн тримається, тому що дозволяє ${a.secondaryGain}\n\nЯкщо поступово його змінювати, ти вчишся ${a.meaning}`,
  (a) => `🎯 *Що відбувається з тобою зараз*\nТи відчуваєш, що ${a.state}\n\nУ центрі ситуації не «слабкість», а конкретна перешкода: ${sentence(a.problem)}\n\nМозок повертає тебе до старого способу, бо так простіше ${a.secondaryGain}\n\nНовий спосіб потрібен, щоб ${a.meaning}`,
  (a) => `💭 *Твоя внутрішня картина*\nТи відчуваєш, що ${a.state}\n\nКоли доходить до реальної дії, тобі заважає те, що ${a.problem}\n\nСтарий сценарій дає коротке полегшення: допомагає ${a.secondaryGain}\n\nТа довший виграш для тебе — навчитися ${a.meaning}`,
  (a) => `🧭 *Ти зараз у такій точці*\nТи відчуваєш, що ${a.state}\n\nТе, що найбільше збиває напрям: ${sentence(a.problem)}\n\nЗвичка повертається не просто так — вона дозволяє ${a.secondaryGain}\n\nВихід із цього сценарію поступово допомагає ${a.meaning}`,
  (a) => `⚡ *Ти відчуваєш напругу саме тут*\nТи відчуваєш, що ${a.state}\n\nКлючова складність зараз у тому, що ${a.problem}\n\nСтарий спосіб поведінки захищає тебе тим, що дає змогу ${a.secondaryGain}\n\nА твоя реальна ціль — ${sentence(a.meaning)}`,
  (a) => `🔎 *Якщо назвати це прямо*\nТи відчуваєш, що ${a.state}\n\nТобі шкодить не сам факт такого стану, а те, що ${a.problem}\n\nПри цьому сценарій має коротку вигоду: він допомагає ${a.secondaryGain}\n\nЗміна потрібна, щоб ти міг ${a.meaning}`,
  (a) => `🌤️ *Ти відчуваєш це не випадково*\nТи відчуваєш, що ${a.state}\n\nСитуацію ускладнює те, що ${a.problem}\n\nТи повертаєшся до знайомого сценарію, бо він дозволяє ${a.secondaryGain}\n\nА нова опора формується, коли ти вчишся ${a.meaning}`,
  (a) => `🪴 *Що ти насправді переживаєш*\nТи відчуваєш, що ${a.state}\n\nНайболючіша точка тут — ${sentence(a.problem)}\n\nСтарий патерн на короткий час допомагає ${a.secondaryGain}\n\nАле в перспективі тобі важливіше ${sentence(a.meaning)}`,
  (a) => `🧩 *Твій сценарій по частинах*\nТи відчуваєш, що ${a.state}\n\nОдна частина проблеми: ${sentence(a.problem)}\n\nДруга — те, що старий сценарій дозволяє ${a.secondaryGain}\n\nТочка зміни з’являється, коли ти починаєш ${a.meaning}`,
  (a) => `🚦 *Де ти зараз зупиняєшся*\nТи відчуваєш, що ${a.state}\n\nПеред рухом виникає стоп-сигнал: ${sentence(a.problem)}\n\nВін здається корисним, бо допомагає ${a.secondaryGain}\n\nА зелений сигнал для тебе — поступово навчитися ${a.meaning}`,
  (a) => `🌊 *Що накриває тебе в цій ситуації*\nТи відчуваєш, що ${a.state}\n\nХвиля стає сильнішою через те, що ${a.problem}\n\nЗвичний спосіб дозволяє ненадовго ${a.secondaryGain}\n\nА стійкість тут росте, коли ти вчишся ${a.meaning}`,
  (a) => `🔑 *Що важливо побачити про себе*\nТи відчуваєш, що ${a.state}\n\nТвоя перешкода зараз конкретна: ${sentence(a.problem)}\n\nСтарий сценарій утримується, бо допомагає ${a.secondaryGain}\n\nЗмінюючи його, ти поступово вчишся ${a.meaning}`
];

const QUIZ_INTROS = [
  "Відповідай швидко, не шукаючи «правильної» відповіді.",
  "Обери в кожному пункті те, що найближче до твого останнього тижня.",
  "Не оцінюй себе — просто помічай, які варіанти повторюються.",
  "Уяви звичайний день і вибери те, що найчастіше схоже на тебе.",
  "Вибирай не те, як «має бути», а те, як є насправді.",
  "Познач по одному варіанту в кожному питанні й подивись на спільну тему.",
  "Це не тест на правильність. Це спосіб побачити свій сценарій збоку.",
  "Відповідай так, ніби ніхто не побачить твої відповіді.",
  "Обери те, що відгукується першим, навіть якщо відповідь неідеальна.",
  "Пройди чотири питання як коротку перевірку себе.",
  "Зосередься на фактичній поведінці, а не на намірах.",
  "Вибери варіант, який найкраще описує твою реакцію в складний момент.",
  "Подивись, де саме повторюється одна й та сама внутрішня логіка.",
  "Відміть подумки відповіді й наприкінці сформулюй одну чесну фразу про себе."
];

function optionIndexes(coreIndex, shift) {
  return [0, 3, 7, 11].map((offset) => (coreIndex + offset + shift) % CORE_COUNT);
}

function optionsFor(atoms, field, coreIndex, shift) {
  return optionIndexes(coreIndex, shift)
    .map((index, optionIndex) => `• ${LETTERS[optionIndex]}. ${compact(atoms[index][field])}`)
    .join("\n");
}

function buildQuiz(atoms, atom, coreIndex, frameIndex) {
  return `🧩 *Коротке опитування про тебе*\n${QUIZ_INTROS[frameIndex]}\n\n1️⃣ *Що ти відчуваєш найчастіше?*\n${optionsFor(atoms, "state", coreIndex, frameIndex)}\n\n2️⃣ *Що найбільше тобі заважає?*\n${optionsFor(atoms, "problem", coreIndex, frameIndex + 2)}\n\n3️⃣ *Чому цей сценарій так легко повторюється?*\n${optionsFor(atoms, "secondaryGain", coreIndex, frameIndex + 4)}\n\n4️⃣ *Що ти хочеш повернути або навчитися робити інакше?*\n${optionsFor(atoms, "meaning", coreIndex, frameIndex + 6)}\n\n📌 Подивись на свої відповіді разом. Якщо в них повторюється одна тема, саме з неї варто почати. Тут немає оцінки чи діагнозу — це спосіб точніше назвати те, що відбувається з тобою.`;
}

const STORY_FRAMES = [
  (a) => `📖 *Історія про ліхтар*\nУяви, що ти йдеш у темряві з маленьким ліхтарем. Він не освітлює всю дорогу, лише кілька метрів попереду. Так само ти зараз відчуваєш: ${a.state}\n\nТуман на дорозі — це ${a.problem} Але герой не стоїть просто через страх: знайоме місце ще й дозволяє ${a.secondaryGain}\n\nСенс цієї історії простий: не треба бачити весь шлях. Достатньо зробити видимим наступний крок і поступово навчитися ${a.meaning}`,
  (a) => `📖 *Історія про важкий рюкзак*\nУяви, що ти несеш рюкзак і з кожним кроком думаєш, що проблема в тобі. Насправді всередині накопичилося те, що звучить так: ${a.state}\n\nНайважчий предмет у рюкзаку — ${a.problem} Викинути його одразу складно, бо він ніби допомагає ${a.secondaryGain}\n\nСенс: сила не в тому, щоб нести все мовчки. Сила — розібрати вагу по частинах і навчитися ${a.meaning}`,
  (a) => `📖 *Історія про міст*\nПеред тобою міст через річку. Ти бачиш інший берег, але перший крок здається важчим за весь шлях. Усередині це відчувається так: ${a.state}\n\nДошка, яка хитається найбільше, — ${a.problem} Ти тримаєшся за старий берег, бо там простіше ${a.secondaryGain}\n\nСенс історії: не потрібно стрибати на інший берег. Один надійний крок за раз допомагає ${a.meaning}`,
  (a) => `📖 *Історія про кімнату з багатьма дверима*\nУяви кімнату, де перед тобою одразу десять дверей. Чим довше вибираєш, тим менше хочеться рухатися. Твій стан зараз схожий на це: ${a.state}\n\nЗамок, який забирає найбільше сил, — ${a.problem} Залишатися в кімнаті легше, бо це дозволяє ${a.secondaryGain}\n\nСенс: не треба відкривати всі двері. Обери одну й навчися ${a.meaning}`,
  (a) => `📖 *Історія про човен*\nТи сидиш у човні, який повільно відносить течією. З берега здається, що треба просто сильніше гребти, але зсередини ти відчуваєш: ${a.state}\n\nТечія, яка збиває курс, — ${a.problem} Не гребти іноді приємніше, бо це допомагає ${a.secondaryGain}\n\nСенс: курс повертається не одним ривком. Маленькі рухи веслом вчать ${a.meaning}`,
  (a) => `📖 *Історія про сад*\nУяви сад, який довго не поливали. Кричати на рослини «рости швидше» безглуздо. У тебе зараз є схожа внутрішня точка: ${a.state}\n\nҐрунт виснажується через те, що ${a.problem} Нічого не змінювати простіше, бо так можна ${a.secondaryGain}\n\nСенс: зміни ростуть із повторюваних умов. Догляд за однією маленькою ділянкою допомагає ${a.meaning}`,
  (a) => `📖 *Історія про світлофор*\nУяви перехрестя, де світлофор занадто довго горить червоним. Ти вже готовий рухатися, але всередині все одно звучить: ${a.state}\n\nЧервоний сигнал підтримує те, що ${a.problem} Стояти на місці безпечніше, бо це дозволяє ${a.secondaryGain}\n\nСенс: іноді зелений сигнал треба створити самому — маленьким дозволеним кроком, який вчить ${a.meaning}`,
  (a) => `📖 *Історія про майстерню*\nУяви майстерню, де на столі лежить багато деталей, але немає зрозумілої інструкції. Майстер не ледачий — він просто не бачить, із чого почати. Ти відчуваєш щось схоже: ${a.state}\n\nЗайве тертя створює те, що ${a.problem} Відкласти роботу легше, бо це допомагає ${a.secondaryGain}\n\nСенс: одна підписана деталь може запустити весь процес і навчити ${a.meaning}`,
  (a) => `📖 *Історія про гору*\nТи дивишся на вершину й мозок одразу рахує весь підйом. Через це всередині виникає: ${a.state}\n\nНайкрутіший схил — ${a.problem} Залишитися внизу приємніше, бо це дозволяє ${a.secondaryGain}\n\nСенс: вершина не є наступним кроком. Наступним кроком є один метр дороги, який поступово вчить ${a.meaning}`,
  (a) => `📖 *Історія про компас*\nУяви, що в тебе є карта, але компас постійно збивається. Ти ніби знаєш, куди хочеш, а всередині відчуваєш: ${a.state}\n\nМагніт, який тягне стрілку вбік, — ${a.problem} Йти за старою стрілкою легше, бо це допомагає ${a.secondaryGain}\n\nСенс: напрям повертається, коли ти перевіряєш один орієнтир за раз і вчишся ${a.meaning}`,
  (a) => `📖 *Історія про батарею*\nУяви пристрій, який постійно працює в режимі енергозбереження. Натискати сильніше на кнопку не означає отримати більше заряду. Ти зараз відчуваєш: ${a.state}\n\nРесурс витрачається через те, що ${a.problem} Режим економії тримається, бо дозволяє ${a.secondaryGain}\n\nСенс: спочатку важливо побачити реальний заряд, а потім поступово навчитися ${a.meaning}`,
  (a) => `📖 *Історія про вузол*\nПеред тобою мотузка з тугим вузлом. Якщо тягнути сильніше з обох боків, він лише затягується. Твоя ситуація зараз відчувається так: ${a.state}\n\nВузол затягує те, що ${a.problem} Не торкатися його простіше, бо це допомагає ${a.secondaryGain}\n\nСенс: вузли розпускають не силою, а точним рухом. Це поступово вчить ${a.meaning}`,
  (a) => `📖 *Історія про годинник*\nУяви годинник, який постійно поспішає або відстає. Звіряти з ним весь день виснажує. Ти відчуваєш схожий внутрішній ритм: ${a.state}\n\nЗбій підтримує те, що ${a.problem} Не переналаштовувати годинник легше, бо це дозволяє ${a.secondaryGain}\n\nСенс: ритм повертається через одну стабільну точку, яка допомагає ${a.meaning}`,
  (a) => `📖 *Історія про вогонь*\nУяви маленький вогонь, який майже згас. Якщо одразу кинути на нього велике поліно, воно може лише придушити полум’я. Ти зараз відчуваєш: ${a.state}\n\nПолум’ю заважає те, що ${a.problem} Не розпалювати його простіше, бо це допомагає ${a.secondaryGain}\n\nСенс: спочатку потрібна маленька тріска — дія, яку реально повторити. Так ти вчишся ${a.meaning}`
];

function buildMirror(atom, frameIndex) {
  return MIRROR_FRAMES[frameIndex](atom);
}

function buildStory(atom, frameIndex) {
  return STORY_FRAMES[frameIndex](atom);
}

function buildThemeExperiences(themeKey) {
  const atoms = buildAtoms(themeKey);
  if (atoms.length !== CORE_COUNT) {
    throw new Error(`${themeKey} must expose exactly ${CORE_COUNT} content cores`);
  }

  const mirror = [];
  const quiz = [];
  const story = [];

  for (let frameIndex = 0; frameIndex < FRAME_COUNT; frameIndex += 1) {
    for (let coreIndex = 0; coreIndex < CORE_COUNT; coreIndex += 1) {
      const atom = atoms[coreIndex];
      mirror.push({ mode: "mirror", frameIndex, coreIndex, text: buildMirror(atom, frameIndex), solution: atom.solution });
      quiz.push({ mode: "quiz", frameIndex, coreIndex, text: buildQuiz(atoms, atom, coreIndex, frameIndex), solution: atom.solution });
      story.push({ mode: "story", frameIndex, coreIndex, text: buildStory(atom, frameIndex), solution: atom.solution });
    }
  }

  return { mirror, quiz, story };
}

export const EXPERIENCE_POOLS = Object.fromEntries(
  Object.keys(THEME_POOLS).map((themeKey) => [themeKey, buildThemeExperiences(themeKey)])
);

export function pickExperience(themeKey, preferredMode = null) {
  const pools = EXPERIENCE_POOLS[themeKey];
  if (!pools) return null;

  const mode = EXPERIENCE_MODES.includes(preferredMode)
    ? preferredMode
    : EXPERIENCE_MODES[Math.floor(Math.random() * EXPERIENCE_MODES.length)];
  const pool = pools[mode] || [];
  if (!pool.length) return null;

  return pool[Math.floor(Math.random() * pool.length)] || null;
}
