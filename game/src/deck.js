// Ember Court — the deck: every card the duel can deal.
// A card is one idea: an element, a cost in ember, a power, and a kind.
//   strike — deal its power as damage to the other duelist.
//   aegis  — gain its power as shield (shield absorbs damage first).
//   surge  — gain ember equal to its power and draw a card.
// Kinds are told apart by colour, glyph and word, never by text alone.
import { CONFIG } from './config.js';

const KIND_GLYPH = { strike: '⚔', aegis: '⛨', surge: '✦' };
const KIND_WORD = { strike: 'STRIKE', aegis: 'AEGIS', surge: 'SURGE' };

// The deck list: [element, kind, power, cost]. Cost roughly tracks power so
// no single card is free, and every element has every kind.
const DECK_LIST = [
  ['flame', 'strike', 6, 4], ['flame', 'strike', 5, 3], ['flame', 'strike', 4, 3],
  ['flame', 'strike', 3, 2], ['flame', 'strike', 2, 1], ['flame', 'aegis', 4, 3],
  ['flame', 'aegis', 2, 1], ['flame', 'surge', 3, 2],
  ['tide', 'strike', 6, 4], ['tide', 'strike', 5, 3], ['tide', 'strike', 4, 3],
  ['tide', 'strike', 3, 2], ['tide', 'strike', 2, 1], ['tide', 'aegis', 5, 3],
  ['tide', 'aegis', 3, 2], ['tide', 'surge', 2, 1],
  ['leaf', 'strike', 5, 3], ['leaf', 'strike', 4, 3], ['leaf', 'strike', 3, 2],
  ['leaf', 'strike', 2, 1], ['leaf', 'strike', 6, 4], ['leaf', 'aegis', 4, 2],
  ['leaf', 'aegis', 3, 2], ['leaf', 'surge', 3, 2],
  ['stone', 'strike', 6, 4], ['stone', 'strike', 4, 2], ['stone', 'strike', 3, 2],
  ['stone', 'strike', 2, 1], ['stone', 'aegis', 6, 4], ['stone', 'aegis', 4, 3],
  ['stone', 'aegis', 2, 1], ['stone', 'surge', 2, 1],
];

const CARD_NAMES = {
  'flame-strike': ['Cinder Slash', 'Pyre Fang', 'Ember Lash', 'Wildfire', 'Spark Bite'],
  'flame-aegis': ['Ashen Guard', 'Coal Ward'],
  'flame-surge': ['Kindle'],
  'tide-strike': ['Riptide', 'Drowned Edge', 'Undertow', 'Foam Cut', 'Cold Snap'],
  'tide-aegis': ['Stillwater', 'Reef Wall'],
  'tide-surge': ['Springwell'],
  'leaf-strike': ['Thorn Whip', 'Bramble Cut', 'Root Snare', 'Vine Lash', 'Canopy Fall'],
  'leaf-aegis': ['Barkskin', 'Moss Mantle'],
  'leaf-surge': ['Bloom'],
  'stone-strike': ['Quake Fist', 'Gravel Shot', 'Boulder Roll', 'Pebble Jab'],
  'stone-aegis': ['Granite Wall', 'Palisade', 'Stonehide'],
  'stone-surge': ['Ore Vein'],
};

let serial = 0;

export function makeCard(element, kind, power, cost, name) {
  serial += 1;
  return {
    id: `c${serial}`,
    element,
    kind,
    power,
    cost,
    name,
    glyph: KIND_GLYPH[kind],
    word: KIND_WORD[kind],
  };
}

export function buildDeck() {
  const usedNames = {};
  const deck = DECK_LIST.map(([element, kind, power, cost]) => {
    const key = `${element}-${kind}`;
    const pool = CARD_NAMES[key];
    const taken = usedNames[key] ?? 0;
    usedNames[key] = taken + 1;
    return makeCard(element, kind, power, cost, pool[taken % pool.length]);
  });
  return deck;
}

export function elementOf(card) {
  return CONFIG.elements[card.element];
}

// A one-line summary of a card, for the play log.
export function describeCard(card) {
  return `${card.name} (${elementOf(card).name} ${card.word} ${card.power}, ${card.cost} ember)`;
}
