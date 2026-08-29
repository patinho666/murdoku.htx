# Murdoku

Multiplayer murder-mystery logic puzzle, built for iPhone browsers, using
Firebase Firestore for realtime sync and Netlify for hosting.

## How it maps to the spec

- **Login by name only** — `src/context/UserContext.jsx`. The name is
  slugified into a deterministic user id, so entering the same name again
  always returns to the same "account" — no password needed.
- **Puzzle list** — `src/pages/PuzzleList.jsx`. Puzzles are static JSON files
  bundled with the app (see `src/data/puzzles/`), shown with an auto-generated
  SVG mini-map "screenshot" (`PuzzleThumbnail.jsx`), grid size, difficulty,
  and each user's own progress (new / in progress / solved), read live from
  `users/{uid}/progress/{puzzleId}`.
- **Shared session / multiplayer** — `src/hooks/useSession.js`. Opening a
  puzzle creates (or resumes) a `sessions/{sessionId}` document. Sharing the
  in-room "Share" button copies a link containing that session id; anyone who
  opens it joins the same live document. All marks/fixes are Firestore field
  updates, so every connected player sees every action instantly via
  `onSnapshot`.
- **Play screen** — `src/pages/PuzzleRoom.jsx` shows the map, clues,
  difficulty, grid size, and connected players (green dot = online).
- **Marking mechanics**:
  - Tap a suspect/victim chip, then tap-or-drag cells to place their
    initial as a candidate (fixed on-screen slot per person, so "A" is
    always top-left of the cell, etc. — `utils/people.js`).
  - Tap the handle above a column or beside a row to mark/erase the whole
    line at once.
  - "Cross out" tool places a bold black X and fades the cell — tap or
    drag cells/rows/columns.
  - "Erase" tool: with no suspect selected, tapping a cell/row/column
    clears everything there; with a suspect selected, it erases only that
    suspect's marks, leaving others' candidates and any X intact.
  - **Fix**: press and hold a cell (with a suspect selected in Mark mode)
    to fix them there. This wipes that suspect's candidate marks from the
    *entire* board (not just the row/column, since their position is now
    certain) and auto-X's the rest of their row and column.
  - Cells that can't hold anyone (water without a boat, or a blocking
    object like a rock/shark/box) are visually dimmed/hatched and simply
    don't respond to taps — `utils/blocking.js`.
- **Join another player's game** — the puzzle list has a "Have a game ID?"
  field that jumps straight into `/play/{code}`; the in-room Share button
  copies that same link/code for others to paste in.
- **Board icons** — object icons on the board, the puzzle-list thumbnails,
  and the glossary reference all pull from
  [Twemoji](https://github.com/twitter/twemoji) (Twitter's open-source
  emoji artwork, CC-BY 4.0), loaded as SVGs from a pinned GitHub release
  tag rather than relying on the OS's built-in emoji font — so every
  device shows the exact same colorful, consistent artwork instead of
  however Apple/Android/etc. happen to draw their own version of 🦈/🪨/etc.
  Attribution is credited on the Glossary page per the license. The
  type → emoji mapping lives in one place, `src/data/objectIcons.js` — the
  URL builder there also has a small fallback: if an icon ever fails to
  load (e.g. offline), it falls back to the plain emoji character so
  nothing breaks.
- **Area textures** — each named area gets a color *and* a texture
  (checkerboard, stripes, diagonal planks, speckle, or ripple), generated
  in `src/utils/areaPatterns.js` from that area's own color family rather
  than fixed art assets — no image files needed, and it scales to any
  puzzle automatically. Swap in real illustrated tile art later by
  replacing `buildPatternStyle()`'s CSS output with `background-image`
  URLs if you want photographic textures instead.
- **Undo a fix** — press-and-hold the same cell a suspect is already fixed
  to (again) to unfix them, or use the "Unfix [name]" button that appears
  in the palette once they're selected and fixed. Note: unfixing removes
  the `fixed` entry and restores their letter as a normal candidate mark
  at that cell, but it does **not** automatically un-X the rest of that
  row/column — those X's may still be valid deductions, or may need
  clearing by hand with the Erase tool if the fix itself was the mistake.
