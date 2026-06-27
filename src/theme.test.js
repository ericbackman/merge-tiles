import { describe, it, expect } from 'vitest';
import { tileLightness } from './theme.js';

describe('tile lightness ramp inverts with the background', () => {
  it('brightens with value on a dark background (big tiles glow)', () => {
    expect(tileLightness(64, true)).toBeGreaterThan(tileLightness(2, true));
  });

  it('darkens with value on a light background (big tiles ink)', () => {
    expect(tileLightness(64, false)).toBeLessThan(tileLightness(2, false));
  });

  it('keeps the smallest tile distinct from the board in both modes', () => {
    expect(tileLightness(2, true)).toBeGreaterThanOrEqual(25); // above the dark board
    expect(tileLightness(2, false)).toBeLessThanOrEqual(82); // below the light page
  });
});
