import { buildAreaLayout } from '../utils/areaLayout';
import { iconUrlForType } from '../data/objectIcons';

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
      {puzzle.objects?.map((o) => {
        // Draw each object ONCE over its whole footprint rather than once
        // per cell — otherwise a 2-cell door shows as two doors and a
        // rowboat as two rowboats.
        const url = iconUrlForType(o.type);
        if (!url) return null;
        const rs = o.cells.map((x) => x[0]);
        const cs = o.cells.map((x) => x[1]);
        const r = Math.min(...rs);
        const c = Math.min(...cs);
        const spanR = Math.max(...rs) - r + 1;
        const spanC = Math.max(...cs) - c + 1;
        const iconSize = cell * 0.62 * Math.max(spanR, spanC);
        return (
          <image
            key={o.id}
            href={url}
            x={c * cell + (cell * spanC - iconSize) / 2}
            y={r * cell + (cell * spanR - iconSize) / 2}
            width={iconSize}
            height={iconSize}
          />
        );
      })}
    </svg>
  );
}
