import { cellKey } from './cellKey';
import { buildPatternStyle, areaColorFor } from './areaPatterns';

// Assigns each area a tint of the puzzle theme's single base hue plus its
// own texture, builds a per-cell area lookup, and picks one anchor cell
// per area (bottom-most, then left-most) for its name label.
export function buildAreaLayout(puzzle) {
  const areaNames = Object.keys(puzzle.areas);
  const colorByArea = {};
  const styleByArea = {};
  areaNames.forEach((name, i) => {
    const color = areaColorFor(puzzle.theme, i);
    colorByArea[name] = color;
    styleByArea[name] = buildPatternStyle(color, i);
  });

  const areaByCell = {};
  areaNames.forEach((name) => {
    for (const [r, c] of puzzle.areas[name].cells) areaByCell[cellKey(r, c)] = name;
  });

  // Label sits on the area's bottom-most row, left-most cell of that row —
  // matching how the reference boards anchor labels at an area's bottom
  // edge and let the text run rightwards from there.
  //
  // It prefers a cell with NO object in it. A label printed on top of a
  // chair or a barrel is hard to read and makes the board look cluttered,
  // and an area almost always has a free cell to use instead. If every cell
  // of the area is occupied, it falls back to the plain bottom-left cell so
  // the area is still named rather than going anonymous.
  const occupied = new Set();
  for (const o of puzzle.objects || []) {
    for (const c of o.cells) occupied.add(cellKey(c[0], c[1]));
  }

  const bottomLeftMost = (cells) => cells.reduce((best, cur) => {
    if (!best) return cur;
    if (cur[0] > best[0]) return cur;
    if (cur[0] === best[0] && cur[1] < best[1]) return cur;
    return best;
  }, null);

  const labelAnchor = {};
  areaNames.forEach((name) => {
    const cells = puzzle.areas[name].cells;
    const free = cells.filter(([r, c]) => !occupied.has(cellKey(r, c)));
    const anchor = bottomLeftMost(free.length ? free : cells);
    labelAnchor[cellKey(anchor[0], anchor[1])] = name;
  });

  return { colorByArea, styleByArea, areaByCell, labelAnchor };
}
