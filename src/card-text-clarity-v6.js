import * as base from "./card-text-clarity-v5.js";

export * from "./card-text-clarity-v5.js";

const SLEEP_ROUTINE = Object.freeze({
  themeKey: "sleep",
  subtopicKey: "routine",
  name: "Підготовка до сну"
});

const PROBLEM_FIRST = Object.freeze([
  "Ти щовечора по-різному переходиш від справ до сну",
  "Ти часто займаєшся справами до самого моменту, коли вже треба лягати",
  "Увечері ти не залишаєш собі кілька хвилин, щоб спокійно завершити день",
  "Ти переходиш від активних справ до сну без звичного порядку",
  "Перед сном ти щоразу по-різному закінчуєш справи",
  "Ти часто лягаєш одразу після справ, не даючи собі часу переключитися",
  "Увечері ти не маєш кількох простих кроків, які допомагають завершити справи",
  "Ти завершуєш вечір без зрозумілої послідовності перед сном",
  "Ти щоразу по-новому вирішуєш, як закінчити вечір",
  "Перед сном ти продовжуєш активні справи майже до останньої хвилини"
]);

const PROBLEM_COST = Object.freeze([
  "Через це тобі важче перейти від справ до відпочинку",
  "Через це засинання частіше зсувається на пізніше",
  "Через це голова довше лишається в режимі справ",
  "Через це тобі важче відчути, що активний день уже завершився",
  "Через це тобі складніше вчасно зупинитися й готуватися до сну",
  "Через це перед сном залишається більше метушні",
  "Через це ти довше носиш у голові денні справи",
  "Через це час сну легше зсувається",
  "Через це перехід до сну щоразу забирає більше уваги",
  "Через це ти частіше лягаєш пізніше, ніж планував"
]);

const PROBLEM_TAIL = Object.freeze([
  "Так режим сну легше збивається",
  "Так наступного ранку може бракувати сил",
  "Так вечір частіше затягується",
  "Так заснути вчасно стає важче",
  "Так тілу й увазі важче перейти до відпочинку",
  "Так ти частіше відкладаєш сон ще трохи",
  "Так підготовка до сну починається запізно",
  "Так вечір стає менш передбачуваним",
  "Так спокій перед сном з’являється пізніше",
  "Так запланований час сну легше пропустити"
]);

const GAIN_BENEFIT = Object.freeze([
  "не витрачаєш час на окрему підготовку до сну",
  "можеш займатися своїми справами майже до самого сну",
  "не треба заздалегідь зупиняти вечірні справи",
  "можеш лягти спати одразу, коли вирішиш завершити день",
  "не потрібно продумувати кілька кроків перед сном",
  "можеш довше залишатися в активному темпі ввечері",
  "не витрачаєш вечір на однакові дії перед сном",
  "можеш завершувати вечір так, як зручно саме цього дня",
  "не треба виділяти окремий час на підготовку до сну",
  "можеш не переривати цікаву справу завчасно",
  "не мусиш дотримуватися одного порядку перед сном",
  "можеш довше не думати про те, що день уже треба завершувати",
  "не потрібно зупиняти телефон, навчання чи інші справи в один час",
  "можеш переходити до сну без додаткових кроків",
  "не треба готуватися до сну заздалегідь",
  "можеш продовжувати вечір, поки сам не вирішиш лягати",
  "не витрачаєш сили на те, щоб тримати один вечірній порядок",
  "можеш щоразу завершувати день по-різному",
  "не треба пам’ятати про кілька дій перед сном",
  "можеш залишити підготовку до сну на останні хвилини"
]);

const GAIN_REASON = Object.freeze([
  "можна довше займатися своїми справами",
  "не треба відриватися від цікавого заздалегідь",
  "вечір не потрібно підлаштовувати під план",
  "можна відкласти підготовку до останньої хвилини",
  "не треба зупинятися, поки самому не захочеться спати",
  "можна залишити більше часу на телефон або справи",
  "не потрібно повторювати один порядок щовечора",
  "можна діяти за настроєм, а не за планом",
  "не треба залишати окремий час перед сном",
  "можна не переривати заняття завчасно",
  "не потрібно змінювати звичний вечір",
  "можна ще трохи продовжити день",
  "не треба робити паузу між справами й сном",
  "можна просто лягти, коли вже вирішив",
  "не потрібно думати про підготовку наперед",
  "можна довше залишатися в активному темпі",
  "не треба тримати один і той самий порядок",
  "можна щоразу завершувати день по-своєму",
  "не потрібно пам’ятати про окремі кроки",
  "можна не зупиняти вечірні справи раніше"
]);

const MEANING_FIRST = Object.freeze([
  "Кілька спокійних дій перед сном допомагають швидше перейти від справ до відпочинку",
  "Простий порядок перед сном допомагає вчасно завершити активний день",
  "Коли вечір має зрозуміле завершення, голові легше перестати триматися за денні справи",
  "Спокійна підготовка до сну допомагає не переносити денний темп прямо в ліжко",
  "Кілька знайомих кроків перед сном роблять завершення дня простішим",
  "Коротка послідовність перед сном допомагає помітити, що час зупиняти справи",
  "Зрозумілий порядок увечері допомагає менше торгуватися із собою про ще одну справу",
  "Коротка підготовка до сну допомагає відділити час справ від часу відпочинку",
  "Кілька простих кроків перед сном допомагають завершувати вечір спокійніше",
  "Кілька хвилин спокійного завершення дня допомагають легше перейти до сну"
]);

