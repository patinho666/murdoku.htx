// The victim's sex matters as much as a suspect's — clues can refer to an
// unnamed "woman"/"man" who turns out to be the victim. Resolved in order:
//   1. puzzle.victim_gender  (present throughout the current data)
//   2. a matching entry in puzzle.suspects
//   3. the generator's fixed victim names, for older data lacking the field
//   4. null — the UI then shows no symbol rather than guessing
const VICTIM_GENDER = {
  Vernon: 'm', Vidal: 'm', Valeria: 'f', Verity: 'f', Vaughn: 'm', Vance: 'm',
};

export function victimGender(puzzle) {
  if (puzzle.victim_gender) return puzzle.victim_gender;
  const listed = puzzle.suspects?.find((s) => s.name === puzzle.victim);
  if (listed?.gender) return listed.gender;
  return VICTIM_GENDER[puzzle.victim] ?? null;
}

// Each figure gets a permanent slot inside every cell's mini-grid, sized to
// fit the whole cast (some puzzles have up to ~11 people), so "Alma" is
// always in the same spot in every cell, "Bertrand" always in the next
// spot, etc. Figures are sorted alphabetically by name (victim included).
export function getAllPeople(puzzle) {
  const people = [
    ...puzzle.suspects.map((s) => ({ name: s.name, gender: s.gender, isVictim: false })),
    { name: puzzle.victim, gender: victimGender(puzzle), isVictim: true },
  ];
  people.sort((a, b) => a.name.localeCompare(b.name));

  const count = people.length;
  const cols = Math.max(3, Math.ceil(Math.sqrt(count)));
  const rows = Math.ceil(count / cols);

  return people.map((p, i) => ({
    ...p,
    letter: p.name[0].toUpperCase(),
    slot: { row: Math.floor(i / cols), col: i % cols },
    color: PERSON_COLORS[i % PERSON_COLORS.length],
    gridRows: rows,
    gridCols: cols,
  }));
}

export const PERSON_COLORS = [
  '#e11d48', '#2563eb', '#16a34a', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4338ca',
  '#0d9488', '#a21caf', '#4d7c0f', '#b91c1c', '#1d4ed8', '#a16207',
];
