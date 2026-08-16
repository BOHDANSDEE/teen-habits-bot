export const POOL_SIZE = 4000;
const HALF_POOL = POOL_SIZE / 2;

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const capitalize = (text = "") => {
  const value = String(text || "").trim();
  return value ? `${value[0].toUpperCase()}${value.slice(1)}` : "";
};

const AREAS = Object.freeze([
  "у дружбі",
  "у сім’ї",
  "у навчанні",
  "у грошах",
  "у здоров’ї",
  "у сні",
  "у побуті",
  "у самооцінці",
  "у майбутньому",
  "у відпочинку",
  "у соцмережах",
  "у роботі",
  "у спорті",
  "у межах",
  "у спілкуванні",
  "у рішеннях",
  "у цілях",
  "в емоціях",
  "у відповідальності",
  "у розвитку"
]);

const BEHAVIORS = Object.freeze([
  ["відкладання", "ти відкладаєш важливе", "не починати складне", "зробити малий крок"],
  ["сумніви", "ти надто довго сумніваєшся", "не робити вибір", "обрати один варіант"],
  ["страх помилки", "ти боїшся помилитися", "не ризикувати", "спробувати безпечний крок"],
  ["перевантаження", "ти береш забагато справ", "нічого не відкидати", "прибрати одну справу"],
  ["мовчання", "ти не кажеш про потреби", "уникати незручної відповіді", "сказати про одну потребу"],
  ["чужа оцінка", "ти залежиш від чужої думки", "менше ризикувати критикою", "назвати свій критерій"],
  ["самокритика", "ти різко критикуєш себе", "ніби тримати контроль", "відділити факт від оцінки"],
  ["уникнення", "ти відходиш, коли складно", "швидко знижувати напругу", "залишитися ще трохи"],
  ["порівняння", "ти порівнюєш себе з іншими", "мати готову мірку", "помітити свій прогрес"],
  ["очікування", "ти чекаєш правильного настрою", "не діяти без бажання", "почати з малого"],
  ["перфекціонізм", "ти боїшся недосконалості", "не показувати сирий результат", "визначити «досить добре»"],
  ["без меж", "ти віддаєш свій час іншим", "не відмовляти іншим", "захистити свій час"],
  ["незавершеність", "ти лишаєш справи незакритими", "довше бути на старті", "закрити одну справу"],
  ["ігнорування втоми", "ти дієш попри втому", "не зупиняти справу", "зробити коротку паузу"],
  ["збій ритму", "ти кидаєш план після збою", "не починати знову", "повернути мінімальний ритм"],
  ["без допомоги", "ти надто довго не просиш допомоги", "не показувати вразливість", "поставити одне питання"],
  ["перемикання", "ти часто міняєш справи", "не лишатися зі складним", "завершити один блок"],
  ["імпульсивність", "ти надто швидко вирішуєш", "швидше прибрати невідомість", "дати собі паузу"],
  ["відкладена розмова", "ти відкладаєш важливу розмову", "уникати можливої незгоди", "підготувати першу фразу"],
  ["уникнення відповідальності", "ти чекаєш зовнішнього поштовху", "ще не брати ризик вибору", "назвати свою дію"]
]);

const CONTEXTS = Object.freeze([
  ["на старті", "у плечах", "менше напруги"],
  ["у метушні", "у шиї", "більше м’якості"],
  ["під оцінкою", "у грудях", "вільніше дихання"],
  ["після помилки", "у животі", "менше стискання"],
  ["під тиском", "у щелепі", "менше затиску"],
  ["при втомі", "у спині", "більше розслаблення"],
  ["коли кажеш «ні»", "у горлі", "менше напруження"],
  ["при розсіянні", "у голові", "більше легкості"],
  ["перед вибором", "у руках", "менше тремтіння"],
  ["після паузи", "у тілі", "більше спокою"]
]);

if (AREAS.length * BEHAVIORS.length * CONTEXTS.length !== POOL_SIZE) {
  throw new Error("shared pool seed space must equal POOL_SIZE");
}

