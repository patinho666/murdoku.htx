export default function SuspectPalette({
  people, activePerson, setActivePerson, tool, setTool,
  isActiveFixed, onUnfix,
  lockedPeople, onToggleLockedPerson,
  onUndo, canUndo,
  readOnly,
}) {
  const handleChipClick = (p) => {
    if (readOnly) return;
    if (tool === 'lock') {
      onToggleLockedPerson(p.name);
      return;
    }
    setActivePerson(activePerson?.name === p.name ? null : p);
    if (tool !== 'erase') setTool('mark');
  };

  const isChipActive = (p) => (tool === 'lock' ? lockedPeople?.has(p.name) : activePerson?.name === p.name);

  return (
    <div className="palette">
      <div className="palette-row">
        {people.map((p) => (
          <button
            key={p.name}
            className={`person-chip ${isChipActive(p) ? 'active' : ''}`}
            style={{ borderColor: p.color, color: isChipActive(p) ? '#fff' : p.color, background: isChipActive(p) ? p.color : 'transparent' }}
            onClick={() => handleChipClick(p)}
            disabled={readOnly}
          >
            {p.letter} {p.isVictim ? '(victim)' : ''}
          </button>
        ))}
      </div>
      <div className="palette-row tools">
        <button className={tool === 'mark' ? 'tool active' : 'tool'} onClick={() => setTool('mark')} disabled={readOnly || !activePerson}>
          ✎ Mark
        </button>
        <button className={tool === 'x' ? 'tool active' : 'tool'} onClick={() => setTool('x')} disabled={readOnly}>
          ✕ Cross out
        </button>
        <button className={tool === 'erase' ? 'tool active' : 'tool'} onClick={() => setTool('erase')} disabled={readOnly}>
          ⌫ Erase
        </button>
        <button className={tool === 'lock' ? 'tool active' : 'tool'} onClick={() => setTool('lock')} disabled={readOnly}>
          🔗 Lock to
        </button>
        {isActiveFixed && (
          <button className="tool unfix" onClick={onUnfix} disabled={readOnly}>
            ↺ Unfix {activePerson?.name}
          </button>
        )}
        <button className="tool undo" onClick={onUndo} disabled={readOnly || !canUndo}>
          ↶ Undo
        </button>
      </div>
      <p className="palette-hint">
        {tool === 'mark' && activePerson && !isActiveFixed && `Tap/drag to mark cells ${activePerson.name} could be in. Press and hold a cell to fix them there.`}
        {tool === 'mark' && activePerson && isActiveFixed && `${activePerson.name} is fixed. Press and hold their cell again — or tap "Unfix" above — to undo it.`}
        {tool === 'x' && 'Tap or drag cells to mark as impossible.'}
        {tool === 'erase' && activePerson && `Tap or drag to erase just ${activePerson.name}'s marks.`}
        {tool === 'erase' && !activePerson && 'Tap or drag to clear everything in a cell/row/column.'}
        {tool === 'lock' && (!lockedPeople || lockedPeople.size < 2) && 'Select 2+ suspects above, then tap a row/column handle (or a cell) to rule out everyone else there.'}
        {tool === 'lock' && lockedPeople && lockedPeople.size >= 2 && `Tap a row/column handle (or a cell) to restrict it to: ${[...lockedPeople].join(', ')}.`}
        {!activePerson && tool === 'mark' && 'Pick a suspect above to start marking.'}
      </p>
    </div>
  );
}
