import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getPuzzle } from '../data/puzzles';
import { useUser } from '../context/UserContext';
import { useSession, startOrJoinSession } from '../hooks/useSession';
import { getAllPeople } from '../utils/people';
import GridBoard from '../components/GridBoard';
import SuspectPalette from '../components/SuspectPalette';
import ClueList from '../components/ClueList';
import ConnectedPlayers from '../components/ConnectedPlayers';
import ShareId from '../components/ShareId';

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
    fixPerson, submitAnswer, restartSession,
  } = useSession(sessionId, user);

  const people = useMemo(() => (puzzle ? getAllPeople(puzzle) : []), [puzzle]);

  useEffect(() => {
    if (session?.status === 'completed') {
      navigate(`/finish/${sessionId}`, { replace: true });
    }
  }, [session?.status, sessionId, navigate]);

  if (resolving || !puzzle) {
    return <div className="center-msg">{resolving ? 'Loading…' : 'Puzzle not found.'}</div>;
  }

  const n = puzzle.grid_size;
  const fixedForActive = activePerson ? session?.fixed?.[activePerson.name] : null;

  const handleApplyCell = (r, c, add) => {
    if (tool === 'x') { if (!!session?.marks?.[`${r}_${c}`]?.x !== add) toggleX(r, c); return; }
    if (tool === 'erase') { eraseCell(r, c); return; }
    if (tool === 'mark' && activePerson) {
      const has = (session?.marks?.[`${r}_${c}`]?.letters || []).includes(activePerson.name);
      if (has !== add) toggleLetter(r, c, activePerson.name);
    }
  };

  const rowCells = (r) => Array.from({ length: n }, (_, c) => [r, c]);
  const colCells = (c) => Array.from({ length: n }, (_, r) => [r, c]);

  const handleApplyRow = (r) => {
    if (tool === 'erase') return eraseCells(rowCells(r));
    if (tool === 'mark' && activePerson) return setLetterForCells(rowCells(r), activePerson.name, true);
  };
  const handleApplyCol = (c) => {
    if (tool === 'erase') return eraseCells(colCells(c));
    if (tool === 'mark' && activePerson) return setLetterForCells(colCells(c), activePerson.name, true);
  };

  const canFix = activePerson && tool === 'mark';

  const handleFix = () => {
    if (!activePerson) return;
    // Fix wherever the person currently has exactly one candidate cell,
    // otherwise ask the player to tap the exact cell first.
    const marks = session?.marks || {};
    const candidates = Object.entries(marks)
      .filter(([, m]) => (m.letters || []).includes(activePerson.name))
      .map(([key]) => key.split('_').map(Number));
    if (candidates.length !== 1) {
      alert('Mark exactly one cell for this person before fixing (tap that single cell first).');
      return;
    }
    const [r, c] = candidates[0];
    fixPerson(activePerson.name, r, c, n);
  };

  const handleSubmit = async () => {
    const ok = await submitAnswer(puzzle);
    if (!ok) {
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
        <span className={`difficulty ${puzzle.difficulty}`}>{puzzle.difficulty}</span>
        <ConnectedPlayers players={session?.players} currentUserId={user.id} />
      </div>

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
        />

        <SuspectPalette
          people={people}
          activePerson={activePerson}
          setActivePerson={setActivePerson}
          tool={tool}
          setTool={setTool}
          canFix={canFix}
          onFix={handleFix}
        />

        <ClueList puzzle={puzzle} />

        <div className="submit-row">
          <button
            className="submit-btn"
            disabled={!allFixed}
            onClick={handleSubmit}
          >
            Submit solution
          </button>
          <button
            className="restart-btn"
            onClick={() => {
              if (window.confirm('Restart this murdoku? All marks will be erased for everyone.')) {
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
