import { useState } from 'react';
import { difficultyClass } from '../utils/difficultyClass';
import { useNavigate } from 'react-router-dom';
import { PUZZLES } from '../data/puzzles';
import { useUser } from '../context/UserContext';
import { usePuzzleProgress } from '../hooks/usePuzzleProgress';
import PuzzleThumbnail from '../components/PuzzleThumbnail';

export default function PuzzleList() {
  const { user, logout } = useUser();
  const progress = usePuzzleProgress(user?.id);
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    navigate(`/play/${code}`);
  };

  return (
    <div className="list-screen">
      <header className="list-header">
        <h1>Murdoku</h1>
        <div>
          <span className="me">Hi, {user.name}</span>
          <button className="link-btn" onClick={() => navigate('/glossary')}>Glossary</button>
          <button className="link-btn" onClick={logout}>Switch user</button>
        </div>
      </header>

      <form className="join-form" onSubmit={handleJoin}>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Have a game ID? Join it here"
        />
        <button type="submit" disabled={!joinCode.trim()}>Join</button>
      </form>

      <div className="puzzle-grid">
        {PUZZLES.map((puzzle) => {
          const prog = progress[puzzle.id];
          const status = prog?.status || 'new';
          return (
            <button
              key={puzzle.id}
              className="puzzle-card"
              onClick={() => navigate(`/play/${puzzle.id}`)}
            >
              <PuzzleThumbnail puzzle={puzzle} size={130} />
              <div className="puzzle-card-body">
                <h3>{puzzle.title}</h3>
                <p className="tease">{puzzle.tease}</p>
                <div className="meta">
                  <span>{puzzle.grid_size}×{puzzle.grid_size}</span>
                  {/* <span className={`difficulty ${difficultyClass(puzzle.difficulty)}`}>{puzzle.difficulty}</span> */}
                  <span className={`status ${status}`}>
                    {status === 'completed' ? '✅ Solved' : status === 'in_progress' ? '🕓 In progress' : '🆕 New'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
