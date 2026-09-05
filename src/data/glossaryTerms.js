// Each entry's `diagram` describes a MiniGrid config: highlighted cells and
// an optional arrow. All original for this app.
export const GLOSSARY_SECTIONS = [
  {
    id: 'basic-directions',
    title: 'Basic Directions',
    entries: [
      {
        term: 'Beside',
        desc: 'Directly adjacent — up, down, left, or right of a cell or object (not diagonal) — AND in the same named area. A cell that is physically adjacent but across an area boundary (e.g. Deck vs. Boathouse) does not count as "beside," even though it touches. Doors are the exception: a door sits ON the boundary itself, so you can be beside a door from either area it joins.',
        diagram: { cells: [{ r: 2, c: 2, label: 'X', color: '#64748b' }, { r: 2, c: 3, label: 'A', color: '#e11d48' }] },
      },
      {
        term: 'North of',
        desc: 'Strictly above — same or different column, any row above.',
        diagram: { cells: [{ r: 3, c: 2, label: 'X', color: '#64748b' }, { r: 1, c: 2, label: 'A', color: '#e11d48' }], arrow: { from: [3, 2], to: [1, 2] } },
      },
      {
        term: 'South of',
        desc: 'Strictly below — same or different column, any row below.',
        diagram: { cells: [{ r: 1, c: 2, label: 'X', color: '#64748b' }, { r: 3, c: 2, label: 'A', color: '#e11d48' }], arrow: { from: [1, 2], to: [3, 2] } },
      },
      {
        term: 'East of',
        desc: 'Strictly to the right — same or different row, any column to the right.',
        diagram: { cells: [{ r: 2, c: 1, label: 'X', color: '#64748b' }, { r: 2, c: 3, label: 'A', color: '#e11d48' }], arrow: { from: [2, 1], to: [2, 3] } },
      },
      {
        term: 'West of',
        desc: 'Strictly to the left — same or different row, any column to the left.',
        diagram: { cells: [{ r: 2, c: 3, label: 'X', color: '#64748b' }, { r: 2, c: 1, label: 'A', color: '#e11d48' }], arrow: { from: [2, 3], to: [2, 1] } },
      },
      {
        term: 'Northeast of',
        desc: 'Above AND to the right, both at once.',
        diagram: { cells: [{ r: 3, c: 1, label: 'X', color: '#64748b' }, { r: 1, c: 3, label: 'A', color: '#e11d48' }], arrow: { from: [3, 1], to: [1, 3] } },
      },
      {
        term: 'Northwest of',
        desc: 'Above AND to the left, both at once.',
        diagram: { cells: [{ r: 3, c: 3, label: 'X', color: '#64748b' }, { r: 1, c: 1, label: 'A', color: '#e11d48' }], arrow: { from: [3, 3], to: [1, 1] } },
      },
      {
        term: 'Southeast of / Southwest of',
        desc: 'Below AND to the right (southeast), or below AND to the left (southwest).',
        diagram: { cells: [{ r: 1, c: 1, label: 'X', color: '#64748b' }, { r: 3, c: 3, label: 'A', color: '#e11d48' }], arrow: { from: [1, 1], to: [3, 3] } },
      },
    ],
  },
  {
    id: 'exact-offsets',
    title: 'Exact Row / Column Offsets',
    entries: [
      {
        term: 'Exactly one row south of',
        desc: 'Row + 1, in any column — not "somewhere below", but the very next row down.',
        diagram: { cells: [{ r: 2, c: 2, label: 'X', color: '#64748b' }, { r: 3, c: 2, label: 'A', color: '#e11d48' }], arrow: { from: [2, 2], to: [3, 2] } },
      },
      {
        term: 'Exactly one column east of',
        desc: 'Column + 1, in any row.',
        diagram: { cells: [{ r: 2, c: 1, label: 'X', color: '#64748b' }, { r: 2, c: 2, label: 'A', color: '#e11d48' }], arrow: { from: [2, 1], to: [2, 2] } },
      },
      {
        term: 'Exactly N rows/columns north/south/east/west of',
        desc: 'A precise offset — e.g. "exactly three columns west of" means column − 3, any row.',
        diagram: { cells: [{ r: 2, c: 4, label: 'X', color: '#64748b' }, { r: 2, c: 1, label: 'A', color: '#e11d48' }], arrow: { from: [2, 4], to: [2, 1] } },
      },
      {
        term: 'Same diagonal as — BOTH diagonals, BOTH ends',
        desc: 'The row distance equals the column distance. Two separate lines run through X, not one: the \u2196\u2198 line (top-left to bottom-right) AND the \u2199\u2197 line (bottom-left to top-right). A may sit anywhere on either of them, above OR below X. The clue never says which of the four arms — every cell marked A here satisfies it equally.',
        diagram: {
          cells: [
            { r: 2, c: 2, label: 'X', color: '#64748b' },
            { r: 0, c: 0, label: 'A', color: '#e11d48' },
            { r: 4, c: 4, label: 'A', color: '#e11d48' },
            { r: 4, c: 0, label: 'A', color: '#e11d48' },
            { r: 0, c: 4, label: 'A', color: '#e11d48' },
          ],
        },
      },
    ],
  },
  {
    id: 'row-col-location',
    title: 'Row / Column Location',
    entries: [
      {
        term: 'First column / Last column',
        desc: 'The leftmost or rightmost column of the board.',
        diagram: { cells: [{ r: 2, c: 0, label: 'A', color: '#e11d48' }, { r: 2, c: 4, label: 'B', color: '#2563eb' }] },
      },
      {
        term: 'Top row / Bottom row',
        desc: 'The topmost or bottommost row of the board.',
        diagram: { cells: [{ r: 0, c: 2, label: 'A', color: '#e11d48' }, { r: 4, c: 2, label: 'B', color: '#2563eb' }] },
      },
      {
        term: 'In row N',
        desc: 'A specific numbered row (rows are numbered starting from 0 in this app, matching the puzzle data).',
        diagram: { cells: [{ r: 3, c: 2, label: 'A', color: '#e11d48' }], dimmedRows: [3] },
      },
      {
        term: '"In a corner of her area"',
        desc: 'A cell where two outer edges of that AREA meet — the corner of the room, not the corner of the whole board. An irregular area can have several corners, and a one-cell area is all corner.',
        diagram: { cells: [{ r: 1, c: 1, label: 'A', color: '#e11d48' }] },
      },
      {
        term: 'In column N',
        desc: 'A specific numbered column, same idea as "in row N" but vertical.',
        diagram: { cells: [{ r: 2, c: 3, label: 'A', color: '#e11d48' }], dimmedCols: [3] },
      },
    ],
  },
  {
    id: 'areas',
    title: 'Areas',
    entries: [
      {
        term: '"...was in the same area as X"',
        desc: 'Both people are inside the same named area (like "Deck" or "Boathouse") — not just physically close. Two adjacent cells can belong to different areas, so this is about the named region, not distance.',
        diagram: { cells: [{ r: 2, c: 1, label: 'A', color: '#e11d48' }, { r: 3, c: 2, label: 'B', color: '#2563eb' }] },
      },
      {
        term: '"Someone else in her area was in front of a door"',
        desc: 'Tells you about an UNNAMED third person rather than the named suspect. It means: the named person\'s area contains at least one other person, and that other person is at a door. You learn a fact about the area\'s occupancy without learning who — combine it with other clues to work out who it must be.',
        diagram: null,
      },
      {
        term: '"There was someone [direction] of X, in the same area"',
        desc: 'A compound clue: some unnamed person shares X\'s area AND sits in that direction relative to X. You don\'t learn who that other person is directly — only that at least one more suspect is in the same area, positioned that way.',
        diagram: { cells: [{ r: 3, c: 2, label: 'X', color: '#64748b' }, { r: 1, c: 2, label: '?', color: '#94a3b8' }], arrow: { from: [3, 2], to: [1, 2] } },
      },
    ],
  },
  {
    id: 'reading-the-wording',
    title: 'Reading the Wording',
    entries: [
      {
        term: '"a" vs "the" — this is a clue, not grammar',
        desc: 'The article tells you HOW MANY of that object exist on the board. "the table" means there is exactly ONE table anywhere in the case, so the clue pins you to that single object\'s neighbourhood. "a box" means there are TWO OR MORE boxes, so the clue allows the neighbourhood of any of them. Checked against every clue in the current puzzle set: the rule holds without exception, so you can rely on it.',
        diagram: null,
      },
      {
        term: 'Negative clues — "was NOT beside a rock"',
        desc: 'Rules cells OUT instead of in. On a crowded board these are often the most powerful clues you get, because one negative can eliminate a whole cluster at once. They also appear combined with a positive in the same line — "X was not beside a statue, beside the bonsai" is two constraints: never next to any statue, AND next to the bonsai.',
        diagram: { cells: [{ r: 2, c: 2, label: 'X', color: '#64748b' }, { r: 2, c: 3, label: '\u2717', color: '#dc2626' }, { r: 1, c: 2, label: '\u2717', color: '#dc2626' }, { r: 3, c: 2, label: '\u2717', color: '#dc2626' }, { r: 2, c: 1, label: '\u2717', color: '#dc2626' }] },
      },
      {
        term: 'Compound clues — two sentences, both true',
        desc: 'A suspect\'s clue often contains more than one sentence ("X was alone. X was beside the trashcan."). Every sentence must hold at the same time; they are not alternatives. Treat each sentence as its own constraint and intersect them.',
        diagram: null,
      },
      {
        term: 'Prepositions: "on", "in", "sitting in", "in front of"',
        desc: 'These all mean the same thing mechanically — the person occupies that object\'s cell. The wording just fits the object: you sit IN a chair, stand ON a carpet or a bed, ride ON a horse, and stand IN FRONT OF a door. Do not read anything extra into the choice of word; the only preposition that behaves differently is the door\'s, because a door sits on a boundary (see Special Mechanics).',
        diagram: null,
      },
      {
        term: 'Gender clues — "there was a woman / a man"',
        desc: 'Some clues identify an unnamed person only by sex: "Exactly one column east of him, there was a woman." To use these you need to know each suspect\'s sex, which is why every name in the clue list and on the suspect buttons is marked \u2640 or \u2642. The victim is marked too — the victim can be the person a clue is talking about.',
        diagram: null,
      },
    ],
  },
  {
    id: 'global-clues',
    title: 'Global Clues',
    entries: [
      {
        term: '"There was no empty area."',
        desc: 'A constraint on the WHOLE board rather than on one person: every named area holds at least one person (the victim counts). With as many areas as people this can force the layout almost single-handedly — if an area still has no candidate left, something earlier is wrong. One of the most common clues in the current set, and easy to forget because it names nobody.',
        diagram: null,
      },
    ],
  },
  {
    id: 'uniqueness',
    title: 'Uniqueness',
    entries: [
      {
        term: '"...was the only person on/beside X"',
        desc: 'Exactly one suspect touches that object or terrain — everyone else is somewhere else.',
        diagram: { cells: [{ r: 2, c: 2, label: 'A', color: '#e11d48' }] },
      },
    ],
  },
  {
    id: 'exact-counts',
    title: 'Exact Counts',
    entries: [
      {
        term: '"There was/were exactly N people on/in [object or area]"',
        desc: 'A precise headcount, not a minimum — exactly that many, no more and no fewer. The victim counts toward this total just like any suspect — a clue like "exactly one person on the chair" is satisfied if the victim is the one sitting there, even with zero suspects on it.',
        diagram: { cells: [{ r: 1, c: 1, label: 'A', color: '#e11d48' }, { r: 1, c: 2, label: 'B', color: '#2563eb' }] },
      },
      {
        term: '"Nobody was on/in X"',
        desc: 'A zero-count clue — that object, terrain, or area is empty. No suspect and not the victim either.',
        diagram: { cells: [{ r: 2, c: 2, label: '∅', color: '#64748b' }] },
      },
    ],
  },
  {
    id: 'alone',
    title: 'Alone',
    entries: [
      {
        term: '"X was alone." (no one else at all)',
        desc: 'Nobody else was in that person\'s area — not another suspect, not the victim. Different from "alone with Y", which means exactly two people were there. Bare "alone" is a strong clue: it empties a whole area of everyone but that one person.',
        diagram: { cells: [{ r: 2, c: 2, label: 'A', color: '#e11d48' }] },
      },
      {
        term: '"X was alone with Y"',
        desc: 'Only those two people shared that area — no one else was in it with them. This is exactly how the victim clue works: the victim was alone with the murderer, so once you know everyone else\'s area, the murderer is whoever shares the victim\'s area.',
        diagram: { cells: [{ r: 2, c: 1, label: 'A', color: '#e11d48' }, { r: 2, c: 2, label: 'B', color: '#2563eb' }] },
      },
    ],
  },
  {
    id: 'special-mechanics',
    title: 'Special Mechanics',
    entries: [
      {
        term: 'Doors sit ON a boundary — "was in front of the door"',
        desc: 'A door is drawn on the dividing line between two areas, not inside a cell. It occupies the two cells either side of that line, and a person at the door may be standing in EITHER of them — so "X was in front of the door" narrows X to two cells in two different areas, not to one spot. This also means head-count clues about a door ("there was exactly one person on the door", "nobody was on the door") count both sides of it together.',
        diagram: { cells: [{ r: 2, c: 1, label: 'A', color: '#e11d48' }, { r: 2, c: 2, label: 'B', color: '#2563eb' }] },
      },
      {
        term: 'Terrain clues — "was on the path"',
        desc: 'Terrain (path, sand, grass, floor, water) is a property of the cell, not an object sitting on it, so "X was on the path" allows EVERY path cell on the board — usually a broad clue. It says nothing about what object, if any, is also in that cell.',
        diagram: null,
      },
      {
        term: 'Water is occupiable — "was on the water"',
        desc: 'Water is terrain, not an object, so "X was on the water" tells you only that X is on a water cell — it does NOT tell you how. X may be in a rowboat, on a lily pad, or in the water itself with nothing under them. All three are the same clue. If you also learn "X was in a rowboat" or "X was on a lily pad", that is a SEPARATE clue about the object, and combining the two is what narrows the cell down. Water never blocks by itself; only a blocking object (a rock, a shark, a table) makes a cell impossible.',
        diagram: { cells: [{ r: 2, c: 2, label: 'A', color: '#e11d48' }] },
      },
      {
        term: 'Numbered areas — "in Hole 4", "immediately before/after"',
        desc: 'Some themes number their areas instead of naming them (Hole 1..9, Cell 1..9). "X was in Hole 4" is then just an ordinary area clue. "Immediately before/after" uses that ordering: immediately before/after Hole 5 means Hole 4 or Hole 6 — and at the ends of the range only one neighbour exists.',
        diagram: null,
      },
      {
        term: '"Was not in the water, but beside it"',
        desc: 'A dry cell that is edge-adjacent to at least one water cell — someone standing at the water\'s edge. Since people CAN be in the water, this clue is doing real work: it rules out every water cell AND every dry cell not touching water. Diagonal touching does not count.',
        diagram: { cells: [{ r: 2, c: 2, label: 'A', color: '#e11d48' }, { r: 2, c: 3, label: '≈', color: '#7fb8d6' }] },
      },
      {
        term: 'Role references (e.g. "the murderer")',
        desc: 'Some clues point at a suspect by a hidden role instead of their name — "Ada was exactly 8 rows north of the murderer." The murderer IS one of the suspects, but which one is never stated directly; you have to work it out from how the role is used across the other clues, the same way you work out anyone else\'s position. Once you know who holds the role, every clue that mentions it becomes an ordinary clue about that suspect.',
        diagram: null,
      },
    ],
  },
];
