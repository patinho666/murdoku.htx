export function cellKey(r, c) {
  return `${r}_${c}`;
}

export function parseCellKey(key) {
  const [r, c] = key.split('_').map(Number);
  return [r, c];
}
