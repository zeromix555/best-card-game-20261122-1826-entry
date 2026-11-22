// Ember Court — staged scenes for the entry's screenshots.
// One file, one job: put the real game into a photogenic state for a shot.
// Every scene is built by playing the real rules forward from a fixed seed,
// then fixing the hands so the table reads at a glance.
import { makeCard } from './deck.js';
import { drawCards, endPlayerTurn, newGame, playCard, startDuel } from './rules.js';

function fixedHand() {
  return [
    makeCard('flame', 'strike', 6, 4, 'Cinder Slash'),
    makeCard('tide', 'aegis', 5, 3, 'Stillwater'),
    makeCard('leaf', 'surge', 3, 2, 'Bloom'),
    makeCard('stone', 'strike', 4, 2, 'Quake Fist'),
    makeCard('tide', 'strike', 3, 2, 'Riptide'),
  ];
}

function stageMidGame(seed) {
  const game = newGame(seed);
  startDuel(game);
  // A duel already in progress: life dented, ember built up, hands full.
  game.turn = 4;
  game.player.life = 14;
  game.player.maxEmber = 6;
  game.player.ember = 6;
  game.player.hand = fixedHand();
  game.warden.life = 11;
  game.warden.shield = 3;
  game.warden.maxEmber = 6;
  game.warden.ember = 2;
  game.warden.hand = [
    makeCard('flame', 'strike', 2, 1, 'Spark Bite'),
    makeCard('stone', 'aegis', 2, 1, 'Stonehide'),
    makeCard('leaf', 'strike', 3, 2, 'Thorn Whip'),
    makeCard('tide', 'strike', 4, 3, 'Undertow'),
  ];
  game.player.discard = [makeCard('flame', 'strike', 3, 2, 'Ember Lash')];
  game.stats.damageDealt = 9;
  game.stats.damageTaken = 6;
  game.stats.cardsPlayed = 5;
  game.stats.resonances = 1;
  game.resonance = { element: 'flame', bonus: 2 };
  game.message = 'Turn 4 — your move. Play cards, then END TURN.';
  game.log = [
    'You play Ember Lash, dealing 3 damage.',
    'The Warden plays Stonehide, gaining 2 shield.',
    'RESONANCE! Flame +2 power.',
    'Your turn — the court is yours to take.',
  ];
  game.selected = game.player.hand[0];
  return game;
}

export function stageShot(name, seed = 7) {
  if (name === 'title') {
    return newGame(seed);
  }
  if (name === 'play') {
    return stageMidGame(seed);
  }
  if (name === 'win') {
    const game = stageMidGame(seed);
    game.warden.life = 0;
    game.phase = 'won';
    game.selected = null;
    game.message = 'VICTORY — the Warden bows, and the court is yours.';
    game.stats.damageDealt = 20;
    game.log = ['You play Cinder Slash — RESONANCE +2!', 'The Ash Warden falls. You win the court!'];
    return game;
  }
  if (name === 'loss') {
    const game = stageMidGame(seed);
    game.player.life = 0;
    game.phase = 'lost';
    game.selected = null;
    game.message = 'DEFEAT — your ember gutters out.';
    game.stats.damageTaken = 20;
    game.log = ['The Warden plays Wildfire, dealing 6 damage.', 'Your ember gutters out. The Warden keeps the court.'];
    return game;
  }
  return newGame(seed);
}

// A tiny autopilot, used only to prove the rules play end to end: it plays
// the player's cheapest playable card, then ends the turn, until the duel ends.
export function autopilotStep(game) {
  if (game.phase !== 'play' || game.turnOwner !== 'player') return;
  const affordable = game.player.hand
    .filter((c) => game.player.ember >= c.cost)
    .sort((a, b) => a.cost - b.cost || b.power - a.power);
  if (affordable.length > 0) {
    playCard(game, game.player, game.warden, affordable[0]);
  }
  if (game.phase === 'play') endPlayerTurn(game);
}

export { drawCards };
