import { useNavigate } from 'react-router-dom';
import { GLOSSARY_SECTIONS } from '../data/glossaryTerms';
import { OBJECT_LIBRARY } from '../data/objectLibrary';
import MiniGrid from '../components/MiniGrid';
import ObjectGlyph from '../components/ObjectGlyph';

export default function Glossary() {
  const navigate = useNavigate();

  return (
    <div className="glossary-screen">
      <header className="glossary-header">
        <button className="link-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Glossary</h1>
        <span style={{ width: 60 }} />
      </header>

      <p className="glossary-intro">
        Reference for the spatial terms, mechanics, and board objects used in
        Murdoku clues. Diagrams show a plain example, not any real puzzle.
      </p>

      <nav className="glossary-jump">
        {GLOSSARY_SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`}>{s.title}</a>
        ))}
        <a href="#board-objects">Board Objects</a>
      </nav>

      {GLOSSARY_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="glossary-section">
          <h2>{section.title}</h2>
          <div className="glossary-entries">
            {section.entries.map((e) => (
              <div key={e.term} className="glossary-entry">
                {e.diagram && (
                  <MiniGrid
                    size={110}
                    cells={e.diagram.cells}
                    arrow={e.diagram.arrow}
                    dimmedRows={e.diagram.dimmedRows || []}
                    dimmedCols={e.diagram.dimmedCols || []}
                  />
                )}
                <div>
                  <h3>{e.term}</h3>
                  <p>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section id="board-objects" className="glossary-section">
        <h2>Board Objects ({Object.keys(OBJECT_LIBRARY).length})</h2>
        <div className="object-grid">
          {Object.entries(OBJECT_LIBRARY).sort(([a], [b]) => a.localeCompare(b)).map(([name, info]) => (
            <div key={name} className="object-entry">
              <span className="object-icon"><ObjectGlyph type={name} size={30} /></span>
              <span className="object-name">{name}</span>
              <span className="object-blocking">
                {info.blocking
                  ? 'Blocks movement'
                  : info.onBoundary
                    ? 'On the area boundary — stand in front of it from either side'
                    : `Standable${info.prep ? ` (${info.prep})` : ''}`}
              </span>
            </div>
          ))}
        </div>
      </section>

      <a className="back-to-top" href="#top">↑ Top</a>
      <p className="icon-credit">Icons: <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer">Twemoji</a> (CC-BY 4.0) and <a href="https://openmoji.org" target="_blank" rel="noreferrer">OpenMoji</a> (CC BY-SA 4.0).</p>
    </div>
  );
}
