import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { getPuzzle } from '../data/puzzles';
import PuzzleThumbnail from '../components/PuzzleThumbnail';

export default function FinishPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
      setSession(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [sessionId]);

  if (!session) return <div className="center-msg">Loading…</div>;
  const puzzle = getPuzzle(session.puzzleId);
  if (!puzzle) return <div className="center-msg">Puzzle not found.</div>;

  const players = Object.values(session.players || {}).map((p) => p.name).join(', ');

  return (
    <div className="finish-screen">
      <div className="confetti">🎉</div>
      <h1>Case closed!</h1>
      <PuzzleThumbnail puzzle={puzzle} size={160} />
      <h2>{puzzle.title}</h2>
      <p className="finish-line">The murderer was <strong>{puzzle.solution.murderer}</strong>.</p>
      <p className="finish-victim">{puzzle.victim_clue}</p>
      {players && <p className="finish-players">Solved with: {players}</p>}
      <div className="finish-actions">
        <button onClick={() => navigate('/')}>Back to puzzles</button>
      </div>
    </div>
  );
}
