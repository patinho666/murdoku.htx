function ClueRow({ id, text, used, onToggle }) {
  return (
    <li className={used ? 'clue-used' : ''}>
      <label>
        <input type="checkbox" checked={!!used} onChange={() => onToggle(id)} />
        <span>{text}</span>
      </label>
    </li>
  );
}

export default function ClueList({ puzzle, usedClues = {}, onToggleUsed }) {
  const toggle = (id) => onToggleUsed && onToggleUsed(id);

  return (
    <div className="clue-list">
      <h3>Clues</h3>
      <ul>
        {Object.entries(puzzle.clues).map(([name, clue]) => (
          <ClueRow
            key={name}
            id={`suspect_${name}`}
            text={<><strong>{name}:</strong> {clue}</>}
            used={usedClues[`suspect_${name}`]}
            onToggle={toggle}
          />
        ))}
      </ul>
      {puzzle.scene_clues?.length > 0 && (
        <>
          <h3>Scene</h3>
          <ul>
            {puzzle.scene_clues.map((c, i) => (
              <ClueRow
                key={i}
                id={`scene_${i}`}
                text={c}
                used={usedClues[`scene_${i}`]}
                onToggle={toggle}
              />
            ))}
          </ul>
        </>
      )}
      <h3>Victim</h3>
      <ul>
        <ClueRow
          id="victim"
          text={puzzle.victim_clue}
          used={usedClues.victim}
          onToggle={toggle}
        />
      </ul>
    </div>
  );
}
