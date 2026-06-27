import { describe, it, expect } from 'vitest';
import { multiply, fibonacci, fibAdjacent, fromThree, fromFive } from './rules.js';
import { moveTiles, gridToTiles, tilesToGrid } from './engine.js';

// Apply a move under a given rule and read the first row back as numbers.
const firstRow = (cells, rule, dir = 'left') => {
  const grid = [cells, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  return tilesToGrid(moveTiles(gridToTiles(grid), dir, rule).tiles)[0];
};
const score = (cells, rule, dir = 'left') => {
  const grid = [cells, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  return moveTiles(gridToTiles(grid), dir, rule).gained;
};

describe('doubling-from-seed family', () => {
  it('ADDS equal seeds rather than multiplying them: 3+3=6, not 9', () => {
    expect(firstRow([3, 3, 0, 0], fromThree)).toEqual([6, 0, 0, 0]);
  });

  it('continues the doubling chain: 6+6=12', () => {
    expect(firstRow([6, 6, 0, 0], fromThree)).toEqual([12, 0, 0, 0]);
  });

  it('seeds at 5 as easily as at 3 (the factory just takes a number)', () => {
    expect(firstRow([5, 5, 0, 0], fromFive)).toEqual([10, 0, 0, 0]);
  });

  it('still refuses to merge unequal tiles', () => {
    expect(firstRow([3, 6, 0, 0], fromThree)).toEqual([3, 6, 0, 0]);
  });
});

describe('multiply rule', () => {
  it('multiplies equal tiles instead of adding them', () => {
    expect(firstRow([4, 4, 0, 0], multiply)).toEqual([16, 0, 0, 0]); // 4×4, not 8
    expect(score([4, 4, 0, 0], multiply)).toBe(16);
  });

  it('still refuses to merge unequal tiles', () => {
    expect(firstRow([2, 4, 0, 0], multiply)).toEqual([2, 4, 0, 0]);
  });

  it('inherits the no-double-merge rule unchanged', () => {
    expect(firstRow([2, 2, 2, 2], multiply)).toEqual([4, 4, 0, 0]);
  });
});

describe('fibAdjacent', () => {
  it('treats two 1s as the sequence seed', () => {
    expect(fibAdjacent(1, 1)).toBe(true);
  });

  it('accepts consecutive Fibonacci numbers in either order', () => {
    expect(fibAdjacent(1, 2)).toBe(true);
    expect(fibAdjacent(3, 2)).toBe(true); // order shouldn't matter
    expect(fibAdjacent(5, 8)).toBe(true);
  });

  it('rejects equal tiles (except the 1,1 seed) and non-neighbours', () => {
    expect(fibAdjacent(2, 2)).toBe(false);
    expect(fibAdjacent(3, 3)).toBe(false);
    expect(fibAdjacent(2, 5)).toBe(false); // 2 and 5 skip a term
    expect(fibAdjacent(1, 3)).toBe(false);
  });
});

describe('fibonacci rule', () => {
  it('merges neighbours into the next term', () => {
    expect(firstRow([2, 3, 0, 0], fibonacci)).toEqual([5, 0, 0, 0]); // 2+3=5
    expect(firstRow([3, 5, 0, 0], fibonacci)).toEqual([8, 0, 0, 0]); // 3+5=8
    expect(firstRow([1, 1, 0, 0], fibonacci)).toEqual([2, 0, 0, 0]); // seed
  });

  it('does NOT merge equal non-seed tiles or skipped terms', () => {
    expect(firstRow([3, 3, 0, 0], fibonacci)).toEqual([3, 3, 0, 0]);
    expect(firstRow([2, 5, 0, 0], fibonacci)).toEqual([2, 5, 0, 0]);
  });
});
