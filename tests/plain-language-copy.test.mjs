import assert from "node:assert/strict";
import { INDEPENDENT_LIFE_POOLS, POOL_SIZE } from "../src/independent-life-pools.js";

const splitSentences = (text) => String(text).match(/[^.!?…]+[.!?…](?=\s|$)/gu) || [];

assert.equal(POOL_SIZE, 4000);

for (const text of INDEPENDENT_LIFE_POOLS.problems) {
  const sentences = splitSentences(text).map((part) => part.trim());
  assert.ok(sentences.length === 2 || sentences.length === 3);
  assert.match(
    sentences[1],
    /^(Через це|Тому|Від цього|В результаті)/u,
    `problem consequence must be direct: ${sentences[1]}`
  );
}

for (const text of INDEPENDENT_LIFE_POOLS.gains) {
  const [relief, reason] = splitSentences(text).map((part) => part.trim());
  assert.ok(relief.length >= 18, `secondary gain must name a concrete short relief: ${relief}`);
  assert.match(reason, /^Тому тобі вигідно залишатися у такому способі дій/u);
  assert.match(reason, /ти\s/u, `secondary gain must say what the person avoids or gets: ${reason}`);
}

for (const text of INDEPENDENT_LIFE_POOLS.meanings) {
  assert.match(
    text,
    /У дружбі|У сім[’']ї|У навчанні|У грошах|У здоров[’']ї|У сні|У побуті|У самооцінці|У майбутньому|У відпочинку|У соцмережах|У роботі|У спорті|У особистих межах|У спілкуванні|У рішеннях|У цілях|В емоціях|У відповідальності|У особистому розвитку/u
  );
  assert.doesNotMatch(text, /прояснювати важливе|у звичних ситуаціях|важливе у звичних/u);
}

for (const text of INDEPENDENT_LIFE_POOLS.affirmations) {
  for (const sentence of splitSentences(text)) {
    assert.match(sentence.trim(), /^Я\s/u);
  }
  assert.doesNotMatch(
    text,
    /подивитися на одну цифру|перевіряти крок за кроком|одну цифру|один пункт без контексту/u,
    `affirmation must sound natural when repeated aloud: ${text}`
  );
}

const overworkProblem = INDEPENDENT_LIFE_POOLS.problems[19];
assert.match(overworkProblem, /ти працюєш до виснаження/u);
assert.match(overworkProblem, /Через це ти не відпочиваєш вчасно/u);

const familyMeaning = INDEPENDENT_LIFE_POOLS.meanings[2];
assert.match(familyMeaning, /У сім[’']ї/u);
assert.match(familyMeaning, /потреби краще називати/u);

const moneyAffirmation = INDEPENDENT_LIFE_POOLS.affirmations[7];
assert.doesNotMatch(moneyAffirmation, /одну цифру/u);
assert.match(moneyAffirmation, /Я /u);

const forbiddenOldCopy = /можливе «ні»|прояснювати важливе|подивитися на одну цифру|перфекціонізм у спорті|малий крок у відпочинку|під оцінкою/u;
assert.doesNotMatch(Object.values(INDEPENDENT_LIFE_POOLS).flat().join(" "), forbiddenOldCopy);

console.log("✅ Plain-language copy: direct consequences, concrete gains, clear meanings, natural affirmations");
