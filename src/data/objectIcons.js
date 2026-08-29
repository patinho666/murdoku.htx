// Twemoji ships one canonical, colorful SVG per emoji, so it looks
// identical everywhere instead of however each phone's OS happens to draw
// its own emoji font (which was the original problem — inconsistent,
// clashing styles across devices). Licensed CC-BY 4.0: https://github.com/twitter/twemoji
// (attribution given in the app footer — see Glossary page).
const TWEMOJI_BASE = 'https://raw.githubusercontent.com/twitter/twemoji/v14.0.2/assets/svg/';

export function codepoints(emoji) {
  return Array.from(emoji)
    .map((ch) => ch.codePointAt(0).toString(16))
    .filter((cp) => cp !== 'fe0f')
    .join('-');
}

export function twemojiUrl(emoji) {
  return `${TWEMOJI_BASE}${codepoints(emoji)}.svg`;
}

// Every object type in the puzzle data mapped to a representative emoji.
export const OBJECT_EMOJI = {
  chair: '🪑',
  carpet: '🟫',
  door: '🚪',
  bed: '🛏️',
  table: '🍽️',
  shelf: '📚',
  trashcan: '🗑️',
  box: '📦',
  crate: '🗳️',
  safe: '🔒',
  statue: '🗿',
  TV: '📺',
  painting: '🖼️',
  plant: '🪴',
  flowers: '💐',
  bonsai: '🌳',
  camera: '📷',
  easel: '🎨',
  'punching bag': '🥊',
  house: '🏠',
  register: '🧾',
  present: '🎁',
  'teddy bear': '🧸',
  flag: '🚩',
  tree: '🌲',
  shrub: '🌿',
  boulder: '🪨',
  rock: '🪨',
  rubble: '🧱',
  cactus: '🌵',
  barrel: '🛢️',
  bear: '🐻',
  boar: '🐗',
  lion: '🦁',
  elephant: '🐘',
  penguin: '🐧',
  crocodile: '🐊',
  shark: '🦈',
  horse: '🐴',
  boat: '🛶',
  rowboat: '🚣',
  'lily pad': '🌸',
  car: '🚗',
  'golf cart': '🛺',
  catapult: '🏹',
  puddle: '💧',
  'oil slick': '⚫',
  'paint spill': '🖌️',
  'golf tee': '⛳',
};

export const WATER_EMOJI = '💧';
export const FALLBACK_EMOJI = '❔';
