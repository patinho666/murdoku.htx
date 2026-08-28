export default function CellMarks({ people, mark, fixedPerson }) {
  if (fixedPerson) {
    return (
      <div className="cell-fixed" style={{ background: fixedPerson.color }}>
        {fixedPerson.letter}
      </div>
    );
  }
  if (mark?.x) {
    return <div className="cell-x">✕</div>;
  }
  const letters = mark?.letters || [];
  if (letters.length === 0) return null;
  const cols = people[0]?.gridCols || 3;
  const rows = people[0]?.gridRows || 3;
  return (
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
  );
}