- **Blocked cells** — cells that can't hold anyone (water without a boat,
  or a blocking object) simply don't respond to taps; there's no separate
  graying/hatching for them anymore, only for cells that are actually
  crossed out with the X tool. The object's icon itself is usually enough
  of a visual cue for why a cell is off-limits.
- **Submit** — only enabled once every suspect + victim is fixed. Correct
  answers mark the session (and every *currently connected* player's
  progress doc) as completed and route to the finish page. Wrong answers
  just show "not correct" with no extra hints.
- **Finish page** — `src/pages/FinishPage.jsx`.
- **Resuming / restart** — in-progress sessions are kept in Firestore and
  reopened automatically when a puzzle is tapped again. "Restart" wipes
  marks/fixes for the session and resets progress to "in progress" for
  everyone who *ever* played that session — but per the spec, players who
  weren't connected when the puzzle was *solved* never had their own
  progress doc touched in the first place.

- **Glossary** — `src/pages/Glossary.jsx`, linked from the puzzle list and
  the in-room header. Covers the spatial/clue terms (directions, exact
  offsets, row/column location, uniqueness, exact counts, "alone with",
  ordered-area mechanics) with small original SVG diagrams
  (`components/MiniGrid.jsx`), plus a full icon reference for every board
  object type in `data/objectLibrary.js`. Edit `data/glossaryTerms.js` to
  add or reword entries.

## Clue checklist

Each clue in the room has a checkbox that strikes it through once you've
used it — synced live in the session, so everyone in the game sees the same
checked-off list.

## Adding more puzzles

Drop any puzzle JSON file into `src/data/puzzles/` and it's picked up
automatically — no code changes needed. Two shapes are supported:

- a **single puzzle object** (same shape as the original `murdoku.json`), or
- a **batch/database file**: a JSON array of puzzle objects (this is what
  `murdoku_db.json` looks like) — every entry in the array becomes its own
  puzzle in the list.

If the same puzzle `id` appears in more than one file, the first one loaded
wins and the duplicate is silently skipped, so it's safe to have some
overlap between a standalone file and a batch file.

A heads-up on very large boards: a couple of the puzzles in a typical batch
export run up to 12×12 with ~11 people in the cast. The board and the
per-person letter slots inside each cell both resize to fit, but on an
iPhone-sized screen those get noticeably small — still usable, just worth
knowing before you lean on very large puzzles as the default experience.

## Setup

### 1. Firebase

1. Create a project at https://console.firebase.google.com
2. Add a **Web app** to it, copy the config values into a `.env` file
   (copy `.env.example` → `.env` and fill it in).
3. Enable **Firestore** (Native mode, any region).
4. Deploy `firestore.rules` (Firestore → Rules tab, paste the file's
   contents) — it's intentionally open since there's no auth, just a name.
   Tighten it if you make the game public.
5. No Firebase Auth, Storage, or Functions are needed.

### 2. Local dev

```bash
npm install
npm run dev
```

### 3. Deploy to Netlify

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
   Build command `npm run build`, publish directory `dist` (already set in
   `netlify.toml`).
3. In **Site settings → Environment variables**, add the same
   `VITE_FIREBASE_*` keys from your `.env`.
4. Deploy. Share the resulting URL — anyone who opens it can type a name and
   play; sharing a puzzle's in-room link brings a second phone into the same
   live session.

## Board look

Each puzzle renders in a single hue family taken from its `theme`
(`src/utils/areaPatterns.js` → `THEME_BASE`), with every area a tint of
that hue plus its own texture — matching how the reference boards use one
colour family per puzzle rather than a different hue per area. On top of
that:

- **Object artwork is tinted into the board's hue** via a CSS filter chain
  (`tintFilter` in `src/utils/color.js`), so objects belong to the board
  instead of reading as full-colour stickers pasted on. The filter keeps
  the artwork's internal shading and outlines, which a flat silhouette
  mask would throw away. The glossary deliberately shows objects
  *untinted* — a reference chart wants true colours.
- **Carpets render as rectangles, not icons.** Adjacent carpet cells merge
  into one rug by only drawing the outer edges of the run, so an L-shaped
  group of carpet cells reads as a single L-shaped rug.
