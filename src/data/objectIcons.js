import { OBJECT_LIBRARY } from './objectLibrary';
// Multi-cell objects, re-exported with a TIGHT viewBox. Twemoji draws on a
// 36x36 canvas and these wide shapes sit LOW on it (a car occupies roughly
// y=13.6-35.4), so `object-fit: contain` on the full square rendered them
// hugging the bottom of a horizontal span - and hugging the left once
// rotated for a vertical span. Cropping to the real geometry bounds
// centres them and lets them fill the footprint.
import barrelIcon from '../assets/icons/barrel.svg';
import bearIcon from '../assets/icons/bear.svg';
import bedIcon from '../assets/icons/bed.svg';
import boarIcon from '../assets/icons/boar.svg';
import bonsaiIcon from '../assets/icons/bonsai.svg';
import boxIcon from '../assets/icons/box.svg';
import cactusIcon from '../assets/icons/cactus.svg';
import cameraIcon from '../assets/icons/camera.svg';
import carIcon from '../assets/icons/car.svg';
import catapultIcon from '../assets/icons/catapult.svg';
import chairIcon from '../assets/icons/chair.svg';
import crateIcon from '../assets/icons/crate.svg';
import crocodileIcon from '../assets/icons/crocodile.svg';
import easelIcon from '../assets/icons/easel.svg';
import elephantIcon from '../assets/icons/elephant.svg';
import flagIcon from '../assets/icons/flag.svg';
import flowersIcon from '../assets/icons/flowers.svg';
import golfcartIcon from '../assets/icons/golfcart.svg';
import golfteeIcon from '../assets/icons/golftee.svg';
import horseIcon from '../assets/icons/horse.svg';
import houseIcon from '../assets/icons/house.svg';
import lilypadIcon from '../assets/icons/lilypad.svg';
import lionIcon from '../assets/icons/lion.svg';
import oilslickIcon from '../assets/icons/oilslick.svg';
import paintingIcon from '../assets/icons/painting.svg';
import paintspillIcon from '../assets/icons/paintspill.svg';
import penguinIcon from '../assets/icons/penguin.svg';
import puddleIcon from '../assets/icons/puddle.svg';
import registerIcon from '../assets/icons/register.svg';
import shrubIcon from '../assets/icons/shrub.svg';
import shelfIcon from '../assets/icons/shelf.svg';
import tableIcon from '../assets/icons/table.svg';
import carpetIcon from '../assets/icons/carpet.svg';
import doorIcon from '../assets/icons/door.svg';
import plantIcon from '../assets/icons/plant.svg';
import presentIcon from '../assets/icons/present.svg';
import punchingbagIcon from '../assets/icons/punchingbag.svg';
import rockIcon from '../assets/icons/rock.svg';
import rowboatIcon from '../assets/icons/rowboat.svg';
import safeIcon from '../assets/icons/safe.svg';
import sharkIcon from '../assets/icons/shark.svg';
import statueIcon from '../assets/icons/statue.svg';
import teddybearIcon from '../assets/icons/teddybear.svg';
import trashcanIcon from '../assets/icons/trashcan.svg';
import treeIcon from '../assets/icons/tree.svg';
import tvIcon from '../assets/icons/tv.svg';

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
'barrel': barrelIcon,
'bear': bearIcon,
'bed': bedIcon,
'boar': boarIcon,
'bonsai': bonsaiIcon,
'box': boxIcon,
'cactus': cactusIcon,
'camera': cameraIcon,
'car': carIcon,
'catapult': catapultIcon,
'chair': chairIcon,
'crate': crateIcon,
'crocodile': crocodileIcon,
'easel': easelIcon,
'elephant': elephantIcon,
'flag': flagIcon,
'flowers': flowersIcon,
'golf cart': golfcartIcon,
'golf tee': golfteeIcon,
'horse': horseIcon,
'house': houseIcon,
'lily pad': lilypadIcon,
'lion': lionIcon,
'oil slick': oilslickIcon,
'painting': paintingIcon,
'paint spill': paintspillIcon,
'penguin': penguinIcon,
'puddle': puddleIcon,
'register': registerIcon,
'shrub': shrubIcon,
'shelf': shelfIcon,
'table': tableIcon,
'carpet': carpetIcon,
'door': doorIcon,
'plant': plantIcon,
'present': presentIcon,
'punching bag': punchingbagIcon,
'rock': rockIcon,
'rowboat': rowboatIcon,
'safe': safeIcon,
'shark': sharkIcon,
'statue': statueIcon,
'teddy bear': teddybearIcon,
'trashcan': trashcanIcon,
'tree': treeIcon,
'TV': tvIcon,
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
