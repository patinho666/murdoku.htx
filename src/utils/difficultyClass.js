export function difficultyClass(difficulty) {
  return String(difficulty || '').trim().toLowerCase().replace(/\s+/g, '-');
}