function parts(index) {
  const areaIndex = index % AREAS.length;
  const behaviorIndex = Math.floor(index / AREAS.length) % BEHAVIORS.length;
  const contextIndex = Math.floor(index / (AREAS.length * BEHAVIORS.length)) % CONTEXTS.length;
  return {
    area: AREAS[areaIndex],
    behavior: BEHAVIORS[behaviorIndex],
    context: CONTEXTS[contextIndex]
  };
}

function buildProblems() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [, problem], context: [context] } = parts(index);
    const first = sentence(`${capitalize(problem)} ${area}`);
    const second = sentence(`${capitalize(context)} через це важче діяти вчасно`);
    if (index < HALF_POOL) return `${first} ${second}`;
    return `${first} ${second} ${sentence("Так вибір стає вужчим")}`;
  });
}

function buildGains() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [, , benefit], context: [context] } = parts(index);
    const first = sentence(`${capitalize(context)} тобі легше ${benefit}`);
    const second = sentence(`Тому тобі вигідно залишатися у такому способі дій ${area}`);
    return `${first} ${second}`;
  });
}

function buildMeanings() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label], context: [context] } = parts(index);
    const first = sentence(`${capitalize(label)} ${area} ускладнює рішення ${context}`);
    if (index < HALF_POOL) return first;
    return `${first} ${sentence("Через це важче тримати напрям")}`;
  });
}

function buildAffirmations() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [, , , step], context: [context] } = parts(index);
    const first = sentence(`Я можу ${step} ${area}`);
    const second = sentence(`Я маю право діяти спокійно ${context}`);
    if (index < HALF_POOL) return `${first} ${second}`;
    return `${first} ${second} ${sentence("Я обираю свій темп")}`;
  });
}

function buildResults() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [, , , step], context: [context, body, relief] } = parts(index);
    const first = sentence(`Ти відчуваєш ${relief} ${body}`);
    const second = sentence(`Тепер легше побачити інший спосіб дії: ${step} ${area}`);
    const third = sentence(`Ти краще розумієш наступний крок ${context}`);
    return `${first} ${second} ${third}`;
  });
}

export const INDEPENDENT_LIFE_POOLS = Object.freeze({
  problems: Object.freeze(buildProblems()),
  gains: Object.freeze(buildGains()),
  meanings: Object.freeze(buildMeanings()),
  affirmations: Object.freeze(buildAffirmations()),
  results: Object.freeze(buildResults())
});

function normalizeIndex(index) {
  const numeric = Number.isInteger(index) ? index : 0;
  return ((numeric % POOL_SIZE) + POOL_SIZE) % POOL_SIZE;
}

const deterministicIndices = (index) => {
  const base = normalizeIndex(index);
  return {
    problemIndex: base,
    gainIndex: (base * 137 + 59) % POOL_SIZE,
    meaningIndex: (base * 223 + 113) % POOL_SIZE,
    affirmationIndex: (base * 311 + 197) % POOL_SIZE,
    resultIndex: (base * 419 + 271) % POOL_SIZE
  };
};

const randomIndex = () => Math.floor(Math.random() * POOL_SIZE);

export function getIndependentLifeVariant(requestedVariant = null) {
  const indices = Number.isInteger(requestedVariant)
    ? deterministicIndices(requestedVariant)
    : {
        problemIndex: randomIndex(),
        gainIndex: randomIndex(),
        meaningIndex: randomIndex(),
        affirmationIndex: randomIndex(),
        resultIndex: randomIndex()
      };

  return {
    ...indices,
    problem: INDEPENDENT_LIFE_POOLS.problems[indices.problemIndex],
    gain: INDEPENDENT_LIFE_POOLS.gains[indices.gainIndex],
    meaning: INDEPENDENT_LIFE_POOLS.meanings[indices.meaningIndex],
    affirmation: INDEPENDENT_LIFE_POOLS.affirmations[indices.affirmationIndex],
    result: INDEPENDENT_LIFE_POOLS.results[indices.resultIndex]
  };
}

for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  if (pool.length !== POOL_SIZE || new Set(pool).size !== POOL_SIZE) {
    throw new Error(`${name} pool must contain ${POOL_SIZE} unique visible texts`);
  }
}
