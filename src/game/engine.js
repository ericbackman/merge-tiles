// engine.js — pure game logic, now built around TILE IDENTITY.
//
// A tile is a number that remembers *which* tile it is as it moves:
//   { id, value, row, col, isNew?, merged? }
//
// Stable ids are what make animation possible: the UI keys each tile by id, so
// when a tile's (row,col) changes, React updates the same DOM node and a CSS
// transition slides it. `isNew` (just spawned) and `merged` (just combined)
// are one-move flags the UI uses to trigger a pop / fade-in.

export const SIZE = 4; // DEFAULT board size; every function below takes a `size`
                       // override so the same engine runs 4×4, 5×5, 6×6, …

// Every tile needs a unique id. A simple incrementing counter is plenty —
// ids only need to be unique within a session, never persisted.
let _nextId = 0;
const newId = () => ++_nextId;

/**
 * Per-direction config so the merge loop below can stay direction-agnostic.
 *   axis  : do we group tiles into rows or columns?
 *   order : sort a line so the tile nearest the wall comes first
 *   coord : given a line index and a slot (0 = against the wall), where does
 *           the tile end up?
 */
// coord takes (lineIndex, slot, n) where n is the board size — so the
// "against the far wall" directions (right/down) compute their offset from n.
const LINES = {
  left:  { axis: 'row', order: (a, b) => a.col - b.col, coord: (i, s) => ({ row: i, col: s }) },
  right: { axis: 'row', order: (a, b) => b.col - a.col, coord: (i, s, n) => ({ row: i, col: n - 1 - s }) },
  up:    { axis: 'col', order: (a, b) => a.row - b.row, coord: (i, s) => ({ row: s, col: i }) },
  down:  { axis: 'col', order: (a, b) => b.row - a.row, coord: (i, s, n) => ({ row: n - 1 - s, col: i }) },
};

/**
 * Apply a move to a list of tiles. Returns the new tile list (with updated
 * positions + merged flags), points gained, and whether anything moved.
 * Does NOT spawn — the caller does that, so this stays pure.
 */
export function moveTiles(tiles, direction, rule, size = SIZE) {
  const cfg = LINES[direction];
  const result = [];
  let gained = 0;

  for (let line = 0; line < size; line++) {
    // Pull out one row/column and order it from the wall outward.
    const lineTiles = tiles
      .filter((t) => (cfg.axis === 'row' ? t.row : t.col) === line)
      .sort(cfg.order);

    let slot = 0; // next free position against the wall
    for (let i = 0; i < lineTiles.length; i++) {
      const a = lineTiles[i];
      const b = lineTiles[i + 1];

      if (b && rule.canMerge(a.value, b.value)) {
        // Merge. We keep b's id (the tile FARTHER from the wall) so the tile
        // that travels the long way is the one that slides + pops into place;
        // a simply disappears under it. Then skip b — that's the no-double-
        // merge rule you wrote, now expressed by advancing past the consumed
        // tile so the new tile can't merge again this move.
        const value = rule.combine(a.value, b.value);
        gained += value;
        result.push({ id: b.id, value, ...cfg.coord(line, slot, size), merged: true });
        i++;
      } else {
        result.push({ id: a.id, value: a.value, ...cfg.coord(line, slot, size), merged: false });
      }
      slot++;
    }
  }

  // "Moved" if a merge happened (fewer tiles) or any tile changed position.
  const moved =
    result.length !== tiles.length ||
    result.some((t) => {
      const before = tiles.find((o) => o.id === t.id);
      return before.row !== t.row || before.col !== t.col;
    });

  return { tiles: result, gained, moved };
}

/** Coordinates of every empty cell, given the tiles currently on the board. */
export function emptyCells(tiles, size = SIZE) {
  const taken = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const cells = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!taken.has(`${r},${c}`)) cells.push({ row: r, col: c });
    }
  }
  return cells;
}

/**
 * Return a NEW tile list with one freshly-spawned tile (flagged isNew so the
 * UI can fade it in). `random` is injectable so tests stay deterministic.
 */
export function spawnTile(tiles, rule, size = SIZE, random = Math.random) {
  const cells = emptyCells(tiles, size);
  if (cells.length === 0) return tiles;
  const { row, col } = cells[Math.floor(random() * cells.length)];
  return [...tiles, { id: newId(), value: rule.spawn(), row, col, isNew: true }];
}

/** A fresh game: an empty board with two tiles already placed. */
export function init(rule, size = SIZE) {
  return spawnTile(spawnTile([], rule, size), rule, size);
}

/** Has any tile reached the rule's winning target? */
export function hasWon(tiles, rule) {
  return tiles.some((t) => t.value === rule.target);
}

/** True when the board is full AND no move in any direction would change it. */
export function isGameOver(tiles, rule, size = SIZE) {
  if (tiles.length < size * size) return false;
  return ['left', 'right', 'up', 'down'].every(
    (dir) => !moveTiles(tiles, dir, rule, size).moved
  );
}

// --- test helpers: convert between the human-readable grid form and tiles ---

/** Build a tile list from a number grid (0 = empty). Handy for tests. */
export function gridToTiles(grid) {
  const tiles = [];
  grid.forEach((row, r) =>
    row.forEach((value, c) => {
      if (value !== 0) tiles.push({ id: newId(), value, row: r, col: c });
    })
  );
  return tiles;
}

/** Render a tile list back into a number grid (0 = empty). Handy for tests. */
export function tilesToGrid(tiles, size = SIZE) {
  const grid = Array.from({ length: size }, () => Array(size).fill(0));
  tiles.forEach((t) => {
    grid[t.row][t.col] = t.value;
  });
  return grid;
}
