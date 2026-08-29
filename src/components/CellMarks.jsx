export default function CellMarks({ people, mark, fixedPerson }) {
  const lock = mark?.lock;

  // Fixed person: semi-transparent so any object/terrain icon underneath
  // stays visible (a fixed suspect sitting on a chair should still read as
  // "on the chair").
  if (fixedPerson) {
    return (
      <>
        <div className="cell-fixed" style={{ background: fixedPerson.color }}>
          <span>{fixedPerson.letter}</span>
        </div>
        {lock?.length > 0 && <LockBadge lock={lock} people={people} />}
      </>
    );
  }

  if (mark?.x) {
    return (
      <>
        <div className="cell-x">✕</div>
        {lock?.length > 0 && <LockBadge lock={lock} people={people} />}
      </>
    );
  }

  const letters = mark?.letters || [];
  const cols = people[0]?.gridCols || 3;
  const rows = people[0]?.gridRows || 3;

  return (
    <>
      {letters.length > 0 && (
        <div
          className="cell-slots"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {people.map((p) => {
            if (!letters.includes(p.name)) return null;
            return (
              <span
                key={p.name}
                className="cell-slot"
                style={{
                  gridRow: p.slot.row + 1,
                  gridColumn: p.slot.col + 1,
                  color: p.color,
                }}
              >
                {p.letter}
              </span>
            );
          })}
        </div>
      )}
      {lock?.length > 0 && <LockBadge lock={lock} people={people} />}
    </>
  );
}

// Shows which people a cell is reserved for: a padlock plus their initials,
// tinted with each person's colour.
function LockBadge({ lock, people }) {
  return (
    <span className="lock-badge" title={`Locked to ${lock.join(', ')}`}>
      <span className="lock-glyph">🔒</span>
      {lock.map((name) => {
        const p = people.find((x) => x.name === name);
        if (!p) return null;
        return (
          <span key={name} className="lock-letter" style={{ color: p.color }}>
            {p.letter}
          </span>
        );
      })}
    </span>
  );
}
