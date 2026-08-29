import { shadeColor } from './color';

// Reference boards use ONE color family per puzzle (all pink, all dusty
// blue, all green...), with each area distinguished by a lighter/darker
// tint of that same hue plus its own texture — not by a different hue.
// That single-family look is most of what makes them read as designed
// rather than as a rainbow debug view, so themes map to a base hue here
// and areas get tints of it.
export const THEME_BASE = {
  manor:    '#c9a9c4',
  market:   '#e0b48f',
  frontier: '#e3c27e',
  lagoon:   '#7ec6c1',
  links:    '#a8c98f',
  cells:    '#9aa7c4',
  default:  '#b3b9d6',
};

// Tint ladder applied across the areas of one puzzle: alternating
// lighter/darker steps so adjacent areas stay distinguishable while
// remaining obviously the same family.
const TINT_STEPS = [0, -14, 10, -24, 20, -7, 15, -18, 5, -30, 25, -11];

const PATTERNS = [
  // checkerboard
  (base, alt) => ({
    backgroundImage: `conic-gradient(${alt} 25%, ${base} 0 50%, ${alt} 0 75%, ${base} 0)`,
    backgroundSize: '34% 34%',
  }),
  // vertical planks
  (base, alt) => ({
    backgroundImage: `repeating-linear-gradient(90deg, ${alt} 0 16%, ${base} 16% 32%)`,
    backgroundSize: 'auto',
  }),
  // brick / offset blocks
  (base, alt) => ({
    backgroundImage: `repeating-linear-gradient(0deg, ${alt} 0 46%, ${base} 46% 50%), repeating-linear-gradient(90deg, ${alt} 0 46%, ${base} 46% 50%)`,
    backgroundSize: '50% 34%',
  }),
  // speckle (grass/sand grain)
  (base, alt) => ({
    backgroundImage: [
      `radial-gradient(circle at 22% 28%, ${alt} 0 7%, transparent 8%)`,
      `radial-gradient(circle at 68% 62%, ${alt} 0 7%, transparent 8%)`,
      `radial-gradient(circle at 82% 22%, ${alt} 0 6%, transparent 7%)`,
      `radial-gradient(circle at 35% 78%, ${alt} 0 6%, transparent 7%)`,
    ].join(', '),
    backgroundSize: '55% 55%',
  }),
  // horizontal ripple
  (base, alt) => ({
    backgroundImage: `repeating-linear-gradient(0deg, ${alt} 0 12%, transparent 12% 34%)`,
    backgroundSize: 'auto',
  }),
  // diagonal weave
  (base, alt) => ({
    backgroundImage: `repeating-linear-gradient(45deg, ${alt} 0 14%, ${base} 14% 28%)`,
    backgroundSize: 'auto',
  }),
];

export function buildPatternStyle(baseColor, patternIndex) {
  const pattern = PATTERNS[patternIndex % PATTERNS.length];
  const alt = shadeColor(baseColor, -9);
  return { backgroundColor: baseColor, ...pattern(baseColor, alt) };
}

// Area color = the theme's base hue, shifted by that area's tint step.
export function areaColorFor(theme, areaIndex) {
  const base = THEME_BASE[theme] || THEME_BASE.default;
  return shadeColor(base, TINT_STEPS[areaIndex % TINT_STEPS.length]);
}

export const PATTERN_COUNT = PATTERNS.length;
