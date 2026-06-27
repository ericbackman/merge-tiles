// theme.js — the live "chameleon paint" system.
//
// Everything visual is derived from three knobs: hue (0–360), saturation, and
// whether the background is dark or light. The tile HUE and SATURATION are
// applied as CSS variables, so dragging a slider recolours every tile via CSS
// with no React re-render. Only the LIGHTNESS ramp is computed in JS, because
// it must invert between dark and light backgrounds (see tileLightness).

export const DEFAULT_THEME = { hue: 207, sat: 45, dark: true };
const KEY = 'mergeTilesTheme';

/**
 * A tile's lightness as a function of its value. The ramp direction flips with
 * the background so big tiles always stand out:
 *   dark bg  → small tiles dark (hug the board), big tiles bright (glow)
 *   light bg → small tiles light, big tiles dark (ink against the page)
 */
export function tileLightness(value, dark) {
  const step = (Math.log2(value) - 1) * 11.6;
  return dark
    ? Math.min(92, Math.max(25, 25 + step))
    : Math.min(82, Math.max(30, 82 - step));
}

/** Inline style for a tile: hue + saturation come from CSS vars (live), only
 *  lightness (and the readable text colour) are baked per value. */
export function tileStyle(value, dark) {
  const L = Math.round(tileLightness(value, dark));
  return {
    background: `hsl(var(--tile-hue, 207) var(--tile-sat, 45%) ${L}%)`,
    color: L > 60 ? '#1b2128' : '#eef2f6',
  };
}

/** Write the whole theme to :root as CSS variables. Chrome colours are derived
 *  from the same hue so the whole app shifts together. */
export function applyTheme({ hue, sat, dark }) {
  const r = document.documentElement.style;
  r.setProperty('--tile-hue', String(hue));
  r.setProperty('--tile-sat', `${sat}%`);
  const set = (k, v) => r.setProperty(k, v);
  if (dark) {
    set('--bg', `hsl(${hue} 18% 13%)`);
    set('--board-bg', `hsl(${hue} 16% 21%)`);
    set('--cell-bg', `hsla(${hue}, 35%, 72%, 0.08)`);
    set('--text', `hsl(${hue} 28% 93%)`);
    set('--text-muted', `hsl(${hue} 22% 66%)`);
    set('--panel', `hsl(${hue} 17% 19%)`);
    set('--btn', `hsl(${hue} 22% 29%)`);
    set('--btn-hover', `hsl(${hue} 22% 36%)`);
    set('--btn-active', `hsl(${hue} 38% 46%)`);
    set('--btn-inactive', `hsl(${hue} 18% 25%)`);
    set('--overlay', `hsla(${hue}, 22%, 9%, 0.86)`);
  } else {
    set('--bg', `hsl(${hue} 36% 95%)`);
    set('--board-bg', `hsl(${hue} 24% 80%)`);
    set('--cell-bg', `hsla(${hue}, 25%, 30%, 0.10)`);
    set('--text', `hsl(${hue} 30% 17%)`);
    set('--text-muted', `hsl(${hue} 18% 38%)`);
    set('--panel', `hsl(${hue} 26% 87%)`);
    set('--btn', `hsl(${hue} 24% 72%)`);
    set('--btn-hover', `hsl(${hue} 24% 66%)`);
    set('--btn-active', `hsl(${hue} 45% 55%)`);
    set('--btn-inactive', `hsl(${hue} 22% 82%)`);
    set('--overlay', `hsla(${hue}, 30%, 93%, 0.86)`);
  }
}

export function loadTheme() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    // storage unavailable (private mode etc.) — fall back to the default theme
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(KEY, JSON.stringify(theme));
  } catch {
    // storage unavailable — the preference just won't persist; not an error
  }
}
