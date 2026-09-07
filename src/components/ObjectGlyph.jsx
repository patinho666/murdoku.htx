import { FALLBACK_EMOJI, OBJECT_EMOJI, iconUrlForType } from '../data/objectIcons';
import { TINT_STRENGTH } from '../utils/color';

// `size` can be a number (fixed px, used in fixed-size contexts like the
// glossary or the thumbnail) or a CSS length string like '100%' (used on
// the board, so the icon scales with its cell instead of a fixed pixel
// size that looks tiny on huge cells and overflows tiny ones).
//
// `tint` is a hex colour: when given, the artwork is recoloured into that
// hue family so objects belong to the board instead of reading as stickers
// pasted on top. Left off (e.g. in the glossary) the original full-colour
// artwork shows, which is what you want for a reference chart.
export default function ObjectGlyph({ type, size = 16, dropShadow = true, tint, className }) {
  const url = iconUrlForType(type);
  const dimension = typeof size === 'number' ? `${size}px` : size;

  if (!url) {
    const emoji = OBJECT_EMOJI[type] || FALLBACK_EMOJI;
    return <span style={{ fontSize: typeof size === 'number' ? size * 0.9 : '80%', lineHeight: 1 }}>{emoji}</span>;
  }

  // Tinting is done by blending a colour layer over the artwork, masked to
  // the icon's own shape, rather than by a grayscale->sepia->hue-rotate
  // filter chain. That chain rotated the hue of EVERY pixel, so whatever
  // the strength, a green plant and a brown crate both ended up the theme
  // colour. `mix-blend-mode: color` takes hue and saturation from the
  // overlay but keeps the artwork's own luminosity, and the opacity decides
  // how far towards the theme it goes — so objects stay recognisably
  // themselves and are only nudged towards the palette.
  const shadow = dropShadow ? 'drop-shadow(0 1px 0 rgba(0,0,0,0.45))' : undefined;

  return (
    <span
      className="glyph-wrap"
      style={{ width: dimension, height: dimension }}
    >
      <img
        src={url}
        alt={type}
        draggable={false}
        decoding="async"
        className={className}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', filter: shadow }}
      />
      {tint && TINT_STRENGTH > 0 && (
        <span
          className="glyph-tint"
          style={{
            background: tint,
            opacity: TINT_STRENGTH,
            WebkitMaskImage: `url("${url}")`,
            maskImage: `url("${url}")`,
          }}
        />
      )}
    </span>
  );
}
