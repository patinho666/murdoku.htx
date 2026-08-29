import { shadeColor } from './color';

// Each pattern is a function(base, alt) -> CSS background-image/size, using
// two shades of the SAME area color so the texture reads as a variation of
// that area's theme rather than an unrelated overlay.
const PATTERNS = [
  // checkerboard (small sub-squares within each cell)
  (base, alt) => ({
    backgroundImage: `conic-gradient(${alt} 25%, ${base} 0 50%, ${alt} 0 75%, ${base} 0)`,
    backgroundSize: '34% 34%',
  }),
  // vertical stripes
  (base, alt) => ({
    backgroundImage: `repeating-linear-gradient(90deg, ${alt} 0 16%, ${base} 16% 32%)`,
    backgroundSize: 'auto',
  }),
  // diagonal planks
  (base, alt) => ({
    backgroundImage: `repeating-linear-gradient(45deg, ${alt} 0 14%, ${base} 14% 28%)`,
    backgroundSize: 'auto',
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
  // horizontal ripple (water-ish)
  (base, alt) => ({
    backgroundImage: `repeating-linear-gradient(0deg, ${alt} 0 12%, transparent 12% 34%)`,
    backgroundSize: 'auto',
  }),
  // plain
  () => ({ backgroundImage: 'none' }),
];

export function buildPatternStyle(baseColor, patternIndex) {
  const pattern = PATTERNS[patternIndex % PATTERNS.length];
  const alt = shadeColor(baseColor, -10);
  return { backgroundColor: baseColor, ...pattern(baseColor, alt) };
}

export const PATTERN_COUNT = PATTERNS.length;
