import { cellKey } from './cellKey';
import { AREA_COLORS } from '../data/objectLibrary';

// Assigns each area a color, builds a per-cell area lookup, and picks one
// anchor cell per area (bottom-most, then right-most cell of that area) to
// place its name label — mirrors how the reference board labels areas at
// the bottom edge of their block.
export function buildAreaLayout(puzzle) {
  const areaNames = Object.keys(puzzle.areas);
  const colorByArea = {};
  areaNames.forEach((name, i) => { colorByArea[name] = AREA_COLORS[i % AREA_COLORS.length]; });

  const areaByCell = {};
  areaNames.forEach((name) => {
    for (const [r, c] of puzzle.areas[name].cells) areaByCell[cellKey(r, c)] = name;
  });

  const labelAnchor = {};
  areaNames.forEach((name) => {
    const cells = puzzle.areas[name].cells;
    const anchor = cells.reduce((best, cur) => {
      if (!best) return cur;
      if (cur[0] > best[0]) return cur;
      if (cur[0] === best[0] && cur[1] > best[1]) return cur;
      return best;
    }, null);
    labelAnchor[cellKey(anchor[0], anchor[1])] = name;
  });

  return { colorByArea, areaByCell, labelAnchor };
}
