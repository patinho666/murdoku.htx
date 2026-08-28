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
- **Board look** — cells are colored by *named area* (not raw terrain),
  with a thicker black border wherever two different areas meet and each
  area's name stamped in its bottom-most cell, closer to a hand-illustrated
  case-board look. Terrain still shows a small badge (💧) where it matters
  (e.g. water) since some clues depend on it.
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

## Notes / things you may want to extend

- There's no server-side validation, so a determined player could inspect
  network traffic to see the solution — fine for playing with friends,
  not for a public leaderboard product.
- Presence uses a simple `connected` flag set on mount/unmount +
  `beforeunload`; if a phone loses the connection abruptly (killed app,
  airplane mode) it may show "online" a little longer than it should. A
  Firestore `onDisconnect`-style heartbeat would need Realtime Database
  instead of Firestore if you want that tightened up.
