import {
  POOL_SIZE,
  INDEPENDENT_LIFE_POOLS as BASE_POOLS
} from "./independent-life-pools-v3.js";

const gains = Object.freeze(BASE_POOLS.gains.map((text) =>
  text
    .replace(/^Ненадовго /u, "Недовго ")
    .replace(/^Спочатку /u, "Спершу ")
    .replace(/^У цей момент /u, "Тут ")
    .replace(/^Коротко /u, "Тоді ")
    .replace(/^Тимчасово /u, "Поки ")
    .replace(" — фактично ", " — бо так ")
    .replace(" — саме так ", " — тоді ")
    .replace(" — тимчасово ", " — на мить ")
    .replace("не треба лишатися з собою", "не треба бути наодинці")
    .replace("ти весь час зайнятий чужими справами", "ти зайнятий чужими справами")
));

const meanings = Object.freeze(BASE_POOLS.meanings.map((text) =>
  text
    .replace(" працює так: ", " — ")
    .replace(" варто знати: ", " суть: ")
    .replace(" просте правило: ", " правило: ")
    .replace(" важлива річ: ", " головне: ")
    .replace(" суть проста: ", " запам’ятай: ")
    .replace(" варто пам’ятати: ", " пам’ятай: ")
));

export { POOL_SIZE };

export const INDEPENDENT_LIFE_POOLS = Object.freeze({
  problems: BASE_POOLS.problems,
  gains,
  meanings,
  affirmations: BASE_POOLS.affirmations,
  results: BASE_POOLS.results
});

for (const [name, pool] of Object.entries(INDEPENDENT_LIFE_POOLS)) {
  if (pool.length !== POOL_SIZE || new Set(pool).size !== POOL_SIZE) {
    throw new Error(`${name} pool must contain ${POOL_SIZE} unique visible texts`);
  }
}

const randomIndex = () => Math.floor(Math.random() * POOL_SIZE);

export function getIndependentLifeVariant(requestedVariant = null) {
  let problemIndex;
  let gainIndex;
  let meaningIndex;
  let affirmationIndex;
  let resultIndex;

  if (Number.isInteger(requestedVariant)) {
    const base = ((requestedVariant % POOL_SIZE) + POOL_SIZE) % POOL_SIZE;
    problemIndex = base;
    gainIndex = (base * 137 + 59) % POOL_SIZE;
    meaningIndex = (base * 223 + 113) % POOL_SIZE;
    affirmationIndex = (base * 311 + 197) % POOL_SIZE;
    resultIndex = (base * 419 + 271) % POOL_SIZE;
  } else {
    problemIndex = randomIndex();
    gainIndex = randomIndex();
    meaningIndex = randomIndex();
    affirmationIndex = randomIndex();
    resultIndex = randomIndex();
  }

  return {
    problemIndex,
    gainIndex,
    meaningIndex,
    affirmationIndex,
    resultIndex,
    problem: INDEPENDENT_LIFE_POOLS.problems[problemIndex],
    gain: INDEPENDENT_LIFE_POOLS.gains[gainIndex],
    meaning: INDEPENDENT_LIFE_POOLS.meanings[meaningIndex],
    affirmation: INDEPENDENT_LIFE_POOLS.affirmations[affirmationIndex],
    result: INDEPENDENT_LIFE_POOLS.results[resultIndex]
  };
}