const MEANING_TAIL = Object.freeze([
  "Так час сну стає передбачуванішим",
  "Так легше лягати приблизно в один час",
  "Так вечір менше затягується",
  "Так у ліжко потрапляє менше денного поспіху",
  "Так простіше вчасно завершити день",
  "Так підготовка до сну не починається в останню хвилину",
  "Так менше шансів затягнути вечір ще однією справою",
  "Так відпочинок починається раніше, а не після повного виснаження",
  "Так вечір стає спокійнішим і зрозумілішим",
  "Так режим сну легше підтримувати кілька днів поспіль"
]);

const AFFIRMATION_STATEMENTS = Object.freeze([
  "Я спокійно завершую справи перед сном.",
  "Я роблю кілька простих дій перед сном.",
  "Я залишаю денні справи до завтра.",
  "Я готуюся до сну без поспіху.",
  "Я завершую вечір у зрозумілому порядку."
]);

const ORDERED_PAIRS = Object.freeze(
  Array.from({ length: 5 }, (_, first) =>
    Array.from({ length: 5 }, (_, second) => [first, second]).filter(([a, b]) => a !== b)
  ).flat()
);

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const problems = [...base.INDEPENDENT_LIFE_POOLS.problems];
const gains = [...base.INDEPENDENT_LIFE_POOLS.gains];
const meanings = [...base.INDEPENDENT_LIFE_POOLS.meanings];
const affirmations = [...base.INDEPENDENT_LIFE_POOLS.affirmations];

const problemIndices = base.getLifeSubtopicPoolIndices(SLEEP_ROUTINE.themeKey, SLEEP_ROUTINE.subtopicKey, "problems");
const gainIndices = base.getLifeSubtopicPoolIndices(SLEEP_ROUTINE.themeKey, SLEEP_ROUTINE.subtopicKey, "gains");
const meaningIndices = base.getLifeSubtopicPoolIndices(SLEEP_ROUTINE.themeKey, SLEEP_ROUTINE.subtopicKey, "meanings");
const affirmationIndices = base.getLifeSubtopicPoolIndices(SLEEP_ROUTINE.themeKey, SLEEP_ROUTINE.subtopicKey, "affirmations");

for (let style = 0; style < base.LIFE_SUBTOPIC_POOL_SIZE; style += 1) {
  const local = style % 10;
  const problem = `${sentence(PROBLEM_FIRST[local])} ${sentence(PROBLEM_COST[local])}`;
  problems[problemIndices[style]] = style < 10
    ? problem
    : `${problem} ${sentence(PROBLEM_TAIL[local])}`;

  gains[gainIndices[style]] = `${sentence(`У такому способі дії ти ${GAIN_BENEFIT[style]}`)} ${sentence(`Тому тобі вигідно залишатися у такому способі дій — ${GAIN_REASON[style]}`)}`;

  meanings[meaningIndices[style]] = style < 10
    ? sentence(MEANING_FIRST[local])
    : `${sentence(MEANING_FIRST[local])} ${sentence(MEANING_TAIL[local])}`;

  const [first, second] = ORDERED_PAIRS[style];
  affirmations[affirmationIndices[style]] = `${AFFIRMATION_STATEMENTS[first]} ${AFFIRMATION_STATEMENTS[second]}`;
}

for (const [name, pool] of Object.entries({ problems, gains, meanings, affirmations })) {
  if (pool.length !== base.POOL_SIZE || new Set(pool).size !== base.POOL_SIZE || pool.some((text) => !text)) {
    throw new Error(`${name} must remain exactly ${base.POOL_SIZE} unique visible texts`);
  }
}

export const LIFE_RANDOM_THEMES = Object.freeze(base.LIFE_RANDOM_THEMES.map((theme) => {
  if (theme.key !== SLEEP_ROUTINE.themeKey) return theme;
  return Object.freeze({
    ...theme,
    subtopics: Object.freeze(theme.subtopics.map((subtopic) =>
      subtopic.key === SLEEP_ROUTINE.subtopicKey
        ? Object.freeze({ ...subtopic, name: SLEEP_ROUTINE.name })
        : subtopic
    ))
  });
}));

export const INDEPENDENT_LIFE_POOLS = Object.freeze({
  ...base.INDEPENDENT_LIFE_POOLS,
  problems: Object.freeze(problems),
  gains: Object.freeze(gains),
  meanings: Object.freeze(meanings),
  affirmations: Object.freeze(affirmations)
});

export function getIndependentLifeVariant(requestedVariant = null) {
  const variant = base.getIndependentLifeVariant(requestedVariant);
  const isSleepRoutine = variant.themeKey === SLEEP_ROUTINE.themeKey && variant.subtopicKey === SLEEP_ROUTINE.subtopicKey;
  return {
    ...variant,
    subtopicName: isSleepRoutine ? SLEEP_ROUTINE.name : variant.subtopicName,
    problem: INDEPENDENT_LIFE_POOLS.problems[variant.problemIndex],
    gain: INDEPENDENT_LIFE_POOLS.gains[variant.gainIndex],
    meaning: INDEPENDENT_LIFE_POOLS.meanings[variant.meaningIndex],
    affirmation: INDEPENDENT_LIFE_POOLS.affirmations[variant.affirmationIndex]
  };
}
