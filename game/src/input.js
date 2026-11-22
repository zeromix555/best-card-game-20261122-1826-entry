// Ember Court — keyboard and mouse: what a click or a key does.
// One file, one job: input. It calls into the rules, never draws.
import { canPlay, endPlayerTurn, playCard, restartGame, startDuel } from './rules.js';
import { playSound, toggleMute } from './sound.js';

function pointIn(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function tryPlaySelected(game) {
  if (!game.selected) return;
  if (!canPlay(game, game.selected)) {
    game.message = 'Not enough ember for that card — end the turn to gather more.';
    return;
  }
  const card = game.selected;
  const played = playCard(game, game.player, game.warden, card);
  if (played) {
    game.selected = null;
    playSound(game.resonance ? 'resonance' : 'play');
    if (card.kind === 'strike') playSound('hit');
    if (game.phase === 'won') playSound('win');
    if (game.phase === 'lost') playSound('lose');
  }
}

export function attachInput(canvas, game) {
  canvas.addEventListener('click', (event) => {
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left) * (canvas.width / box.width);
    const y = (event.clientY - box.top) * (canvas.height / box.height);
    const layout = game.layout ?? { buttons: [], cards: [] };
    const buttons = layout.buttons ?? [];
    const cards = layout.cards ?? [];
    for (const btn of buttons) {
      if (!pointIn(x, y, btn)) continue;
      if (btn.id === 'begin') {
        startDuel(game);
        playSound('turn');
      } else if (btn.id === 'endTurn') {
        endPlayerTurn(game);
        playSound('turn');
      } else if (btn.id === 'again') {
        restartGame(game);
        playSound('turn');
      }
      return;
    }
    for (const slot of cards) {
      if (!pointIn(x, y, slot)) continue;
      if (game.phase !== 'play' || game.turnOwner !== 'player') return;
      if (game.selected === slot.card) {
        tryPlaySelected(game);
      } else {
        game.selected = slot.card;
        playSound('select');
      }
      return;
    }
    game.selected = null;
  });

  canvas.addEventListener('mousemove', (event) => {
    const box = canvas.getBoundingClientRect();
    const x = (event.clientX - box.left) * (canvas.width / box.width);
    const y = (event.clientY - box.top) * (canvas.height / box.height);
    const layout = game.layout ?? { cards: [] };
    game.hovered = null;
    for (const slot of layout.cards ?? []) {
      if (pointIn(x, y, slot)) game.hovered = slot.card;
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (game.phase === 'title' && (key === ' ' || key === 'enter')) {
      event.preventDefault();
      startDuel(game);
      playSound('turn');
      return;
    }
    if ((game.phase === 'won' || game.phase === 'lost') && (key === 'r' || key === ' ' || key === 'enter')) {
      event.preventDefault();
      restartGame(game);
      playSound('turn');
      return;
    }
    if (game.phase !== 'play') return;
    if (key >= '1' && key <= '7') {
      const index = Number(key) - 1;
      const card = game.player.hand[index];
      if (card && game.turnOwner === 'player') {
        game.selected = game.selected === card ? null : card;
        playSound('select');
      }
    } else if (key === 'enter' || key === ' ') {
      event.preventDefault();
      tryPlaySelected(game);
    } else if (key === 'e') {
      endPlayerTurn(game);
      playSound('turn');
    } else if (key === 'r') {
      restartGame(game);
      playSound('turn');
    } else if (key === 'm') {
      toggleMute();
    } else if (key === 'escape') {
      game.selected = null;
    }
  });
}
