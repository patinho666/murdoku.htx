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
        term: 'Same diagonal as',
        desc: 'The row distance equals the column distance (a true 45° line, either direction).',
        diagram: { cells: [{ r: 0, c: 0, label: 'X', color: '#64748b' }, { r: 3, c: 3, label: 'A', color: '#e11d48' }], arrow: { from: [0, 0], to: [3, 3] } },
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
        term: '"There was someone [direction] of X, in the same area"',
        desc: 'A compound clue: some unnamed person shares X\'s area AND sits in that direction relative to X. You don\'t learn who that other person is directly — only that at least one more suspect is in the same area, positioned that way.',
        diagram: { cells: [{ r: 3, c: 2, label: 'X', color: '#64748b' }, { r: 1, c: 2, label: '?', color: '#94a3b8' }], arrow: { from: [3, 2], to: [1, 2] } },
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
        term: 'Water is occupiable — "was on the water"',
        desc: 'Water is terrain, not an object, so "X was on the water" tells you only that X is on a water cell — it does NOT tell you how. X may be in a rowboat, on a lily pad, or in the water itself with nothing under them. All three are the same clue. If you also learn "X was in a rowboat" or "X was on a lily pad", that is a SEPARATE clue about the object, and combining the two is what narrows the cell down. Water never blocks by itself; only a blocking object (a rock, a shark, a table) makes a cell impossible.',
        diagram: { cells: [{ r: 2, c: 2, label: 'A', color: '#e11d48' }] },
      },
      {
        term: 'Immediately before/after (ordered areas)',
        desc: 'For themes with numbered/ordered areas (like golf holes or cell blocks), this means the adjacent number either side — e.g. immediately before/after Hole 5 means Hole 4 or Hole 6.',
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
