// Every .json file in this folder is loaded automatically — no import list
// to maintain. Drop in either:
//   - a single puzzle object (like the original murdoku.json), or
//   - a "database" file containing an array of puzzle objects
// and it's picked up on the next build/dev-server restart.
const modules = import.meta.glob('./*.json', { eager: true });

const all = [];
for (const path in modules) {
  const mod = modules[path].default ?? modules[path];
  if (Array.isArray(mod)) all.push(...mod);
  else all.push(mod);
}

// Guard against the same puzzle id appearing twice (e.g. a puzzle shipped
// both standalone and inside a batch file) — first one loaded wins.
const seenIds = new Set();
export const PUZZLES = all.filter((p) => {
  if (!p || !p.id) return false;
  if (seenIds.has(p.id)) return false;
  seenIds.add(p.id);
  return true;
});

export function getPuzzle(id) {
  return PUZZLES.find((p) => p.id === id) || null;
}
