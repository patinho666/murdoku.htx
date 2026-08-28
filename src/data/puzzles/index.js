import ea21eeeb from './ea21eeeb.json';

// To add a new puzzle: drop its JSON file in this folder, import it above,
// and add it to this array. The `id` field inside the JSON is the puzzle id
// used everywhere (URLs, Firestore doc ids for progress, etc).
export const PUZZLES = [ea21eeeb];

export function getPuzzle(id) {
  return PUZZLES.find((p) => p.id === id) || null;
}
