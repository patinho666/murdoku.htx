import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getPuzzle } from '../data/puzzles';
import { useUser } from '../context/UserContext';
import { useSession, startOrJoinSession } from '../hooks/useSession';
import { getAllPeople } from '../utils/people';
import { difficultyClass } from '../utils/difficultyClass';
import { buildBlockedCellSet } from '../utils/blocking';
import GridBoard from '../components/GridBoard';
import SuspectPalette from '../components/SuspectPalette';
import ClueList from '../components/ClueList';
import ConnectedPlayers from '../components/ConnectedPlayers';
import ShareId from '../components/ShareId';

const MAX_UNDO_HISTORY = 25;

export default function PuzzleRoom() {
  const { param } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();

  const [puzzle, setPuzzle] = useState(() => getPuzzle(param));
  const [sessionId, setSessionId] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [activePerson, setActivePerson] = useState(null);
  const [tool, setTool] = useState('mark');
  const [wrongFlash, setWrongFlash] = useState(false);
  const [lockedPeople, setLockedPeople] = useState(() => new Set());
  const [history, setHistory] = useState([]);

  // Resolve whether `param` is a puzzle id (start/resume own game) or a
  // shared session id (join someone else's game).
  useEffect(() => {
    let cancelled = false;
    async function resolve() {
      setResolving(true);
      const directPuzzle = getPuzzle(param);
      if (directPuzzle) {
        const id = await startOrJoinSession(directPuzzle, user, null);
        if (!cancelled) { setPuzzle(directPuzzle); setSessionId(id); setResolving(false); }
        return;
      }
      const snap = await getDoc(doc(db, 'sessions', param));
      if (!snap.exists()) {
        if (!cancelled) { setResolving(false); }
        return;
      }
      const p = getPuzzle(snap.data().puzzleId);
      const id = await startOrJoinSession(p, user, param);
      if (!cancelled) { setPuzzle(p); setSessionId(id); setResolving(false); }
    }
    resolve();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, user.id]);

  const {
    session, toggleLetter, setLetterForCells, toggleX, eraseCell, eraseCells,
    erasePersonFromCell, erasePersonFromCells,
    fixPerson, unfixPerson, submitAnswer, restartSession, toggleUsedClue,
    restoreSnapshot, lockCells, unlockCells,
  } = useSession(sessionId, user);

  const people = useMemo(() => (puzzle ? getAllPeople(puzzle) : []), [puzzle]);
  const blockedCells = useMemo(() => (puzzle ? buildBlockedCellSet(puzzle) : new Set()), [puzzle]);

  // Undo history is per-visit only — a fresh mount (new puzzle, or leaving
  // and coming back) starts with an empty stack.
  useEffect(() => {
    setHistory([]);
  }, [sessionId]);

  if (resolving || !puzzle) {
    return <div className="center-msg">{resolving ? 'Loading…' : 'Puzzle not found.'}</div>;
  }

  const n = puzzle.grid_size;
  const isSolved = session?.status === 'completed';

  // Called once at the start of a gesture (a whole drag, a single tap, a
  // row/column click, a fix) — never per-cell — so an entire drag counts
  // as one undo step.
  const pushHistorySnapshot = () => {
    if (!session) return;
    setHistory((h) => {
      const next = [...h, { marks: session.marks || {}, fixed: session.fixed || {} }];
      return next.length > MAX_UNDO_HISTORY ? next.slice(next.length - MAX_UNDO_HISTORY) : next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    restoreSnapshot(prev.marks, prev.fixed);
  };

  // Erase tool: if a suspect/victim chip is selected, erase only that
  // person's letter from the touched cells; otherwise clear the whole cell
  // (letters + X). Lock tool: with 1+ suspects selected, reserves the cell
  // for them — records the lock (so it shows a badge and syncs) and clears
  // everyone else's candidate marks there.
  const lockedNames = () => people.filter((p) => lockedPeople.has(p.name)).map((p) => p.name);

  // A row/column fill must skip cells that can't take a mark: ones already
  // crossed out, and ones nobody could stand in (water without a boat, or a
  // blocking object). Without this, "fill the row" happily wrote letters
  // into impossible cells.
  const markableCells = (cells) => cells.filter(([r, c]) => {
    const key = `${r}_${c}`;
    if (blockedCells.has(key)) return false;
    if (session?.marks?.[key]?.x) return false;
    return true;
  });

  const handleApplyCell = (r, c, add) => {
    if (tool === 'lock') {
      if (lockedPeople.size < 1) return;
      lockCells([[r, c]], lockedNames());
      return;
    }
    if (tool === 'unlock') { unlockCells([[r, c]]); return; }
    if (tool === 'x') { if (!!session?.marks?.[`${r}_${c}`]?.x !== add) toggleX(r, c); return; }
    if (tool === 'erase') {
      if (activePerson) erasePersonFromCell(r, c, activePerson.name);
      else eraseCell(r, c);
      return;
    }
    if (tool === 'mark' && activePerson) {
      const has = (session?.marks?.[`${r}_${c}`]?.letters || []).includes(activePerson.name);
      if (has !== add) toggleLetter(r, c, activePerson.name);
    }
  };

  const rowCells = (r) => Array.from({ length: n }, (_, c) => [r, c]);
  const colCells = (c) => Array.from({ length: n }, (_, r) => [r, c]);

  const handleApplyLine = (cells) => {
    if (tool === 'lock') {
      if (lockedPeople.size < 1) return;
      lockCells(markableCells(cells), lockedNames());
      return;
    }
    if (tool === 'unlock') { unlockCells(cells); return; }
    if (tool === 'erase') {
      return activePerson ? erasePersonFromCells(cells, activePerson.name) : eraseCells(cells);
    }
    if (tool === 'mark' && activePerson) {
      return setLetterForCells(markableCells(cells), activePerson.name, true);
    }
  };

  const handleApplyRow = (r) => handleApplyLine(rowCells(r));
  const handleApplyCol = (c) => handleApplyLine(colCells(c));

  // Long-press a cell (while a suspect/victim is selected in Mark mode) to
  // fix them there. Long-pressing the cell they're already fixed at again
  // undoes the fix — the way to correct a mistake.
  const handleFixAt = (r, c) => {
    if (!activePerson) return;
    const already = session?.fixed?.[activePerson.name];
    if (already && already[0] === r && already[1] === c) {
      unfixPerson(activePerson.name);
    } else {
      fixPerson(activePerson.name, r, c, n);
    }
  };

  const activeFixedCell = activePerson ? session?.fixed?.[activePerson.name] : null;
  const handleUnfixActive = () => {
    if (!activePerson) return;
    pushHistorySnapshot();
    unfixPerson(activePerson.name);
  };

  const handleToggleLockedPerson = (name) => {
    setLockedPeople((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSubmit = async () => {
    const ok = await submitAnswer(puzzle);
    if (ok) {
      navigate(`/finish/${sessionId}`);
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 1600);
    }
  };

  const allFixed = people.every((p) => session?.fixed?.[p.name]);

  return (
    <div className="room-screen">
      <header className="room-header">
        <button className="link-btn" onClick={() => navigate('/')}>← Puzzles</button>
        <h1>{puzzle.title}</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="link-btn" onClick={() => navigate('/glossary')}>Glossary</button>
          <ShareId sessionId={sessionId} />
        </div>
      </header>

      <div className="room-meta">
        <span>{n}×{n}</span>
        <span className={`difficulty ${difficultyClass(puzzle.difficulty)}`}>{puzzle.difficulty}</span>
        <ConnectedPlayers players={session?.players} currentUserId={user.id} />
      </div>

      {isSolved && (
        <div className="solved-banner">🔒 SOLVED — tap Restart below to play again</div>
      )}

      <div className="room-body">
        <GridBoard
          puzzle={puzzle}
          session={session}
          people={people}
          activePerson={activePerson}
          tool={tool}
          onApplyCell={handleApplyCell}
          onApplyRow={handleApplyRow}
          onApplyCol={handleApplyCol}
          onFixAt={handleFixAt}
          onGestureStart={pushHistorySnapshot}
          readOnly={isSolved}
        />

        <SuspectPalette
          people={people}
          activePerson={activePerson}
          setActivePerson={setActivePerson}
          tool={tool}
          setTool={setTool}
          isActiveFixed={!!activeFixedCell}
          onUnfix={handleUnfixActive}
          lockedPeople={lockedPeople}
          onToggleLockedPerson={handleToggleLockedPerson}
          onUndo={handleUndo}
          canUndo={history.length > 0}
          readOnly={isSolved}
        />

        <ClueList puzzle={puzzle} usedClues={session?.usedClues} onToggleUsed={toggleUsedClue} />

        <div className="submit-row">
          <button
            className="submit-btn"
            disabled={isSolved || !allFixed}
            onClick={handleSubmit}
          >
            {isSolved ? 'Solved' : 'Submit solution'}
          </button>
          <button
            className="restart-btn"
            onClick={() => {
              if (window.confirm('Restart this murdoku? All marks will be erased for everyone.')) {
                setHistory([]);
                restartSession(puzzle);
              }
            }}
          >
            Restart
          </button>
        </div>
        {wrongFlash && <div className="wrong-banner">✗ That's not the solution. Keep trying.</div>}
      </div>
    </div>
  );
}
