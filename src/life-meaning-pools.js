import { getLevelLifeMeaningPool } from "./level-context-pools.js";

const ONE_FRAMES = [
  "Через цю проблему {impact}",
  "У житті ця проблема проявляється так: {impact}",
  "На практиці через цю проблему {impact}",
  "У твоєму щоденному житті {impact}",
  "У звичних справах через цю проблему {impact}",
  "У реальних ситуаціях {impact}",
  "У твоєму ритмі життя {impact}",
  "У повсякденних рішеннях {impact}",
  "З часом через цю проблему {impact}",
  "Поза одним окремим моментом {impact}"
];

const TWO_FRAMES = [
  "Через цю проблему {impact}",
  "У житті ця проблема проявляється так: {impact}",
  "На практиці через цю проблему {impact}",
  "У твоєму щоденному житті {impact}",
  "У звичних справах через цю проблему {impact}",
  "У реальних ситуаціях {impact}",
  "У твоєму ритмі життя {impact}",
  "У повсякденних рішеннях {impact}",
  "З часом через цю проблему {impact}",
  "Поза одним окремим моментом {impact}"
];

const SECOND_SENTENCES = [
  "Це вже заважає не в одному моменті, а в щоденному ритмі",
  "Так проблема переходить у твої звички й рішення",
  "Через це одна тема починає впливати на інші сфери",
  "Так наслідок стає помітним у звичайному дні",
  "Через це ти витрачаєш більше уваги на те, що можна було вирішити простіше",
  "Так проблема поступово займає більше місця у твоєму житті",
  "Через це важче зберігати стабільний ритм",
  "Так повторення впливає на наступні рішення",
  "Через це ти частіше повертаєшся до тієї самої складності",
  "Так проблема починає впливати на твій час",
  "Через це в житті стає менше місця для спокійного темпу",
  "Так один звичний вибір формує наступні",
  "Через це важливі справи отримують менше уваги",
  "Так проблема впливає на твою послідовність",
  "Через це накопичується більше незавершених речей",
  "Так стає складніше бачити реальний прогрес",
  "Через це ти частіше дієш реактивно",
  "Так проблема впливає на відчуття контролю над днем",
  "Через це дрібні рішення забирають більше сил",
  "Так проблема переходить у довший життєвий результат",
  "Через це твій день частіше підлаштовується під проблему",
  "Так стає важче тримати один обраний напрям",
  "Через це ти частіше відкладаєш важливе",
  "Так проблема впливає на впевненість у власних діях",
  "Через це старий спосіб отримує більше місця в житті"
];

const meaningCache = new Map();

const sentence = (text = "") => {
  const value = String(text || "").trim().replace(/[.!?…]+$/u, "");
  return value ? `${value}.` : "";
};

const stripCore = (text = "") =>
  String(text || "")
    .replace(/^У твоєму житті це проявляється так:\s*/u, "")
    .replace(/[.!?…]+$/u, "")
    .trim();

export function getDirectLifeMeaningPool(themeKey, levelKey) {
  const cacheKey = `${themeKey}.${levelKey}`;
  if (meaningCache.has(cacheKey)) return meaningCache.get(cacheKey);
  const cores = getLevelLifeMeaningPool(themeKey, levelKey).slice(0, 25).map(stripCore);
  if (cores.length !== 25 || ONE_FRAMES.length !== 10 || TWO_FRAMES.length !== 10) {
    throw new Error(`${themeKey}/${levelKey}: life meaning source must provide 25 semantic cores`);
  }

  const oneSentence = ONE_FRAMES.flatMap((frame) =>
    cores.map((impact) => sentence(frame.replaceAll("{impact}", impact)))
  );
  const twoSentence = TWO_FRAMES.flatMap((frame) =>
    cores.map((impact, index) =>
      `${sentence(frame.replaceAll("{impact}", impact))} ${sentence(SECOND_SENTENCES[index])}`
    )
  );
  const pool = [...oneSentence, ...twoSentence];
  if (pool.length !== 500 || new Set(pool).size !== 500) {
    throw new Error(`${themeKey}/${levelKey}: life meaning pool must have 500 unique visible texts`);
  }
  meaningCache.set(cacheKey, pool);
  return pool;
}
