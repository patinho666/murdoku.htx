// Several cast names are unisex (Ada, Clio, Dov, Boaz, Innes, Jean, Kit,
// Faye...), and some clues identify a person only by sex ("there was a
// woman in her area"), so the sex has to be readable beside every name.
//
// The Venus/Mars glyph carries the meaning and the colour only reinforces
// it — colour alone would fail for colour-blind players and in greyscale.
export default function GenderMark({ gender }) {
  if (gender !== 'm' && gender !== 'f') return null;
  const female = gender === 'f';
  return (
    <span
      className={`gender-mark ${female ? 'gender-f' : 'gender-m'}`}
      title={female ? 'female' : 'male'}
      aria-label={female ? 'female' : 'male'}
    >
      {female ? '♀' : '♂'}
    </span>
  );
}
