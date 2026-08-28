export default function SuspectPalette({
  people, activePerson, setActivePerson, tool, setTool,
}) {
  return (
    <div className="palette">
      <div className="palette-row">
        {people.map((p) => (
          <button
            key={p.name}
            className={`person-chip ${activePerson?.name === p.name ? 'active' : ''}`}
            style={{ borderColor: p.color, color: activePerson?.name === p.name ? '#fff' : p.color, background: activePerson?.name === p.name ? p.color : 'transparent' }}
            onClick={() => { setActivePerson(activePerson?.name === p.name ? null : p); if (tool !== 'erase') setTool('mark'); }}
          >
            {p.letter} {p.isVictim ? '(victim)' : ''}
          </button>
        ))}
      </div>
      <div className="palette-row tools">
        <button className={tool === 'mark' ? 'tool active' : 'tool'} onClick={() => setTool('mark')} disabled={!activePerson}>
          ✎ Mark
        </button>
        <button className={tool === 'x' ? 'tool active' : 'tool'} onClick={() => setTool('x')}>
          ✕ Cross out
        </button>
        <button className={tool === 'erase' ? 'tool active' : 'tool'} onClick={() => setTool('erase')}>
          ⌫ Erase
        </button>
      </div>
      <p className="palette-hint">
        {tool === 'mark' && activePerson && `Tap/drag to mark cells ${activePerson.name} could be in. Press and hold a cell to fix them there.`}
        {tool === 'x' && 'Tap or drag cells to mark as impossible.'}
        {tool === 'erase' && activePerson && `Tap or drag to erase just ${activePerson.name}'s marks.`}
        {tool === 'erase' && !activePerson && 'Tap or drag to clear everything in a cell/row/column.'}
        {!activePerson && tool === 'mark' && 'Pick a suspect above to start marking.'}
      </p>
    </div>
  );
}
