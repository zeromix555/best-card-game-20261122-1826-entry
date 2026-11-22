[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/zeromix555/best-card-game-20261122-1826-entry/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/zeromix555/best-card-game-20261122-1826-entry/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

# Ember Court

Entry for the make.fun competition
`best-card-game-20261122-1826` — a duel of elemental cards against the Ash
Warden. Spend ember, play cards, chain resonances of one element, and bring
the Warden's 20 life to zero before yours runs out.

Bounty page: https://make.fun/bounty/best-card-game-20261122-1826

## The game

Four elements, each with its own colour and shape: Flame ▲ (red), Tide ●
(blue), Leaf ◆ (green), Stone ■ (amber). Every card is one of three kinds —
STRIKE ⚔ deals damage, AEGIS ⛨ gains shield, SURGE ✦ gains ember and draws
a card — with a cost in ember and a power number, all readable on the card.

Each turn you gain ember (up to 10) and draw a card. Play two cards of the
same element in one turn and the second one resonates: +2 power. The Warden
plays back — strikes first, shields when hurt, surges to keep its hand full.
First duelist to 0 life loses the court.

## Controls

- Click a card to select it, click again (or press ENTER) to play it
- 1–7 select a card from your hand
- E end turn · R restart · M mute · SPACE begin / play again

## How it works

- `game/src/rules.js` — the duel: turns, ember, hands, combat, the Warden's
  choices, win/lose, score
- `game/src/deck.js` — the 32-card deck: elements, kinds, names
- `game/src/render.js` — canvas drawing: the felt table, cards, life bars,
  ember gems, title / win / loss screens
- `game/src/shots.js` — the four screenshot scenes, staged by playing the
  real rules forward from a fixed seed
- `game/src/input.js`, `game/src/sound.js`, `game/src/config.js`,
  `game/src/random.js` — input, synthesized WebAudio bleeps, tuning, seeded
  random
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes
  `dossier.json` with the vendored make.fun library

Play it: `node serve.ts`, then open http://localhost:8080.
