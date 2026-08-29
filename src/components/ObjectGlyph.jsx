import { useState } from 'react';
import { OBJECT_EMOJI, FALLBACK_EMOJI, twemojiUrl } from '../data/objectIcons';

export default function ObjectGlyph({ type, size = 16, dropShadow = true, className }) {
  const emoji = OBJECT_EMOJI[type] || FALLBACK_EMOJI;
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>{emoji}</span>;
  }

  return (
    <img
      src={twemojiUrl(emoji)}
      alt={type}
      width={size}
      height={size}
      draggable={false}
      className={className}
      onError={() => setFailed(true)}
      style={dropShadow ? { filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))', display: 'block' } : { display: 'block' }}
    />
  );
}
