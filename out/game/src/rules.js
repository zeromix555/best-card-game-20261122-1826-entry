// Ember Court — the duel itself: turns, ember, hands, combat, the warden.
// One file, one job: the rules. It knows nothing about pixels or sound.
import { CONFIG } from './config.js';
import { buildDeck, describeCard } from './deck.js';
import { makeRandom, shuffleDeck } from './random.js';

export function newDuelist(name, isWarden) {
  return {
    name,
    isWarden,
    life: CONFIG.startLife,
    maxLife: CONFIG.startLife,
    shield: 0,
    ember: isWarden ? CONFIG.wardenStartEmber : CONFIG.startEmber,
    maxEmber: isWarden ? CONFIG.wardenStartEmber : CONFIG.startEmber,
    deck: [],
    hand: [],
    discard: [],
    playedThisTurn: [],
  };
}

export function newGame(seed = 1) {
  const rng = makeRandom(seed);
  const player = newDuelist('You', false);
  const warden = newDuelist('The Ash Warden', true);
  player.deck = shuffleDeck(buildDeck(), rng);
  warden.deck = shuffleDeck(buildDeck(), rng);
  const game = {
    seed,
    rng,
    phase: 'title', // title | play | won | lost
    turn: 1,
    turnOwner: 'player',
    player,
    warden,
    log: ['The court is lit. The Warden waits.'],
    message: 'Press SPACE or click BEGIN THE DUEL.',
    resonance: null, // {element, bonus} announced when it fires
    stats: { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, resonances: 0 },
    animations: [],
    selected: null,
    hovered: null,
    endedAt: null,
  };
  return game;
}

export function drawCards(duelist, count) {
  for (let i = 0; i < count; i++) {
    if (duelist.deck.length === 0) {
      if (duelist.discard.length === 0) return;
      duelist.deck = shuffleDeck(duelist.discard.splice(0), makeRandom(Date.now() % 2147483647));
    }
    if (duelist.hand.length >= CONFIG.maxHand) return;
    duelist.hand.push(duelist.deck.pop());
  }
}

export function startDuel(game) {
  drawCards(game.player, CONFIG.handSize);
  drawCards(game.warden, CONFIG.handSize);
  game.phase = 'play';
  game.turnOwner = 'player';
  game.message = 'Your turn — play cards, then END TURN.';
  pushLog(game, 'You draw your opening hand.');
}

export function beginTurn(game, duelist) {
  duelist.maxEmber = Math.min(CONFIG.maxEmber, duelist.maxEmber + 1);
  duelist.ember = duelist.maxEmber;
  duelist.playedThisTurn = [];
  drawCards(duelist, CONFIG.drawPerTurn);
}

export function resonanceBonus(game, duelist, card) {
  const same = duelist.playedThisTurn.filter((c) => c.element === card.element).length;
  if (same >= 1) return CONFIG.resonanceBonus;
  return 0;
}

export function canPlay(game, card) {
  if (game.phase !== 'play' || game.turnOwner !== 'player') return false;
  return game.player.ember >= card.cost;
}

// Apply one card. Returns a short line for the log, or null if it cannot play.
export function playCard(game, duelist, foe, card) {
  if (duelist.ember < card.cost) return null;
  const index = duelist.hand.indexOf(card);
  if (index === -1) return null;
  const bonus = resonanceBonus(game, duelist, card);
  duelist.hand.splice(index, 1);
  duelist.ember -= card.cost;
  duelist.playedThisTurn.push(card);
  duelist.discard.push(card);
  game.stats.cardsPlayed += 1;
  let line = `${duelist.name} plays ${describeCard(card)}`;
  if (bonus > 0) {
    game.resonance = { element: card.element, bonus };
    game.stats.resonances += 1;
    line += ` — RESONANCE +${bonus}!`;
  }
  const power = card.power + bonus;
  if (card.kind === 'strike') {
    dealDamage(game, foe, duelist, power);
    line += `, dealing ${power} damage`;
  } else if (card.kind === 'aegis') {
    duelist.shield += power;
    line += `, gaining ${power} shield`;
  } else if (card.kind === 'surge') {
    duelist.ember = Math.min(CONFIG.maxEmber, duelist.ember + power);
    drawCards(duelist, 1);
    line += `, gaining ${power} ember and drawing a card`;
  }
  pushLog(game, line + '.');
  return line;
}

export function dealDamage(game, target, source, amount) {
  let left = amount;
  if (target.shield > 0) {
    const absorbed = Math.min(target.shield, left);
    target.shield -= absorbed;
    left -= absorbed;
  }
  if (left > 0) {
    target.life = Math.max(0, target.life - left);
    if (source.isWarden) game.stats.damageTaken += left;
    else game.stats.damageDealt += left;
  }
  game.animations.push({ kind: 'hit', target: target.isWarden ? 'warden' : 'player', at: Date.now() });
  checkEnd(game);
}

export function checkEnd(game) {
  if (game.phase !== 'play') return;
  if (game.warden.life <= 0) {
    game.phase = 'won';
    game.endedAt = Date.now();
    game.message = 'VICTORY — the Warden bows, and the court is yours.';
    pushLog(game, 'The Ash Warden falls. You win the court!');
  } else if (game.player.life <= 0) {
    game.phase = 'lost';
    game.endedAt = Date.now();
    game.message = 'DEFEAT — your ember gutters out.';
    pushLog(game, 'Your ember gutters out. The Warden keeps the court.');
  }
}

export function pushLog(game, line) {
  game.log.push(line);
  if (game.log.length > 5) game.log.shift();
}

// The warden's turn: play what it can afford, favouring damage, then pass.
export function wardenTurn(game) {
  game.turnOwner = 'warden';
  game.message = 'The Warden studies its hand…';
  beginTurn(game, game.warden);
  const foe = game.player;
  // Play up to three cards: strikes first, then aegis when hurt, then surge.
  const order = (a, b) => {
    const rank = (c) => (c.kind === 'strike' ? 0 : c.kind === 'aegis' ? 1 : 2);
    return rank(a) - rank(b) || b.power - a.power;
  };
  let played = 0;
  for (const card of [...game.warden.hand].sort(order)) {
    if (played >= 3) break;
    if (game.warden.ember < card.cost) continue;
    if (card.kind === 'aegis' && game.warden.life > 12) continue;
    if (card.kind === 'surge' && game.warden.hand.length <= 2) continue;
    playCard(game, game.warden, foe, card);
    played += 1;
    if (game.phase !== 'play') return;
  }
  if (game.phase !== 'play') return;
  pushLog(game, 'The Warden ends its turn.');
  game.turn += 1;
  game.turnOwner = 'player';
  beginTurn(game, game.player);
  game.message = `Turn ${game.turn} — your move. Play cards, then END TURN.`;
  game.resonance = null;
}

export function endPlayerTurn(game) {
  if (game.phase !== 'play' || game.turnOwner !== 'player') return;
  game.selected = null;
  pushLog(game, 'You end your turn.');
  wardenTurn(game);
}

export function restartGame(game) {
  const fresh = newGame(game.seed + 1);
  Object.keys(fresh).forEach((key) => {
    game[key] = fresh[key];
  });
  game.phase = 'title';
}

// Score shown on the table: damage dealt minus damage taken, plus wins.
export function scoreOf(game) {
  return game.stats.damageDealt * 10 - game.stats.damageTaken * 5 + game.stats.resonances * 15;
}
