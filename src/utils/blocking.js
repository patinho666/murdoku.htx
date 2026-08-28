import { cellKey } from './cellKey';

// A cell cannot hold anyone if its terrain blocks movement (water, unless a
// water_ok object like a boat sits there) or if a blocking object occupies it.
export function buildBlockedCellSet(puzzle) {
  const blocked = new Set();
  const terrainByCell = {};
  for (const t of puzzle.terrain) terrainByCell[cellKey(t.cell[0], t.cell[1])] = t.type;

  const objectByCell = {};
  for (const o of puzzle.objects || []) {
    for (const c of o.cells) objectByCell[cellKey(c[0], c[1])] = o;
  }

  const n = puzzle.grid_size;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const key = cellKey(r, c);
      const terrain = terrainByCell[key] || 'floor';
      const obj = objectByCell[key];
      const waterOk = obj && WATER_OK_TYPES.has(obj.type);
      const terrainBlocks = terrain === 'water' && !waterOk;
      const objectBlocks = obj ? obj.blocking === true : false;
      if (terrainBlocks || objectBlocks) blocked.add(key);
    }
  }
  return blocked;
}

const WATER_OK_TYPES = new Set(['boat', 'rowboat', 'lily pad']);
