import { tileStyle } from '../theme.js';

// Two nested layers, because both sliding and popping want the `transform`
// property and can't share it:
//   .tile       — positioned by (row,col); transitions transform to SLIDE.
//   .tile-inner — runs the spawn/merge keyframes that scale to POP.
// Colour comes from theme.js: hue + saturation via CSS vars (live), lightness
// per value (ramp direction depends on the dark/light background).
export default function Tile({ tile, dark }) {
  const { value, row, col, isNew, merged } = tile;

  const { background, color } = tileStyle(value, dark);
  // Size the font by digit count so 65536 and 8 both fit their tile.
  const digits = String(value).length;
  const fontSize =
    digits >= 5 ? '1.1rem' : digits >= 4 ? '1.4rem' : digits >= 3 ? '1.75rem' : '2.1rem';

  const inner =
    'tile-inner' + (isNew ? ' is-new' : '') + (merged ? ' is-merged' : '');

  return (
    <div className="tile" style={{ '--row': row, '--col': col }}>
      <div className={inner} style={{ background, color, fontSize }}>
        {value}
      </div>
    </div>
  );
}
