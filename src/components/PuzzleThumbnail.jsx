import { buildAreaLayout } from '../utils/areaLayout';
import { OBJECT_EMOJI, FALLBACK_EMOJI, twemojiUrl } from '../data/objectIcons';

export default function PuzzleThumbnail({ puzzle, size = 120 }) {
  const n = puzzle.grid_size;
  const cell = size / n;
  const { areaByCell, styleByArea } = buildAreaLayout(puzzle);

  const rects = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r}_${c}`;
      const areaName = areaByCell[key];
      const style = styleByArea[areaName];
      rects.push(
        <rect
          key={key}
          x={c * cell} y={r * cell} width={cell} height={cell}
          fill={style?.backgroundColor || '#e2e8f0'}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="0.5"
        />
      );
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8, display: 'block' }}>
      {rects}
      {puzzle.objects?.map((o) => o.cells.map(([r, c], i) => {
        const emoji = OBJECT_EMOJI[o.type] || FALLBACK_EMOJI;
        const iconSize = cell * 0.62;
        return (
          <image
            key={`${o.id}_${i}`}
            href={twemojiUrl(emoji)}
            x={c * cell + (cell - iconSize) / 2}
            y={r * cell + (cell - iconSize) / 2}
            width={iconSize}
            height={iconSize}
          />
        );
      }))}
    </svg>
  );
}
