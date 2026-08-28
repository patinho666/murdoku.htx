// 3x3 slot grid inside a cell: top-left, top-center, top-right, mid-left, ...
// Figures are sorted alphabetically by name (victim included) and each gets
// a permanent slot index for the whole puzzle, so "Alma" is always in the
// same spot in every cell, "Bertrand" always in the next spot, etc.
export const SLOT_POSITIONS = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
];

export function getAllPeople(puzzle) {
  const people = [
    ...puzzle.suspects.map((s) => ({ name: s.name, gender: s.gender, isVictim: false })),
    { name: puzzle.victim, gender: null, isVictim: true },
  ];
  people.sort((a, b) => a.name.localeCompare(b.name));
  return people.map((p, i) => ({
    ...p,
    letter: p.name[0].toUpperCase(),
    slot: SLOT_POSITIONS[i % SLOT_POSITIONS.length],
    color: PERSON_COLORS[i % PERSON_COLORS.length],
  }));
}

export const PERSON_COLORS = [
  '#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#dc2626', '#4338ca',
];
