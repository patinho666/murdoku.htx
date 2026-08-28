import { TERRAIN_COLOR, AREA_PALETTE } from '../data/objectLibrary';

export default function PuzzleThumbnail({ puzzle, size = 120 }) {
  const n = puzzle.grid_size;
  const cell = size / n;
  const terrainByCell = {};
  for (const t of puzzle.terrain) terrainByCell[`${t.cell[0]}_${t.cell[1]}`] = t.type;

  const areaNames = Object.keys(puzzle.areas);
  const areaByCell = {};
  areaNames.forEach((name, idx) => {
    for (const [r, c] of puzzle.areas[name].cells) areaByCell[`${r}_${c}`] = idx;
  });

  const rects = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r}_${c}`;
      const terrain = terrainByCell[key] || 'floor';
      rects.push(
        <rect
          key={key}
          x={c * cell} y={r * cell} width={cell} height={cell}
          fill={TERRAIN_COLOR[terrain] || '#ddd'}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
      );
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 8, display: 'block' }}>
      {rects}
      {puzzle.objects?.map((o) => o.cells.map(([r, c], i) => (
        <text
          key={`${o.id}_${i}`}
          x={c * cell + cell / 2}
          y={r * cell + cell / 2 + cell * 0.15}
          fontSize={cell * 0.55}
          textAnchor="middle"
        >
          {ICONS[o.type] || '•'}
        </text>
      )))}
    </svg>
  );
}

const ICONS = {
  rock: '🪨', door: '🚪', chair: '🪑', carpet: '🟫', shark: '🦈', box: '📦',
  boat: '🛶', rowboat: '🚣', 'lily pad': '🌸', crocodile: '🐊', shrub: '🌿', flag: '🚩',
};
