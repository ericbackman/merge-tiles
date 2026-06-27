import { describe, it, expect } from 'vitest';
import {
  tileLightness, tileStyle, presetToTheme, isPresetActive, PRESETS,
} from './theme.js';

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

describe('presets', () => {
  it('ships exactly 8 swatches, including Original 2048', () => {
    expect(PRESETS).toHaveLength(8);
    expect(PRESETS.some((p) => p.palette === 'original')).toBe(true);
  });

  it('hue presets resolve to a custom theme with no palette', () => {
    const t = presetToTheme(PRESETS.find((p) => p.id === 'seafoam'));
    expect(t.palette).toBeNull();
    expect(t.hue).toBe(172);
  });

  it('Original 2048 uses its explicit palette colours, not the hue ramp', () => {
    const t = presetToTheme(PRESETS.find((p) => p.id === 'original'));
    expect(t.palette).toBe('original');
    expect(tileStyle(2, t).background).toBe('#eee4da'); // the iconic cream tile
    expect(tileStyle(8, t).background).toBe('#f2b179'); // the iconic orange tile
  });

  it('marks the active preset and only the active one', () => {
    const seafoam = PRESETS.find((p) => p.id === 'seafoam');
    expect(isPresetActive(seafoam, presetToTheme(seafoam))).toBe(true);
    expect(isPresetActive(seafoam, { hue: 0, sat: 45, dark: true, palette: null })).toBe(false);
  });
});
