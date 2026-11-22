// Ember Court — a small seeded random generator so staged screenshot
// scenes and the autopilot play the same hand every time.
export function makeRandom(seed) {
  let state = (seed >>> 0) || 1;
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    },
    int(max) {
      return Math.floor(this.next() * max);
    },
    pick(list) {
      return list[this.int(list.length)];
    },
  };
}

export function shuffleDeck(deck, rng) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const held = deck[i];
    deck[i] = deck[j];
    deck[j] = held;
  }
  return deck;
}
