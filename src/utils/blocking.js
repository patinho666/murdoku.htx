import { cellKey } from './cellKey';

// Can water hold a person on its own (swimming/wading), or only via a boat
// or lily pad?
//
// `true` matches the intended rule: water is ordinary terrain and only
// OBJECTS block. Set to `false` to go back to "water is impassable unless
// something occupiable sits on it".
//
// Keep this in step with the generator. If the app allows people in open
// water but the generator never places them there, the app's candidate set
// is larger than the one the puzzle was proved unique against — so a puzzle
// that is solvable by pure elimination for the generator can look ambiguous
// to a player.
export const WATER_IS_OCCUPIABLE = true;

const TERRAIN_BLOCKS = { water: !WATER_IS_OCCUPIABLE };
// Objects that make a cell standable even when its terrain would not be.
const WATER_OK_TYPES = new Set(['boat', 'rowboat', 'lily pad']);

// Which cells can NOT hold a person. A blocking OBJECT always blocks,
// whatever the terrain under it (a rock, a table, a shark). Terrain blocks
// only if TERRAIN_BLOCKS says so and nothing occupiable is sitting on it.
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
      const obj = objectByCell[key];

      if (obj && obj.blocking === true) { blocked.add(key); continue; }

      const terrain = terrainByCell[key] || 'floor';
      if (TERRAIN_BLOCKS[terrain]) {
        const rescued = obj && (WATER_OK_TYPES.has(obj.type) || obj.blocking === false);
        if (!rescued) blocked.add(key);
      }
    }
  }
  return blocked;
}
