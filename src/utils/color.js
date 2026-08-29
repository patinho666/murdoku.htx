// Lightens (positive percent) or darkens (negative percent) a hex color.
// Used to derive a texture's secondary shade from an area's own base color,
// so patterns stay "in family" with that area's color rather than
// introducing an unrelated hue.
export function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0xff) + Math.round(2.55 * percent);
  let b = (num & 0xff) + Math.round(2.55 * percent);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Hue angle (0-360) of a hex color — used to tint object artwork toward
// the board's theme colour.
export function hueOf(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d === 0) return 0;
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  return h < 0 ? h + 360 : h;
}

// Twemoji artwork is fixed full-colour, so objects otherwise read as
// stickers pasted onto the board. The reference boards instead draw every
// object in the board's own hue family. This filter chain flattens the
// artwork to luminance (grayscale), re-tints it (sepia lands near 40deg,
// so rotate from there to the target hue), then restores contrast — which
// keeps the internal shading/outlines that a flat silhouette mask would
// throw away.
export function tintFilter(hex, { saturate = 2.2, brightness = 0.72, contrast = 1.35 } = {}) {
  const h = hueOf(hex);
  const rotate = Math.round(h - 40);
  return `grayscale(1) sepia(1) hue-rotate(${rotate}deg) saturate(${saturate}) brightness(${brightness}) contrast(${contrast})`;
}
