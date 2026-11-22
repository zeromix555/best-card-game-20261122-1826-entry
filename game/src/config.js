// Ember Court — tuning constants for the duel.
// One file, one job: every number the rules and the renderer agree on.
export const CONFIG = {
  canvasWidth: 1280,
  canvasHeight: 800,
  startLife: 20,
  startEmber: 1,
  maxEmber: 10,
  handSize: 5,
  maxHand: 7,
  drawPerTurn: 1,
  // A resonance triggers when two cards of one element are played in a turn.
  resonanceBonus: 2,
  // The warden (AI) starts a little slower so the opening favours the player.
  wardenStartEmber: 1,
  // Card art: four elements, each with a colour and a glyph shape.
  elements: {
    flame: { name: 'Flame', color: '#e5484d', dark: '#8f1d22', glyph: '▲', glow: '#ffb3a7' },
    tide: { name: 'Tide', color: '#3e8fe8', dark: '#174a80', glyph: '●', glow: '#b3d7ff' },
    leaf: { name: 'Leaf', color: '#46a758', dark: '#1d5c2e', glyph: '◆', glow: '#b9ecc4' },
    stone: { name: 'Stone', color: '#d9a441', dark: '#7a5410', glyph: '■', glow: '#ffe1a1' },
  },
  elementOrder: ['flame', 'tide', 'leaf', 'stone'],
};
