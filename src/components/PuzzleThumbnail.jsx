import { buildAreaLayout } from '../utils/areaLayout';
import { TERRAIN_COLOR } from '../data/objectLibrary';
import { cellKey } from '../utils/cellKey';
import { iconUrlForType } from '../data/objectIcons';

export default function PuzzleThumbnail({ puzzle, size = 120 }) {
  const n = puzzle.grid_size;
  const cell = size / n;
  const { areaByCell, styleByArea } = buildAreaLayout(puzzle);

  // The board gives water and grass their own colour regardless of area.
  // The thumbnail must match, or a lagoon looks like dry land here and a
  // boat or shark appears to be sitting on the beach.
  const terrainByCell = {};
  for (const t of puzzle.terrain) terrainByCell[cellKey(t.cell[0], t.cell[1])] = t.type;

  const rects = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r}_${c}`;
      const areaName = areaByCell[key];
      const terrain = terrainByCell[key] || 'floor';
      const style = styleByArea[areaName];
      const fillColor = terrain === 'water' ? TERRAIN_COLOR.water
        : terrain === 'grass' ? TERRAIN_COLOR.grass
        : (style?.backgroundColor || '#e2e8f0');
      rects.push(
        <rect
          key={key}
          x={c * cell} y={r * cell} width={cell} height={cell}
          fill={fillColor}
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
        const ix = c * cell + (cell * spanC - iconSize) / 2;
        const iy = r * cell + (cell * spanR - iconSize) / 2;
        // Artwork is drawn lying along the horizontal, so a footprint that
        // runs DOWN the board is turned a quarter turn — the board does the
        // same, and without it a vertical bed shows up lying sideways here.
        const vertical = spanR > spanC;
        return (
          <image
            key={o.id}
            href={url}
            x={ix}
            y={iy}
            width={iconSize}
            height={iconSize}
            transform={vertical ? `rotate(90 ${ix + iconSize / 2} ${iy + iconSize / 2})` : undefined}
          />
        );
      })}
    </svg>
  );
}
