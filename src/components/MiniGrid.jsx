// Renders a small NxN grid with one or two highlighted cells and an
// optional arrow between them, used to illustrate glossary terms.
// This is original artwork for this app (not copied from any other source).
export default function MiniGrid({
  n = 5, size = 140, cells = [], arrow = null, dimmedRows = [], dimmedCols = [],
}) {
  const cell = size / n;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: n }).map((_, r) => (
        Array.from({ length: n }).map((_, c) => {
          const inDimRow = dimmedRows.includes(r);
          const inDimCol = dimmedCols.includes(c);
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cell} y={r * cell} width={cell} height={cell}
              fill={inDimRow || inDimCol ? '#f1f5f9' : '#ffffff'}
              stroke="#cbd5e1" strokeWidth="1"
            />
          );
        })
      ))}
      {arrow && (
        <line
          x1={arrow.from[1] * cell + cell / 2} y1={arrow.from[0] * cell + cell / 2}
          x2={arrow.to[1] * cell + cell / 2} y2={arrow.to[0] * cell + cell / 2}
          stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arrowhead)"
        />
      )}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
        </marker>
      </defs>
      {cells.map(({ r, c, label, color }) => (
        <g key={`${r}-${c}-${label}`}>
          <circle cx={c * cell + cell / 2} cy={r * cell + cell / 2} r={cell * 0.34} fill={color} />
          <text
            x={c * cell + cell / 2} y={r * cell + cell / 2 + cell * 0.13}
            textAnchor="middle" fontSize={cell * 0.42} fontWeight="800" fill="#fff"
          >
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}