- **Board drop shadow**: offset grey shadow bottom-right, like the
  reference art.

Tuning knobs: `THEME_BASE` (hue per theme), `TINT_STEPS` (how far apart
area tints sit), and `tintFilter`'s `saturate`/`brightness`/`contrast`
defaults (how dark objects read against the board).

## Notes / things you may want to extend

- There's no server-side validation, so a determined player could inspect
  network traffic to see the solution — fine for playing with friends,
  not for a public leaderboard product.
- Presence uses a simple `connected` flag set on mount/unmount +
  `beforeunload`; if a phone loses the connection abruptly (killed app,
  airplane mode) it may show "online" a little longer than it should. A
  Firestore `onDisconnect`-style heartbeat would need Realtime Database
  instead of Firestore if you want that tightened up.
- **Icons are bundled locally** (`src/assets/emoji/`) rather than fetched
  from a CDN at runtime — this fixed a real mobile-loading problem where
  every board cell fired its own cross-origin request. If you add puzzles
  that reference an object type not already in `data/objectIcons.js`,
  you'll need to download that emoji's Twemoji SVG into `src/assets/emoji/`
  yourself (filename = its Unicode codepoint(s) in lowercase hex, joined
  by `-`, e.g. `1f43b.svg` for 🐻) and add the mapping — there's a dev-only
  console warning if a puzzle uses an object type with no icon mapped.
- **Row/column locking** (multi-select 2+ suspects, then tap a row/column/
  cell to rule out everyone else there) only clears *other* people's
  candidate marks — it doesn't add marks for the locked people, and it
  doesn't enforce anything going forward. It's a note-taking aid, not a
  constraint the game checks.
- **Undo** keeps a small in-memory stack (not synced to other players,
  not persisted — leaving and returning to a puzzle starts fresh). If two
  players are marking at once, undo can only step back *your own* device's
  view of "before my last action," not a true shared undo log — good
  enough for casual co-op, not airtight for adversarial use.
- **Multi-cell objects** (bed, boat, rowboat, car, golf cart) are drawn
  ONCE across their footprint via a span layer placed on the same CSS grid
  (`spans` in `GridBoard.jsx`), instead of repeating the icon per cell.
  Vertical footprints rotate the artwork 90deg and swap its box. Blocking
  objects (table, shelf, box, trashcan...) are all single-cell in the data
  and deliberately keep repeating per cell.
  - Two gotchas worth knowing if you touch this: (1) every grid child now
    needs EXPLICIT `gridRow`/`gridColumn`. Spans are explicitly placed, and
    CSS Grid places explicit items before auto-placed ones, so leaving the
    cells auto-placed made them shuffle around the spans and left holes in
    the board. (2) The span layer is `pointer-events: none` so taps still
    reach the cell underneath — marking a cell a boat sits on has to keep
    working.
  - Limitation: the icons are square artwork, so a spanning object scales
    to the span's short axis and centres, then gets a small upscale to read
    as spanning. It does not truly stretch the way the reference's
    purpose-drawn elongated boats/cars do — that would need artwork drawn
    at 2:1, not a square emoji.
- **Icon coverage**: checked both Twemoji AND OpenMoji's actual, complete
  icon datasets directly (not just guessing from search results) for
  carpet, table, punching bag, easel, puddle, and shrub — neither set has
  a dedicated icon for any of them; Unicode-style emoji just doesn't cover
  that part of furniture/objects. They're on the closest available emoji
  proxy. The one real find was OpenMoji's dedicated "oil-spill" icon (an
  overturned drum with spreading oil), now used for the `oil slick` object
  type — bundled locally at `src/assets/icons/oil-spill.svg`. Note OpenMoji
  is CC BY-**SA** 4.0 (ShareAlike), a stricter license than Twemoji's plain
  CC-BY — both are credited on the Glossary page, but worth knowing that
  distinction exists if this project's licensing terms matter to you later.
  If you want true pixel-accurate icons for the remaining six, a
  custom-drawn or commissioned icon set is the only real path — there's no
  ready-made open set that has them.
