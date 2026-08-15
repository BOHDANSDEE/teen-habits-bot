export const POOL_SIZE = 4000;
const HALF_POOL = POOL_SIZE / 2;

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const AREAS = Object.freeze([
  "дружба й стосунки",
  "сім’я",
  "навчання",
  "гроші",
  "здоров’я",
  "сон",
  "побут",
  "самооцінка",
  "майбутнє",
  "відпочинок",
  "соцмережі",
  "робота",
  "спорт",
  "особисті межі",
  "спілкування",
  "рішення",
  "цілі",
  "емоції",
  "відповідальність",
  "особистий розвиток"
]);

const BEHAVIORS = Object.freeze([
  ["відкладання важливого", "не починати складне одразу", "зробити один малий крок"],
  ["надмірне обдумування", "ще не робити остаточний вибір", "обрати один варіант"],
  ["страх помилки", "не ризикувати невдачею", "спробувати безпечну дію"],
  ["перевантаження себе", "не відмовлятися від жодної справи", "прибрати одну зайву справу"],
  ["мовчання про потреби", "уникати незручної відповіді", "сказати про одну потребу"],
  ["залежність від чужої оцінки", "менше ризикувати несхваленням", "назвати власний критерій"],
  ["самокритика після невдачі", "ніби повернути собі контроль", "відділити факт від оцінки себе"],
  ["уникнення складного", "швидко знижувати напругу", "залишитися зі справою ще трохи"],
  ["порівняння себе з іншими", "мати готову шкалу оцінки", "помітити власний прогрес"],
  ["очікування мотивації", "не діяти без сильного настрою", "почати з мінімальної дії"],
  ["перфекціонізм", "не показувати недосконалий результат", "визначити «достатньо добре»"],
  ["відсутність меж у часі", "не відмовляти іншим", "захистити один проміжок часу"],
  ["незавершені справи", "довше залишатися на етапі старту", "закрити одну малу справу"],
  ["ігнорування втоми", "не зупиняти важливу справу", "зробити коротку паузу"],
  ["відмова після збою", "не переживати повторний старт", "повернути мінімальний ритм"],
  ["уникнення прохання про допомогу", "не показувати вразливість", "поставити одне чітке запитання"],
  ["хаотичне перемикання уваги", "не затримуватися на складному", "завершити один короткий блок"],
  ["імпульсивне рішення", "швидше позбутися невизначеності", "дати собі коротку паузу"],
  ["відкладання незручної розмови", "не зустрічатися з можливою незгодою", "підготувати першу фразу"],
  ["відкладання відповідальності", "ще не брати ризик вибору", "назвати свою частину дії"]
]);

const CONTEXTS = Object.freeze([
  ["коли треба почати", "у плечах", "менше напруги"],
  ["у завантажений день", "у шиї", "більше м’якості"],
  ["під чужими очікуваннями", "у грудях", "вільніше дихання"],
  ["після помилки", "у животі", "менше стискання"],
  ["коли результат дуже важливий", "у щелепі", "менше затиску"],
  ["коли бракує сил", "у спині", "більше розслаблення"],
  ["коли треба сказати «ні»", "у горлі", "менше напруження"],
  ["коли увага розсіюється", "у голові", "більше легкості"],
  ["перед важливим рішенням", "у руках", "менше тремтіння"],
  ["коли треба повернутися до справи", "у тілі", "більше спокою"]
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
    const { area, behavior: [label, , step], context: [context] } = parts(index);
    const first = sentence(`У темі «${area}» ${context} проявляється «${label}»`);
    const second = sentence(`Через «${label}» ${context} важливий крок у темі «${area}» відкладається`);
    if (index < HALF_POOL) return `${first} ${second}`;
    const third = sentence(`Новий варіант ${context}: ${step} у темі «${area}»`);
    return `${first} ${second} ${third}`;
  });
}

function buildGains() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label, benefit], context: [context] } = parts(index);
    const first = sentence(`У темі «${area}» «${label}» дає короткий комфорт ${context}`);
    const second = sentence(`Тому тобі вигідно залишатися в проблемі ${context}: так можна ${benefit} у темі «${area}»`);
    return `${first} ${second}`;
  });
}

function buildMeanings() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label], context: [context] } = parts(index);
    const first = sentence(`«${label}» звужує вибір у темі «${area}» ${context}`);
    if (index < HALF_POOL) return first;
    const second = sentence(`Через «${label}» ${context} у темі «${area}» важче діяти по-своєму`);
    return `${first} ${second}`;
  });
}

function buildAffirmations() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label, , step], context: [context] } = parts(index);
    const first = sentence(`Я можу ${context} у темі «${area}» не йти за «${label}»`);
    const second = sentence(`Я обираю ${step} у темі «${area}» ${context}`);
    if (index < HALF_POOL) return `${first} ${second}`;
    const third = sentence(`Я змінюю «${label}» у темі «${area}» ${context} без поспіху`);
    return `${first} ${second} ${third}`;
  });
}

function buildResults() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label, , step], context: [context, body, relief] } = parts(index);
    const first = sentence(`Ти відчуваєш полегшення ${body}: ${relief} через «${label}» у темі «${area}»`);
    const second = sentence(`Тепер тобі стало легше побачити інший спосіб дії: ${step} у темі «${area}» ${context}`);
    const third = sentence(`Тобі стало зрозуміліше, який крок зробити далі: ${step} у темі «${area}» ${context}`);
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
