import { cellKey } from './cellKey';

// `fixed` is { personName: [r, c] }. Returns true only if every person in
// the puzzle (suspects + victim) has been fixed to their exact solution cell.
export function checkSolution(puzzle, fixed) {
  const people = { ...puzzle.solution.people };
  const names = Object.keys(people);
  if (names.length === 0) return false;
  for (const name of names) {
    const fixedCell = fixed[name];
    if (!fixedCell) return false;
    const [fr, fc] = fixedCell;
    const [sr, sc] = people[name].cell;
    if (fr !== sr || fc !== sc) return false;
  }
  return true;
}

export function solutionCellKeySet(puzzle) {
  const set = {};
  for (const [name, info] of Object.entries(puzzle.solution.people)) {
    set[name] = cellKey(info.cell[0], info.cell[1]);
  }
  return set;
}
