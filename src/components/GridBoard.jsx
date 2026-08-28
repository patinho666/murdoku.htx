import { useRef, useCallback } from 'react';
import { TERRAIN_COLOR } from '../data/objectLibrary';
import { cellKey } from '../utils/cellKey';
import CellMarks from './CellMarks';

const OBJECT_ICON = {
  rock: '🪨', door: '🚪', chair: '🪑', carpet: '🟫', shark: '🦈', box: '📦',
  boat: '🛶', rowboat: '🚣', 'lily pad': '🌸', crocodile: '🐊', shrub: '🌿',
  flag: '🚩', tree: '🌲', barrel: '🛢️',
};

export default function GridBoard({
  puzzle, session, people, activePerson, tool,
  onApplyCell, onApplyRow, onApplyCol,
}) {
  const n = puzzle.grid_size;
  const boardRef = useRef(null);
  const dragState = useRef(null);

  const terrainByCell = {};
  for (const t of puzzle.terrain) terrainByCell[cellKey(t.cell[0], t.cell[1])] = t.type;
  const objectByCell = {};
  for (const o of puzzle.objects || []) {
    for (const c of o.cells) objectByCell[cellKey(c[0], c[1])] = o.type;
  }
  const fixedByCell = {};
  for (const [name, cell] of Object.entries(session?.fixed || {})) {
    fixedByCell[cellKey(cell[0], cell[1])] = people.find((p) => p.name === name);
  }

  const cellFromPoint = (x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const target = el.closest('[data-cell]');
    if (!target) return null;
    return [Number(target.dataset.r), Number(target.dataset.c)];
  };

  const startDrag = useCallback((r, c) => {
    const key = cellKey(r, c);
    const mark = session?.marks?.[key];
    let add = true;
    if (tool === 'x') add = !mark?.x;
    else if (tool === 'mark' && activePerson) add = !(mark?.letters || []).includes(activePerson.name);
    dragState.current = { add, touched: new Set() };
    applyToCell(r, c, add);
  }, [session, tool, activePerson]);

  const applyToCell = (r, c, add) => {
    const key = `${r},${c}`;
    if (dragState.current.touched.has(key)) return;
    dragState.current.touched.add(key);
    onApplyCell(r, c, add);
  };

  const handlePointerDown = (e, r, c) => {
    e.preventDefault();
    boardRef.current?.setPointerCapture?.(e.pointerId);
    startDrag(r, c);
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) return;
    const found = cellFromPoint(e.clientX, e.clientY);
    if (found) applyToCell(found[0], found[1], dragState.current.add);
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  return (
    <div className="board-wrap">
      <div
        className="board-grid"
        ref={boardRef}
        style={{ '--n': n }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="corner" />
        {Array.from({ length: n }).map((_, c) => (
          <button key={`colh-${c}`} className="col-handle" onClick={() => onApplyCol(c)}>
            ▾
          </button>
        ))}
        {Array.from({ length: n }).map((_, r) => (
          <div className="row-fragment" key={`row-${r}`} style={{ display: 'contents' }}>
            <button className="row-handle" onClick={() => onApplyRow(r)}>▸</button>
            {Array.from({ length: n }).map((_, c) => {
              const key = cellKey(r, c);
              const terrain = terrainByCell[key] || 'floor';
              const obj = objectByCell[key];
              return (
                <div
                  key={key}
                  data-cell data-r={r} data-c={c}
                  className="cell"
                  style={{ background: TERRAIN_COLOR[terrain] || '#eee' }}
                  onPointerDown={(e) => handlePointerDown(e, r, c)}
                >
                  {obj && <span className="cell-object">{OBJECT_ICON[obj] || '?'}</span>}
                  <CellMarks people={people} mark={session?.marks?.[key]} fixedPerson={fixedByCell[key]} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
