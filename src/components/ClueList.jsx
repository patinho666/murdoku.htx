import GenderMark from './GenderMark';

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

export default function ClueList({ puzzle, people = [], usedClues = {}, onToggleUsed }) {
  const toggle = (id) => onToggleUsed && onToggleUsed(id);
  const genderOf = (name) => people.find((p) => p.name === name)?.gender ?? null;
  const victim = people.find((p) => p.isVictim);

  return (
    <div className="clue-list">
      <h3>Clues</h3>
      <ul>
        {Object.entries(puzzle.clues).map(([name, clue]) => (
          <ClueRow
            key={name}
            id={`suspect_${name}`}
            text={(
              <>
                <strong>{name}</strong>
                <GenderMark gender={genderOf(name)} />
                <span>: {clue}</span>
              </>
            )}
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
      <h3>
        Victim: {puzzle.victim}
        <GenderMark gender={victim?.gender ?? null} />
      </h3>
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
