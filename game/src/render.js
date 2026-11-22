// Ember Court — everything the player sees, drawn on one canvas.
// One file, one job: pixels. It never changes the rules; it reads the game.
import { CONFIG } from './config.js';
import { elementOf } from './deck.js';
import { scoreOf } from './rules.js';

const CARD_W = 148;
const CARD_H = 208;
const FONT = "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function feltTable(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h * 0.42, 60, w / 2, h * 0.5, 720);
  g.addColorStop(0, '#2c6b45');
  g.addColorStop(0.55, '#1d4d31');
  g.addColorStop(1, '#0e2a1b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(217,164,65,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.46, 560, 250, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(217,164,65,0.22)';
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.46, 500, 205, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function lifeBar(ctx, x, y, w, label, life, maxLife, shield, color) {
  ctx.font = `bold 17px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5e9c9';
  ctx.fillText(label, x, y - 8);
  ctx.fillStyle = '#101a14';
  roundRect(ctx, x, y, w, 22, 11);
  ctx.fill();
  const frac = Math.max(0, life / maxLife);
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, color);
  grad.addColorStop(1, '#ffb3a7');
  ctx.fillStyle = grad;
  if (frac > 0) {
    roundRect(ctx, x, y, Math.max(22, w * frac), 22, 11);
    ctx.fill();
  }
  ctx.font = `bold 16px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${life} / ${maxLife}`, x + w / 2, y + 17);
  if (shield > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9fd8ff';
    ctx.font = `bold 16px ${FONT}`;
    ctx.fillText(`⛨ Shield ${shield}`, x + w + 14, y + 17);
  }
}

function emberGems(ctx, x, y, ember, maxEmber) {
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5e9c9';
  ctx.fillText('EMBER', x, y - 8);
  for (let i = 0; i < maxEmber; i++) {
    const gx = x + i * 26;
    ctx.beginPath();
    ctx.arc(gx + 10, y + 10, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < ember ? '#ff9d2e' : '#3a2f22';
    ctx.fill();
    ctx.strokeStyle = '#ffd98a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (i < ember) {
      ctx.fillStyle = '#fff3d6';
      ctx.beginPath();
      ctx.arc(gx + 7, y + 7, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawCardBack(ctx, x, y, w, h) {
  ctx.fillStyle = '#3a1f2b';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(217,164,65,0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 7);
  ctx.stroke();
  ctx.fillStyle = '#d9a441';
  const backFont = w < 100 ? 8 : 11;
  ctx.font = `bold ${backFont}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('✦', x + w / 2, y + h / 2 + 8);
  ctx.font = `bold ${backFont}px ${FONT}`;
  ctx.fillText('EMBER COURT', x + w / 2, y + h - 18);
}

function drawCard(ctx, card, x, y, w, h, opts = {}) {
  const el = elementOf(card);
  const selected = opts.selected === true;
  const playable = opts.playable === true;
  const lift = selected ? -26 : opts.hovered ? -12 : 0;
  const cy = y + lift;
  ctx.save();
  if (!playable && opts.dim) ctx.globalAlpha = 0.55;
  ctx.shadowColor = selected ? el.glow : 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = selected ? 22 : 10;
  ctx.shadowOffsetY = 6;
  const grad = ctx.createLinearGradient(x, cy, x, cy + h);
  grad.addColorStop(0, '#fdf6e3');
  grad.addColorStop(1, '#e8dcc0');
  ctx.fillStyle = grad;
  roundRect(ctx, x, cy, w, h, 12);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = selected ? el.color : '#8a7a5a';
  ctx.lineWidth = selected ? 4 : 2;
  roundRect(ctx, x, cy, w, h, 12);
  ctx.stroke();
  // Element banner.
  ctx.fillStyle = el.color;
  roundRect(ctx, x + 6, cy + 6, w - 12, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold 22px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(`${el.glyph} ${el.name.toUpperCase()}`, x + w / 2, cy + 36);
  // Cost gem, top-left over the banner.
  ctx.beginPath();
  ctx.arc(x + 20, cy + 20, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#ff9d2e';
  ctx.fill();
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#3a1f00';
  ctx.font = 'bold 17px ' + FONT;
  ctx.fillText(String(card.cost), x + 20, cy + 26);
  // Name.
  ctx.fillStyle = '#2b2118';
  ctx.font = `bold 16px ${FONT}`;
  ctx.fillText(card.name, x + w / 2, cy + 78, w - 16);
  // Kind word + glyph.
  ctx.fillStyle = el.dark;
  ctx.font = `bold 15px ${FONT}`;
  ctx.fillText(`${card.glyph} ${card.word}`, x + w / 2, cy + 104);
  // Big power number.
  ctx.fillStyle = el.color;
  ctx.font = `bold 56px ${FONT}`;
  ctx.fillText(String(card.power), x + w / 2, cy + 164);
  ctx.fillStyle = '#6b5b3e';
  ctx.font = '13px ' + FONT;
  ctx.fillText(card.kind === 'strike' ? 'damage' : card.kind === 'aegis' ? 'shield' : 'ember + draw', x + w / 2, cy + 186);
  if (selected) {
    ctx.fillStyle = el.color;
    ctx.font = `bold 14px ${FONT}`;
    ctx.fillText('— press ENTER to play —', x + w / 2, cy + h + 18);
  }
  ctx.restore();
  return { x, y: cy, w, h };
}

function button(ctx, rect, label, enabled) {
  ctx.save();
  ctx.fillStyle = enabled ? '#d9a441' : '#5a5142';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#fff3d6';
  ctx.lineWidth = 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.stroke();
  ctx.fillStyle = enabled ? '#241a05' : '#cfc4a8';
  ctx.font = `bold 19px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 7);
}

function drawLog(ctx, game, cx, y) {
  ctx.textAlign = 'center';
  ctx.font = `15px ${FONT}`;
  game.log.forEach((line, i) => {
    ctx.fillStyle = i === game.log.length - 1 ? '#ffe9b0' : 'rgba(245,233,201,0.6)';
    ctx.fillText(line, cx, y + i * 20);
  });
}

function drawTitle(ctx, game, w, h) {
  feltTable(ctx, w, h);
  // Decorative fanned cards behind the title.
  const fan = [
    { element: 'flame', kind: 'strike', power: 6, cost: 4, name: 'Cinder Slash', glyph: '⚔', word: 'STRIKE' },
    { element: 'tide', kind: 'aegis', power: 5, cost: 3, name: 'Stillwater', glyph: '⛨', word: 'AEGIS' },
    { element: 'leaf', kind: 'surge', power: 3, cost: 2, name: 'Bloom', glyph: '✦', word: 'SURGE' },
    { element: 'stone', kind: 'strike', power: 4, cost: 2, name: 'Quake Fist', glyph: '⚔', word: 'STRIKE' },
  ];
  fan.forEach((card, i) => {
    ctx.save();
    ctx.translate(w / 2 + (i - 1.5) * 165, 470);
    ctx.rotate((i - 1.5) * 0.09);
    drawCard(ctx, card, -74, -104, CARD_W, CARD_H, {});
    ctx.restore();
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d9a441';
  ctx.font = `bold 30px ${FONT}`;
  ctx.fillText('✦  A DUEL OF ELEMENTS  ✦', w / 2, 118);
  ctx.fillStyle = '#f5e9c9';
  ctx.font = `bold 92px ${FONT}`;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 18;
  ctx.fillText('EMBER COURT', w / 2, 210);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `20px ${FONT}`;
  ctx.fillText('Outwit the Ash Warden. Spend ember, play cards, chain resonances.', w / 2, 252);
  ctx.fillText('First duelist to 0 life loses the court.', w / 2, 280);
  const begin = { x: w / 2 - 170, y: 620, w: 340, h: 58 };
  button(ctx, begin, 'BEGIN THE DUEL  ▶', true);
  ctx.fillStyle = 'rgba(245,233,201,0.75)';
  ctx.font = `15px ${FONT}`;
  ctx.fillText('Click BEGIN, or press SPACE  ·  1–7 select a card, ENTER plays it, E ends turn', w / 2, 712);
  ctx.fillText('Flame ▲  Tide ●  Leaf ◆  Stone ■ — each element has its own colour and shape', w / 2, 738);
  game.layout = { buttons: [{ id: 'begin', ...begin }] };
}

function drawTable(ctx, game, w, h) {
  feltTable(ctx, w, h);
  const layout = { buttons: [], cards: [] };
  const { player, warden } = game;
  // Opponent row.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5e9c9';
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillText('👑 THE ASH WARDEN', 48, 52);
  lifeBar(ctx, 48, 66, 300, '', warden.life, warden.maxLife, warden.shield, '#e5484d');
  emberGems(ctx, 580, 66, warden.ember, Math.max(warden.maxEmber, 1));
  ctx.font = `15px ${FONT}`;
  ctx.fillStyle = 'rgba(245,233,201,0.8)';
  ctx.fillText(`Deck ${warden.deck.length} · Hand ${warden.hand.length}`, 830, 84);
  // Warden's face-down hand.
  warden.hand.forEach((_, i) => {
    const bw = 74;
    const bx = w / 2 - (warden.hand.length * (bw + 8)) / 2 + i * (bw + 8);
    drawCardBack(ctx, bx, 108, bw, 104);
  });
  // Centre: round banner + score.
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d9a441';
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillText(`—  TURN ${game.turn}  ·  SCORE ${scoreOf(game)}  —`, w / 2, 262);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `17px ${FONT}`;
  ctx.fillText(game.message, w / 2, 290);
  if (game.resonance) {
    const el = CONFIG.elements[game.resonance.element];
    ctx.fillStyle = el.glow;
    ctx.font = `bold 19px ${FONT}`;
    ctx.fillText(`✦ RESONANCE! ${el.name} +${game.resonance.bonus} power ✦`, w / 2, 318);
  }
  // Discard + deck piles for the player.
  drawCardBack(ctx, 48, 330, 74, 104);
  ctx.fillStyle = '#f5e9c9';
  ctx.font = '14px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText(`YOUR DECK ${player.deck.length}`, 85, 452);
  // Discard pile: the last card played, face down in the pile.
  drawCardBack(ctx, 1150, 330, 74, 104);
  ctx.fillStyle = '#f5e9c9';
  ctx.font = '14px ' + FONT;
  ctx.textAlign = 'center';
  ctx.fillText(`DISCARD ${player.discard.length}`, 1187, 452);
  // End turn button.
  const endTurn = { x: w - 268, y: 238, w: 220, h: 52 };
  button(ctx, endTurn, 'END TURN  ⏎', game.turnOwner === 'player');
  layout.buttons.push({ id: 'endTurn', ...endTurn });
  // Player row.
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5e9c9';
  ctx.font = `bold 22px ${FONT}`;
  ctx.fillText('🃏 YOU', 48, 512);
  lifeBar(ctx, 48, 526, 300, '', player.life, player.maxLife, player.shield, '#46a758');
  emberGems(ctx, 580, 526, player.ember, Math.max(player.maxEmber, 1));
  ctx.font = `15px ${FONT}`;
  ctx.fillStyle = 'rgba(245,233,201,0.8)';
  ctx.fillText(`Damage dealt ${game.stats.damageDealt} · Resonances ${game.stats.resonances}`, 830, 544);
  // Player hand, fanned across the bottom.
  const n = player.hand.length;
  const gap = Math.min(168, (w - 120) / Math.max(1, n));
  const startX = (w - gap * (n - 1) - CARD_W) / 2 + 20;
  player.hand.forEach((card, i) => {
    const cx = startX + i * gap;
    const cy = 560;
    const rect = drawCard(ctx, card, cx, cy, CARD_W, CARD_H, {
      selected: game.selected === card,
      hovered: game.hovered === card,
      playable: game.turnOwner === 'player' && player.ember >= card.cost,
      dim: game.turnOwner === 'player' && player.ember < card.cost,
    });
    layout.cards.push({ card, ...rect });
  });
  drawLog(ctx, game, w / 2, 348);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(245,233,201,0.65)';
  ctx.font = `13px ${FONT}`;
  ctx.fillText('1–7 select · ENTER play · E end turn · R restart · M mute', w - 48, 786);
  game.layout = layout;
}

function drawEndScreen(ctx, game, w, h, won) {
  drawTable(ctx, game, w, h);
  ctx.fillStyle = won ? 'rgba(20,16,2,0.86)' : 'rgba(8,4,6,0.88)';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#ffd94d' : '#e5484d';
  ctx.font = `bold 84px ${FONT}`;
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 24;
  ctx.fillText(won ? '👑 VICTORY' : '💀 DEFEAT', w / 2, 300);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f5e9c9';
  ctx.font = `22px ${FONT}`;
  ctx.fillText(
    won ? 'The Warden bows. The Ember Court is yours.' : 'Your ember gutters out. The Warden keeps the court.',
    w / 2, 352,
  );
  ctx.font = `bold 20px ${FONT}`;
  ctx.fillStyle = '#ffe9b0';
  const s = game.stats;
  ctx.fillText(
    `Score ${scoreOf(game)}   ·   Damage dealt ${s.damageDealt}   ·   Damage taken ${s.damageTaken}   ·   Cards played ${s.cardsPlayed}   ·   Resonances ${s.resonances}`,
    w / 2, 410,
  );
  const again = { x: w / 2 - 160, y: 460, w: 320, h: 56 };
  button(ctx, again, won ? 'PLAY AGAIN  ▶' : 'TRY AGAIN  ▶', true);
  ctx.fillStyle = 'rgba(245,233,201,0.75)';
  ctx.font = `15px ${FONT}`;
  ctx.fillText('Press R or click the button to duel again.', w / 2, 556);
  game.layout = { buttons: [{ id: 'again', ...again }], cards: [] };
}

export function drawGame(ctx, game) {
  const w = CONFIG.canvasWidth;
  const h = CONFIG.canvasHeight;
  ctx.clearRect(0, 0, w, h);
  if (game.phase === 'title') drawTitle(ctx, game, w, h);
  else if (game.phase === 'won') drawEndScreen(ctx, game, w, h, true);
  else if (game.phase === 'lost') drawEndScreen(ctx, game, w, h, false);
  else drawTable(ctx, game, w, h);
  // Hit flash on the duelist just damaged.
  const now = Date.now();
  game.animations = game.animations.filter((a) => now - a.at < 450);
  for (const a of game.animations) {
    const alpha = 1 - (now - a.at) / 450;
    ctx.fillStyle = `rgba(229,72,77,${0.25 * alpha})`;
    if (a.target === 'warden') ctx.fillRect(0, 0, w, 240);
    else ctx.fillRect(0, 500, w, 300);
  }
}
