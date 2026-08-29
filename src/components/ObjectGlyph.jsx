import { useState } from 'react';
import { OBJECT_EMOJI, FALLBACK_EMOJI, twemojiUrl } from '../data/objectIcons';

// `size` can be a number (fixed px, used in fixed-size contexts like the
// glossary or the thumbnail) or a CSS length string like '100%' (used on
// the board, so the icon scales with its cell instead of a fixed pixel
// size that looks tiny on huge cells and overflows tiny ones).
export default function ObjectGlyph({ type, size = 16, dropShadow = true, className }) {
  const emoji = OBJECT_EMOJI[type] || FALLBACK_EMOJI;
  const [failed, setFailed] = useState(false);
  const dimension = typeof size === 'number' ? `${size}px` : size;

  if (failed) {
    return <span style={{ fontSize: typeof size === 'number' ? size * 0.9 : '80%', lineHeight: 1 }}>{emoji}</span>;
  }

  return (
    <img
      src={twemojiUrl(emoji)}
      alt={type}
      draggable={false}
      className={className}
      onError={() => setFailed(true)}
      style={{
        width: dimension,
        height: dimension,
        display: 'block',
        objectFit: 'contain',
        ...(dropShadow ? { filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.55))' } : {}),
      }}
    />
  );
}
