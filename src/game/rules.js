// rules.js — THE customization seam.
//
// A rule answers the questions the engine asks during every move:
//   canMerge(a, b) -> can these two adjacent tiles combine into one?
//   combine(a, b)  -> what value does the merged tile have?
//   spawn()        -> what value should a brand-new tile have?
//   target         -> reaching this value means "you win"
//
// Tile COLOURS aren't a rule concern — every mode shares one Nightfall ramp
// (see colorFor in Tile.jsx) that lightens with the tile's value, so the skin
// stays consistent no matter which operation or number set you're playing.
//
// There are TWO independent axes to vary a mode:
//   • the OPERATION  (how tiles combine: add / multiply / Fibonacci-adjacency)
//   • the SEED       (where the number set starts: 2, 3, 5, 7…)
// Most of the modes below differ only by seed — so a factory builds them.

// ── Factory: one whole FAMILY of modes from a single function ───────────────
// "Equal tiles add" (i.e. doubling), seeded at a chosen starting number.
// Seed 2 is Classic; seed 3 gives 3→6→12→24; seed 5 gives 5→10→20→40; etc.
// Same operation, different number set — the seed axis in code form.
function doublingFrom(seed, extra = {}) {
  return {
    id: `from-${seed}`,
    name: `From ${seed}`,
    blurb: `Equal tiles add — doubling from ${seed}: ${seed}→${seed * 2}→${seed * 4}→${seed * 8}…`,
    canMerge: (a, b) => a === b,
    combine: (a, b) => a + b,
    spawn: () => seed,
    target: seed * 1024, // same depth as Classic (2 → 2048 is ×1024)
    ...extra, // overrides let Classic keep its own name, target, and 90/10 spawn
  };
}

// Classic is literally doublingFrom(2) in a fancy coat.
export const classic = doublingFrom(2, {
  id: 'classic',
  name: 'Classic',
  blurb: 'Equal tiles combine into their sum. Get a tile to 2048.',
  spawn: () => (Math.random() < 0.9 ? 2 : 4),
  target: 2048,
});

// The prime-seed spin-offs you asked for. Each is one line — that's the payoff.
export const fromThree = doublingFrom(3);
export const fromFive = doublingFrom(5);
export const fromSeven = doublingFrom(7);

// ── A genuinely different OPERATION: multiply ──────────────────────────────
export const multiply = {
  id: 'multiply',
  name: 'Multiply',
  blurb: 'Equal tiles MULTIPLY: 2×2=4, 4×4=16, 16×16=256… numbers explode fast!',
  canMerge: (a, b) => a === b,
  combine: (a, b) => a * b,
  spawn: () => 2,
  target: 65536,
};

// ── Another different operation: Fibonacci adjacency ───────────────────────
const FIB = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597];

/** True when a and b are consecutive Fibonacci numbers (in either order). */
export function fibAdjacent(a, b) {
  if (a === 1 && b === 1) return true; // the seed: 1 + 1 = 2 kicks things off
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  const i = FIB.indexOf(lo);
  return i !== -1 && FIB[i + 1] === hi;
}

export const fibonacci = {
  id: 'fibonacci',
  name: 'Fibonacci',
  blurb: 'Merge NEIGHBOURS in the sequence: 1+1=2, 1+2=3, 2+3=5, 3+5=8…',
  canMerge: fibAdjacent,
  combine: (a, b) => a + b,
  spawn: () => (Math.random() < 0.8 ? 1 : 2),
  target: 144,
};

// The registry the UI reads from. Order here is the order of the buttons.
// Doubling family first (same game, different number sets), then the two
// genuinely different operations.
export const RULES = {
  classic,
  fromThree,
  fromFive,
  fromSeven,
  multiply,
  fibonacci,
};
