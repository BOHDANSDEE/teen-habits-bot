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
  ["відкладання важливого", "не починати складне одразу", "зробити один малий крок", "ти відкладаєш важливу дію"],
  ["надмірне обдумування", "ще не робити остаточний вибір", "обрати один варіант", "ти занадто довго обдумуєш вибір"],
  ["страх помилки", "не ризикувати невдачею", "спробувати безпечну дію", "ти зупиняєшся через страх помилки"],
  ["перевантаження себе", "не відмовлятися від жодної справи", "прибрати одну зайву справу", "ти береш на себе забагато справ"],
  ["мовчання про потреби", "уникати незручної відповіді", "сказати про одну потребу", "ти мовчиш про те, що тобі потрібно"],
  ["залежність від чужої оцінки", "менше ризикувати несхваленням", "назвати власний критерій", "ти занадто сильно орієнтуєшся на чужу оцінку"],
  ["самокритика після невдачі", "ніби повернути собі контроль", "відділити факт від оцінки себе", "ти різко критикуєш себе після невдачі"],
  ["уникнення складного", "швидко знижувати напругу", "залишитися зі справою ще трохи", "ти відходиш від справи, щойно стає складно"],
  ["порівняння себе з іншими", "мати готову шкалу оцінки", "помітити власний прогрес", "ти часто оцінюєш себе через інших"],
  ["очікування мотивації", "не діяти без сильного настрою", "почати з мінімальної дії", "ти чекаєш сильного бажання перед початком"],
  ["перфекціонізм", "не показувати недосконалий результат", "визначити «достатньо добре»", "ти відкладаєш дію через завищений стандарт"],
  ["відсутність меж у часі", "не відмовляти іншим", "захистити один проміжок часу", "ти дозволяєш чужим справам забирати свій час"],
  ["незавершені справи", "довше залишатися на етапі старту", "закрити одну малу справу", "ти накопичуєш незавершені справи"],
  ["ігнорування втоми", "не зупиняти важливу справу", "зробити коротку паузу", "ти продовжуєш діяти, навіть коли вже виснажився"],
  ["відмова після збою", "не переживати повторний старт", "повернути мінімальний ритм", "ти кидаєш план після одного збою"],
  ["уникнення прохання про допомогу", "не показувати вразливість", "поставити одне чітке запитання", "ти надто довго не просиш про допомогу"],
  ["хаотичне перемикання уваги", "не затримуватися на складному", "завершити один короткий блок", "ти часто перемикаєшся між справами"],
  ["імпульсивне рішення", "швидше позбутися невизначеності", "дати собі коротку паузу", "ти приймаєш рішення занадто швидко"],
  ["відкладання незручної розмови", "не зустрічатися з можливою незгодою", "підготувати першу фразу", "ти відкладаєш важливу розмову"],
  ["відкладання відповідальності", "ще не брати ризик вибору", "назвати свою частину дії", "ти чекаєш зовнішнього поштовху замість своєї дії"]
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
    const { area, behavior: [label, , , problem], context: [context] } = parts(index);
    const first = sentence(`У темі «${area}» ${context} ${problem}`);
    const second = sentence(`Від «${label}» у темі «${area}» важче рухатися далі ${context}`);
    if (index < HALF_POOL) return `${first} ${second}`;
    const third = sentence(`З часом «${label}» звужує твій вибір у темі «${area}» ${context}`);
    return `${first} ${second} ${third}`;
  });
}

function buildGains() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label, benefit], context: [context] } = parts(index);
    const first = sentence(`Так ${context} у темі «${area}» можна ${benefit}`);
    const second = sentence(
      `Тому тобі вигідно залишатися у знайомому способі: «${label}» дає цю користь ${context} у темі «${area}»`
    );
    return `${first} ${second}`;
  });
}

function buildMeanings() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label], context: [context] } = parts(index);
    const first = sentence(`У темі «${area}» «${label}» ускладнює рішення ${context}`);
    if (index < HALF_POOL) return first;
    const second = sentence(`Через «${label}» у темі «${area}» важче тримати напрям ${context}`);
    return `${first} ${second}`;
  });
}

function buildAffirmations() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label, , step], context: [context] } = parts(index);
    const first = sentence(`Я можу ${step} у темі «${area}» ${context}`);
    const second = sentence(
      `Я маю право відходити від «${label}» у своєму темпі в темі «${area}» ${context}`
    );
    if (index < HALF_POOL) return `${first} ${second}`;
    const third = sentence(`Я обираю ${step} у темі «${area}» ${context}`);
    return `${first} ${second} ${third}`;
  });
}

function buildResults() {
  return Array.from({ length: POOL_SIZE }, (_, index) => {
    const { area, behavior: [label, , step], context: [context, body, relief] } = parts(index);
    const first = sentence(
      `Ти відчуваєш полегшення ${body}: ${relief} через «${label}» у темі «${area}»`
    );
    const second = sentence(
      `Тепер тобі стало легше побачити інший спосіб дії: ${step} у темі «${area}» ${context}`
    );
    const third = sentence(
      `Тобі стало зрозуміліше, який крок зробити далі: ${step} у темі «${area}» ${context}`
    );
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
