export default function ConnectedPlayers({ players = {}, currentUserId }) {
  const list = Object.entries(players);
  return (
    <div className="players-bar">
      {list.map(([id, p]) => (
        <span key={id} className={`player-pill ${p.connected ? 'online' : 'offline'}`}>
          <span className="dot" /> {p.name}{id === currentUserId ? ' (you)' : ''}
        </span>
      ))}
    </div>
  );
}
