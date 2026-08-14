const POOL_SIZE = 500;

const BODY_ZONES = [
  "у голові",
  "у лобі",
  "у скронях",
  "у потилиці",
  "в очах",
  "у щелепі",
  "у шиї",
  "у плечах",
  "між лопатками",
  "у спині",
  "у попереку",
  "у грудях",
  "у животі",
  "у передпліччях",
  "у зап’ястях",
  "у долонях",
  "у пальцях",
  "у руках",
  "у стегнах",
  "у колінах",
  "у литках",
  "у щиколотках",
  "у п’ятах",
  "у стопах",
  "у ногах"
];

const BODY_VARIANTS = [
  {
    states: ["біль", "легкий біль", "помітний біль", "сильніший біль"],
    results: [
      "полегшення",
      "легке полегшення від болю",
      "помітне полегшення від болю",
      "полегшення і менший біль"
    ]
  },
  {
    states: ["важкість", "легку важкість", "помітну важкість", "більшу важкість"],
    results: [
      "полегшення від важкості",
      "легке полегшення від важкості",
      "помітне полегшення від важкості",
      "полегшення і меншу важкість"
    ]
  },
  {
    states: ["напругу", "легку напругу", "помітну напругу", "сильнішу напругу"],
    results: [
      "полегшення від напруги",
      "легке полегшення від напруги",
      "помітне полегшення від напруги",
      "полегшення і меншу напругу"
    ]
  },
  {
    states: ["втому", "легку втому", "помітну втому", "сильнішу втому"],
    results: [
      "полегшення від втоми",
      "легке полегшення від втоми",
      "помітне полегшення від втоми",
      "полегшення і меншу втому"
    ]
  },
  {
    states: ["тиск", "легкий тиск", "помітний тиск", "сильніший тиск"],
    results: [
      "полегшення від тиску",
      "легке полегшення від тиску",
      "помітне полегшення від тиску",
      "полегшення і менший тиск"
    ]
  }
];

const STATE_FORMS = BODY_VARIANTS.flatMap((group) => group.states);
const RESULT_FORMS = BODY_VARIANTS.flatMap((group) => group.results);

if (BODY_ZONES.length !== 25 || STATE_FORMS.length !== 20 || RESULT_FORMS.length !== 20) {
  throw new Error("Direct body pools require 25 body zones × 20 simple forms");
}

const rotate = (items, amount) => items.map((_, index) => items[(index + amount) % items.length]);

const PRIMARY_ZONES = {
  lazy: BODY_ZONES,
  apathy: rotate(BODY_ZONES, 8),
  procrastination: rotate(BODY_ZONES, 16)
};

function makeStates(zones) {
  return zones.flatMap((zone) => STATE_FORMS.map((state) => `Ти відчуваєш ${state} ${zone}.`));
}

function makeResults(zones) {
  return zones.flatMap((zone) => RESULT_FORMS.map((result) => `Тепер ти відчуваєш ${result} ${zone}.`));
}

export const POSITIVE_RESULT_DETAILS = [
  ...RESULT_FORMS.map((result) => `Тепер ти відчуваєш ${result} у тілі.`),
  "Тепер ти відчуваєш полегшення у спині.",
  "Тепер ти відчуваєш полегшення у плечах.",
  "Тепер ти відчуваєш полегшення у руках.",
  "Тепер ти відчуваєш полегшення у стопах.",
  "Тепер ти відчуваєш полегшення у ногах."
];

export const PRIMARY_BODY_STATES = Object.fromEntries(
  Object.entries(PRIMARY_ZONES).map(([themeKey, zones]) => [themeKey, makeStates(zones)])
);

export const PRIMARY_BODY_RESULTS = Object.fromEntries(
  Object.entries(PRIMARY_ZONES).map(([themeKey, zones]) => [themeKey, makeResults(zones)])
);

export const GENERIC_DIRECT_STATES = makeStates(BODY_ZONES);
export const GENERIC_DIRECT_RESULTS = makeResults(BODY_ZONES);

for (const [name, pool] of Object.entries({
  ...Object.fromEntries(Object.entries(PRIMARY_BODY_STATES).map(([key, value]) => [`state:${key}`, value])),
  ...Object.fromEntries(Object.entries(PRIMARY_BODY_RESULTS).map(([key, value]) => [`result:${key}`, value])),
  genericStates: GENERIC_DIRECT_STATES,
  genericResults: GENERIC_DIRECT_RESULTS
})) {
  if (pool.length !== POOL_SIZE || new Set(pool).size !== POOL_SIZE) {
    throw new Error(`${name} must contain ${POOL_SIZE} unique visible variants`);
  }
}
