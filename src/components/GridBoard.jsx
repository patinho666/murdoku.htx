import { useRef } from 'react';
import { cellKey } from '../utils/cellKey';
import { buildAreaLayout } from '../utils/areaLayout';
import { buildBlockedCellSet } from '../utils/blocking';
import { buildPatternStyle } from '../utils/areaPatterns';
import { TERRAIN_COLOR } from '../data/objectLibrary';
import CellMarks from './CellMarks';
import ObjectGlyph from './ObjectGlyph';

const LONG_PRESS_MS = 550;
const MOVE_CANCEL_PX = 10;

// Water and grass get their own fixed color/texture regardless of which
// area they belong to (a quick visual read of "this is water/grass" is
// more useful than area-color consistency there); every other terrain
// keeps using its area's color.
const WATER_STYLE = buildPatternStyle(TERRAIN_COLOR.water, 4); // ripple pattern
const GRASS_STYLE = buildPatternStyle(TERRAIN_COLOR.grass, 3); // speckle pattern

function canInteract(tool, isBlockedCell) {
  // Marking a candidate only makes sense where someone could actually
  // stand; crossing out, erasing, and locking are allowed everywhere,
  // including cells nobody can occupy (e.g. auto-X'ing a fixed person's
  // row/column, or manually X-ing a blocked cell for clarity).
  if (tool === 'mark') return !isBlockedCell;
  return true;
}

export default function GridBoard({
  puzzle, session, people, activePerson, tool,
  onApplyCell, onApplyRow, onApplyCol, onFixAt, onGestureStart, readOnly,
}) {
  const n = puzzle.grid_size;
  const boardRef = useRef(null);
  const dragState = useRef(null);
  const pressState = useRef(null);

  const { styleByArea, areaByCell, labelAnchor } = buildAreaLayout(puzzle);
  const blocked = buildBlockedCellSet(puzzle);

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

  const applyToCell = (r, c, add) => {
    const key = `${r},${c}`;
    if (dragState.current.touched.has(key)) return;
    dragState.current.touched.add(key);
    onApplyCell(r, c, add);
  };

  const beginDrag = (r, c) => {
    const key = cellKey(r, c);
    const mark = session?.marks?.[key];
    let add = true;
    if (tool === 'x') add = !mark?.x;
    else if (tool === 'erase') add = true;
    else if (tool === 'lock') add = true;
    else if (tool === 'mark' && activePerson) add = true; // mark never toggles off — only Erase removes
    onGestureStart?.();
    dragState.current = { add, touched: new Set() };
    applyToCell(r, c, add);
  };

  const handlePointerDown = (e, r, c) => {
    if (readOnly) return;
    const isBlockedCell = blocked.has(cellKey(r, c));
    if (!canInteract(tool, isBlockedCell)) return;
    e.preventDefault();
    boardRef.current?.setPointerCapture?.(e.pointerId);
    const canLongPressFix = tool === 'mark' && !!activePerson && !!onFixAt && !isBlockedCell;
    pressState.current = {
      r, c, x: e.clientX, y: e.clientY, moved: false, longPressed: false, dragStarted: false,
    };
    if (canLongPressFix) {
      pressState.current.timer = setTimeout(() => {
        if (pressState.current && !pressState.current.moved) {
          pressState.current.longPressed = true;
          onGestureStart?.();
          onFixAt(r, c);
        }
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerMove = (e) => {
    if (dragState.current) {
      const found = cellFromPoint(e.clientX, e.clientY);
      if (found && canInteract(tool, blocked.has(cellKey(found[0], found[1])))) {
        applyToCell(found[0], found[1], dragState.current.add);
      }
      return;
    }
    if (!pressState.current) return;
    const dx = e.clientX - pressState.current.x;
    const dy = e.clientY - pressState.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      pressState.current.moved = true;
      if (pressState.current.timer) clearTimeout(pressState.current.timer);
      if (!pressState.current.longPressed && !pressState.current.dragStarted) {
        pressState.current.dragStarted = true;
        beginDrag(pressState.current.r, pressState.current.c);
      }
    }
  };

  const handlePointerUp = () => {
    const p = pressState.current;
    if (p) {
      if (p.timer) clearTimeout(p.timer);
      if (!p.longPressed && !p.dragStarted) {
        // Simple tap, no movement, released before the long-press fired.
        beginDrag(p.r, p.c);
      }
    }
    pressState.current = null;
    dragState.current = null;
  };

  const handlePointerCancel = () => {
    const p = pressState.current;
    if (p?.timer) clearTimeout(p.timer);
    pressState.current = null;
    dragState.current = null;
  };

  const handleRowClick = (r) => {
    if (readOnly) return;
    onGestureStart?.();
    onApplyRow(r);
  };
  const handleColClick = (c) => {
    if (readOnly) return;
    onGestureStart?.();
    onApplyCol(c);
  };

  return (
    <div className="board-wrap">
      <div
        className="board-grid"
        ref={boardRef}
        style={{ '--n': n }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="corner" />
        {Array.from({ length: n }).map((_, c) => (
          <button key={`colh-${c}`} className="col-handle" onClick={() => handleColClick(c)}>{c}</button>
        ))}
        {Array.from({ length: n }).map((_, r) => (
          <div className="row-fragment" key={`row-${r}`} style={{ display: 'contents' }}>
            <button className="row-handle" onClick={() => handleRowClick(r)}>{r}</button>
            {Array.from({ length: n }).map((_, c) => {
              const key = cellKey(r, c);
              const terrain = terrainByCell[key] || 'floor';
              const obj = objectByCell[key];
              const isBlocked = blocked.has(key);
              const isCrossed = !!session?.marks?.[key]?.x;
              const areaName = areaByCell[key];
              const label = labelAnchor[key];
              const borderRight = c === n - 1 || areaByCell[cellKey(r, c + 1)] !== areaName;
              const borderBottom = r === n - 1 || areaByCell[cellKey(r + 1, c)] !== areaName;
              const cellStyle = terrain === 'water' ? WATER_STYLE
                : terrain === 'grass' ? GRASS_STYLE
                : (styleByArea[areaName] || { backgroundColor: '#e2e8f0' });
              return (
                <div
                  key={key}
                  data-cell data-r={r} data-c={c}
                  className={`cell${isCrossed ? ' cell-crossed' : ''}${isBlocked ? ' cell-blocked' : ''}`}
                  style={{
                    ...cellStyle,
                    borderRightWidth: borderRight ? 3 : 1,
                    borderBottomWidth: borderBottom ? 3 : 1,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, r, c)}
                >
                  {terrain === 'water' && !obj && (
                    <span className="terrain-badge">
                      <ObjectGlyph type="puddle" size="100%" dropShadow={false} />
                    </span>
                  )}
                  {obj && (
                    <span className="cell-object">
                      <ObjectGlyph type={obj} size="100%" />
                    </span>
                  )}
                  <CellMarks people={people} mark={session?.marks?.[key]} fixedPerson={fixedByCell[key]} />
                  {label && <span className="area-label">{label}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
