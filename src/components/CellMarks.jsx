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
  return (
    <div className="cell-slots">
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
