import { TERRAIN_COLOR } from './objectLibrary';

// Drop an SVG (or PNG) into src/assets/terrain/ named after the terrain
// type — water.svg, grass.svg, sand.svg, path.svg, floor.svg — and it is
// picked up automatically as that terrain's tile. No other code changes
// needed. Delete the file and that terrain falls back to the generated CSS
// pattern instead.
//
// One tile is drawn per CELL (background-size: 100% 100%), which matches how
// the reference boards give every square its own little drawing. If you'd
// rather a texture repeat at its natural size across the board, change
// `backgroundSize` below to 'auto' — but then artwork must tile seamlessly
// in both directions or the seams will show.
const modules = import.meta.glob('../assets/terrain/*.{svg,png}', { eager: true, import: 'default' });

const textureByTerrain = {};
for (const path in modules) {
  const name = path.split('/').pop().replace(/\.(svg|png)$/, '');
  textureByTerrain[name] = modules[path];
}

export function terrainTextureStyle(terrain) {
  const url = textureByTerrain[terrain];
  if (!url) return null;
  return {
    backgroundColor: TERRAIN_COLOR[terrain] || 'transparent',
    // The URL must be QUOTED: Vite inlines small SVGs as a data: URI whose
    // payload contains characters (parentheses, commas, quotes) that break
    // an unquoted url(...), which silently computes to `none` and leaves the
    // cell blank.
    backgroundImage: `url("${url}")`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
  };
}

export function hasTerrainTexture(terrain) {
  return Boolean(textureByTerrain[terrain]);
}
