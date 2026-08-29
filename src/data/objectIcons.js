import { OBJECT_LIBRARY } from './objectLibrary';
import oilSpillIcon from '../assets/icons/oil-spill.svg';

// Icons are bundled locally (src/assets/emoji) instead of fetched from a
// CDN at runtime — this is what fixed the "sometimes just keeps loading"
// problem on mobile: every board cell used to trigger its own cross-origin
// request to raw.githubusercontent.com, and on a slower/higher-latency
// mobile connection dozens of those requests in parallel could stall out.
// Bundling them means they ship with the app's own JS/CSS bundle: one
// download, cached like everything else, zero runtime network dependency.
//
// Art is Twemoji (Twitter's open-source emoji set), CC-BY 4.0 —
// attribution is credited on the Glossary page.
const emojiModules = import.meta.glob('../assets/emoji/*.svg', { eager: true, import: 'default' });
const urlByCodepoint = {};
for (const path in emojiModules) {
  const cp = path.split('/').pop().replace('.svg', '');
  urlByCodepoint[cp] = emojiModules[path];
}

export function codepoints(emoji) {
  return Array.from(emoji)
    .map((ch) => ch.codePointAt(0).toString(16))
    .filter((cp) => cp !== 'fe0f')
    .join('-');
}

export function twemojiUrl(emoji) {
  const cp = codepoints(emoji);
  return urlByCodepoint[cp] || null;
}

// A handful of object types have no dedicated icon in Twemoji OR OpenMoji
// (confirmed by checking OpenMoji's actual 4,579-icon dataset directly —
// no "table", "carpet"/"rug", "punching bag", "easel", "puddle", or
// "shrub"/"bush" exists in either set; Unicode's furniture vocabulary is
// just limited). One exception: OpenMoji DOES have a dedicated "oil-spill"
// icon (an overturned drum with spreading oil) that's a real improvement
// over any emoji stand-in, so that one is bundled here from OpenMoji
// (CC BY-SA 4.0, credited alongside Twemoji on the Glossary page).
export const CUSTOM_ICON_URL = {
  'oil slick': oilSpillIcon,
};

export function iconUrlForType(type) {
  if (CUSTOM_ICON_URL[type]) return CUSTOM_ICON_URL[type];
  const emoji = OBJECT_EMOJI[type] || FALLBACK_EMOJI;
  return twemojiUrl(emoji);
}

// Every object type in the puzzle data mapped to a representative emoji
// (used as the fallback for anything not in CUSTOM_ICON_URL above). A few
// were swapped from Twemoji's nearest-but-weak match to a clearer
// stand-in: crate -> same box glyph as `box` (a crate IS basically a box,
// so the duplicate is more honest than the previous ballot-box glyph),
// register -> a kiosk/ATM shape (closer to a standing register than a
// receipt), shelf -> a filing cabinet (reads as storage furniture rather
// than "a stack of books"). carpet, table, punching bag, easel, puddle,
// and shrub stay on their closest available emoji proxy — see the note
// above CUSTOM_ICON_URL for why no better ready-made icon exists.
export const OBJECT_EMOJI = {
  chair: '🪑',
  carpet: '🟫',
  door: '🚪',
  bed: '🛏️',
  table: '🍽️',
  shelf: '🗄️',
  trashcan: '🗑️',
  box: '📦',
  crate: '📦',
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
  register: '🏧',
  present: '🎁',
  'teddy bear': '🧸',
  flag: '🚩',
  tree: '🌲',
  shrub: '🌿',
  rock: '🪨',
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
  'oil slick': '🕳️',
  'paint spill': '🖌️',
  'golf tee': '⛳',
};

export const WATER_EMOJI = '💧';
export const FALLBACK_EMOJI = '❔';

// Sanity check in dev: every type in the shared object library should
// resolve to a bundled icon. (boulder/rubble were intentionally dropped —
// they never appeared in any real puzzle's object list.)
if (import.meta.env?.DEV) {
  for (const type of Object.keys(OBJECT_LIBRARY)) {
    if (!OBJECT_EMOJI[type] && !CUSTOM_ICON_URL[type]) {
      // eslint-disable-next-line no-console
      console.warn(`[objectIcons] no icon mapped for object type "${type}"`);
    }
  }
}
