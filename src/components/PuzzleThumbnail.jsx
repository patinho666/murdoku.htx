import { buildAreaLayout } from '../utils/areaLayout';
import { TERRAIN_COLOR } from '../data/objectLibrary';
import { terrainTileUrl } from '../data/terrainTextures';
import { cellKey } from '../utils/cellKey';
import { iconUrlForType, UNTINTED_TYPES } from '../data/objectIcons';
import { TINT_STRENGTH } from '../utils/color';

export default function PuzzleThumbnail({ puzzle, size = 120 }) {
  const n = puzzle.grid_size;
  const cell = size / n;
  const { areaByCell, styleByArea } = buildAreaLayout(puzzle);

  // The board gives water and grass their own colour regardless of area.
  // The thumbnail must match, or a lagoon looks like dry land here and a
  // boat or shark appears to be sitting on the beach.
  const terrainByCell = {};
  for (const t of puzzle.terrain) terrainByCell[cellKey(t.cell[0], t.cell[1])] = t.type;

  // Fill each cell with the REAL terrain tile, via one <pattern> per
  // terrain type. The thumbnail used to fill flat TERRAIN_COLOR values,
  // which drifted out of step with the tiles the board actually draws — so
  // the preview never quite matched the puzzle you opened.
  const usedTerrains = [...new Set(Object.values(terrainByCell))];
  const patterns = usedTerrains
    .map((t) => ({ t, url: terrainTileUrl(t) }))
    .filter((x) => x.url);
  const patternFor = {};
  patterns.forEach(({ t }, i) => { patternFor[t] = `terr-${puzzle.id}-${i}`; });

  const rects = [];
  const borders = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r}_${c}`;
      const areaName = areaByCell[key];
      const terrain = terrainByCell[key] || 'floor';
      const style = styleByArea[areaName];
      // The board colours a cell by its TERRAIN (all floor cells look the
      // same in every room), so the thumbnail has to do the same. It used
      // to fill by AREA tint, which is why the little preview never matched
      // the board you actually opened.
      const fillColor = patternFor[terrain]
        ? `url(#${patternFor[terrain]})`
        : (TERRAIN_COLOR[terrain] || style?.backgroundColor || '#e2e8f0');
      rects.push(
        <rect
          key={key}
          x={c * cell} y={r * cell} width={cell} height={cell}
          fill={fillColor}
          stroke="rgba(11,16,32,0.28)"
          strokeWidth="0.5"
        />
      );
      // The board separates AREAS with a thick near-black outline. Without
      // the same lines here the preview reads as a flat field of terrain
      // and looks unlike the puzzle you open.
      const sameArea = (rr, cc) => areaByCell[`${rr}_${cc}`] === areaName;
      const edge = (x1, y1, x2, y2, k) => (
        <line key={`${key}-${k}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#0b1020" strokeWidth={Math.max(1.2, cell * 0.16)} strokeLinecap="square" />
      );
      if (r === 0 || !sameArea(r - 1, c)) borders.push(edge(c * cell, r * cell, (c + 1) * cell, r * cell, 't'));
      if (r === n - 1 || !sameArea(r + 1, c)) borders.push(edge(c * cell, (r + 1) * cell, (c + 1) * cell, (r + 1) * cell, 'b'));
      if (c === 0 || !sameArea(r, c - 1)) borders.push(edge(c * cell, r * cell, c * cell, (r + 1) * cell, 'l'));
      if (c === n - 1 || !sameArea(r, c + 1)) borders.push(edge((c + 1) * cell, r * cell, (c + 1) * cell, (r + 1) * cell, 'r'));
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8, display: 'block' }}>
      <defs>
        {patterns.map(({ t, url }, i) => (
          <pattern key={t} id={`terr-${puzzle.id}-${i}`} patternUnits="userSpaceOnUse" width={cell} height={cell}>
            <image href={url} x="0" y="0" width={cell} height={cell} preserveAspectRatio="none" />
          </pattern>
        ))}
      </defs>
      {rects}
      {borders}
      {puzzle.objects?.map((o) => {
        // Draw each object ONCE over its whole footprint rather than once
        // per cell, and apply the SAME theme tint the board applies — the
        // thumbnail used to draw icons in their raw colours, which is why
        // the preview never quite matched the puzzle you opened.
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
        const vertical = spanR > spanC;
        const rot = vertical ? `rotate(90 ${ix + iconSize / 2} ${iy + iconSize / 2})` : undefined;
        const terrain = terrainByCell[cellKey(r, c)] || 'floor';
        const tint = UNTINTED_TYPES.has(o.type)
          ? null
          : (terrain === 'water' ? TERRAIN_COLOR.water
            : terrain === 'grass' ? TERRAIN_COLOR.grass
            : (styleByArea[areaByCell[cellKey(r, c)]]?.backgroundColor || '#e2e8f0'));
        const maskId = `m-${puzzle.id}-${o.id}`;
        return (
          <g key={o.id} style={{ isolation: 'isolate' }}>
            {tint && (
              <mask id={maskId} maskUnits="userSpaceOnUse" style={{ maskType: 'alpha' }}>
                <image href={url} x={ix} y={iy} width={iconSize} height={iconSize} transform={rot} />
              </mask>
            )}
            <image href={url} x={ix} y={iy} width={iconSize} height={iconSize} transform={rot} />
            {tint && (
              <rect
                x={ix} y={iy} width={iconSize} height={iconSize}
                fill={tint} opacity={TINT_STRENGTH}
                mask={`url(#${maskId})`}
                style={{ mixBlendMode: 'color' }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
