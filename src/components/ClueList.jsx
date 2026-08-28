export default function ClueList({ puzzle }) {
  return (
    <div className="clue-list">
      <h3>Clues</h3>
      <ul>
        {Object.entries(puzzle.clues).map(([name, clue]) => (
          <li key={name}><strong>{name}:</strong> {clue}</li>
        ))}
      </ul>
      {puzzle.scene_clues?.length > 0 && (
        <>
          <h3>Scene</h3>
          <ul>
            {puzzle.scene_clues.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </>
      )}
      <h3>Victim</h3>
      <p>{puzzle.victim_clue}</p>
    </div>
  );
}
