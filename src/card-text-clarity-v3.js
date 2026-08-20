import * as base from "./card-text-clarity-v2.js";

export * from "./card-text-clarity-v2.js";

const SHORTEN = Object.freeze([
  ["якщо все лишається як є,", "якщо лишити все як є,"],
  ["якщо нічого не змінювати,", "якщо нічого не міняти,"],
  ["коли старий спосіб повторюється,", "коли це повторюється,"],
  ["якщо звичка не змінюється,", "якщо це не змінити,"],
  ["коли це триває далі,", "коли так триває,"],
  ["якщо лишати все по-старому,", "якщо лишити по-старому,"],
  ["з часом без зміни", "з часом"]
]);

function shortenMeaning(text) {
  let value = String(text || "");
  for (const [from, to] of SHORTEN) value = value.replaceAll(from, to);
  return value;
}

const meanings = Object.freeze(base.INDEPENDENT_LIFE_POOLS.meanings.map(shortenMeaning));

if (meanings.length !== base.POOL_SIZE || new Set(meanings).size !== base.POOL_SIZE) {
  throw new Error(`meanings must remain exactly ${base.POOL_SIZE} unique visible texts`);
}

export const INDEPENDENT_LIFE_POOLS = Object.freeze({
  ...base.INDEPENDENT_LIFE_POOLS,
  meanings
});

export function getIndependentLifeVariant(requestedVariant = null) {
  const variant = base.getIndependentLifeVariant(requestedVariant);
  return {
    ...variant,
    meaning: meanings[variant.meaningIndex]
  };
}
