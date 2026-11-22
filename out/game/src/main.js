// Ember Court — boot and the one game loop.
// One file, one job: start the duel, draw it every frame, keep the status
// line honest for screen readers. The rules live in rules.js, the pixels in
// render.js, the input in input.js.
import { CONFIG } from './config.js';
import { attachInput } from './input.js';
import { drawGame } from './render.js';
import { newGame } from './rules.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? '1') || 1;

const game = shot ? stageShot(shot, seed) : newGame(seed);
attachInput(canvas, game);

const ctx = canvas.getContext('2d');
let lastSpoken = '';
function loop() {
  drawGame(ctx, game);
  const spoken = `${game.phase}: ${game.message} You ${game.player.life} life, the Warden ${game.warden.life} life.`;
  if (spoken !== lastSpoken) {
    status.textContent = spoken;
    lastSpoken = spoken;
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
