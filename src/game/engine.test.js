import { describe, it, expect } from 'vitest';
import { classic } from './rules.js';
import { moveTiles, spawnTile, isGameOver, hasWon, gridToTiles, tilesToGrid } from './engine.js';

// Convenience: take a number grid, apply a move, get a number grid back. This
// lets us assert on the easy-to-read grid form while the engine works on tiles.
const move = (grid, dir) => tilesToGrid(moveTiles(gridToTiles(grid), dir, classic).tiles);
const scoreOf = (grid, dir) => moveTiles(gridToTiles(grid), dir, classic).gained;

const row = (a, b, c, d) => [[a, b, c, d], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

describe('moveTiles — sliding', () => {
  it('slides tiles toward the wall, filling gaps', () => {
    expect(move(row(0, 2, 0, 4), 'left')[0]).toEqual([2, 4, 0, 0]);
  });

  it('leaves non-mergeable tiles alone', () => {
    expect(move(row(2, 4, 2, 4), 'left')[0]).toEqual([2, 4, 2, 4]);
    expect(scoreOf(row(2, 4, 2, 4), 'left')).toBe(0);
  });
});

describe('moveTiles — merging', () => {
  it('merges a pair into its sum and scores it', () => {
    expect(move(row(2, 2, 0, 0), 'left')[0]).toEqual([4, 0, 0, 0]);
    expect(scoreOf(row(2, 2, 0, 0), 'left')).toBe(4);
  });

  it('does NOT double-merge: four 2s make two 4s, not one 8', () => {
    expect(move(row(2, 2, 2, 2), 'left')[0]).toEqual([4, 4, 0, 0]);
    expect(scoreOf(row(2, 2, 2, 2), 'left')).toBe(8);
  });

  it('merges the wall-side pair first', () => {
    expect(move(row(4, 4, 8, 0), 'left')[0]).toEqual([8, 8, 0, 0]);
  });

  it('merges across gaps', () => {
    expect(move(row(2, 0, 0, 2), 'left')[0]).toEqual([4, 0, 0, 0]);
  });

  it('respects direction (right)', () => {
    expect(move(row(2, 2, 0, 0), 'right')[0]).toEqual([0, 0, 0, 4]);
  });

  it('stacks and merges a column upward', () => {
    const grid = [
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    expect(move(grid, 'up')[0][0]).toBe(4);
  });
});

describe('moveTiles — flags & identity', () => {
  it('flags the merged tile (for the pop animation) but not survivors', () => {
    const after = moveTiles(gridToTiles(row(2, 2, 4, 0)), 'left', classic).tiles;
    const merged = after.find((t) => t.value === 4 && t.merged);
    expect(merged).toBeTruthy();
    expect(after.filter((t) => t.merged).length).toBe(1);
  });

  it('reports moved=false on a locked board', () => {
    const locked = gridToTiles([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(moveTiles(locked, 'left', classic).moved).toBe(false);
  });
});

describe('helpers', () => {
  it('spawnTile adds exactly one flagged-new tile to an empty cell', () => {
    const before = gridToTiles(row(2, 4, 8, 16));
    const after = spawnTile(before, classic, 4, () => 0);
    expect(after.length).toBe(before.length + 1);
    expect(after.at(-1).isNew).toBe(true);
  });

  it('hasWon detects the target tile', () => {
    expect(hasWon(gridToTiles(row(2048, 0, 0, 0)), classic)).toBe(true);
  });

  it('isGameOver only when full and locked', () => {
    const locked = gridToTiles([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ]);
    expect(isGameOver(locked, classic)).toBe(true);
  });
});

describe('variable board size', () => {
  // 5 rows of 5; only the top row has tiles.
  const grid5 = (top) => [top, [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];

  it('collapses a row left on a 5×5 board', () => {
    const after = moveTiles(gridToTiles(grid5([2, 0, 2, 0, 0])), 'left', classic, 5).tiles;
    expect(tilesToGrid(after, 5)[0]).toEqual([4, 0, 0, 0, 0]);
  });

  it('packs against the FAR wall (col 4) on a right move — proves the size offset', () => {
    const after = moveTiles(gridToTiles(grid5([2, 0, 2, 0, 0])), 'right', classic, 5).tiles;
    expect(tilesToGrid(after, 5)[0]).toEqual([0, 0, 0, 0, 4]);
  });

  it('a 5×5 board is not game-over until all 25 cells are full', () => {
    const after = moveTiles(gridToTiles(grid5([2, 2, 2, 2, 2])), 'left', classic, 5).tiles;
    expect(isGameOver(after, classic, 5)).toBe(false);
  });
});
