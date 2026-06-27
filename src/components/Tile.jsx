// Nightfall ramp: ONE blue hue whose lightness rises with the tile's value.
// Small tiles sit dark (near the board); large tiles glow light against the
// dark background, so your progress literally lights up. A single continuous
// function (not a fixed table) means it works for EVERY mode and any value —
// powers of two, Fibonacci numbers, multiplication's huge products, all of it.
function colorFor(value) {
  const t = Math.log2(value); // 1 for the smallest classic tile (2)
  const lightness = Math.min(92, Math.max(25, 25 + (t - 1) * 11.6));
  const saturation = Math.min(60, Math.max(22, 22 + (t - 1) * 7));
  const background = `hsl(207deg ${Math.round(saturation)}% ${Math.round(lightness)}%)`;
  // Keep text readable on both ends: light text on dark tiles, dark on bright.
  const color = lightness > 62 ? '#1a2129' : '#e8eef4';
  return { background, color };
}

// Two nested layers, because both sliding and popping want the `transform`
// property and can't share it:
//   .tile       — positioned by (row,col); transitions transform to SLIDE.
//   .tile-inner — runs the spawn/merge keyframes that scale to POP.
export default function Tile({ tile }) {
  const { value, row, col, isNew, merged } = tile;

  const { background, color } = colorFor(value);
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
