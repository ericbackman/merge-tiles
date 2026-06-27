// theme.js — the live "chameleon paint" system + quick-pick presets.
//
// A theme is { hue, sat, dark, palette }. Most themes are a single HUE driving
// a lightness ramp (cheap: hue+sat are CSS vars, no React re-render on drag).
// `palette` is the escape hatch for looks that AREN'T one hue — e.g. the
// original 2048 colours — where each tile value maps to an explicit colour.

export const DEFAULT_THEME = { hue: 207, sat: 45, dark: true, palette: null };
const KEY = 'mergeTilesTheme';

// Explicit multi-colour palettes (keyed by tile value). Referenced by presets
// whose look can't be expressed as a single hue.
export const PALETTES = {
  original: {
    fallback: '#3c3a32',
    colors: {
      2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f',
      64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850',
      1024: '#edc53f', 2048: '#edc22e',
    },
    text: (v) => (v <= 4 ? '#776e65' : '#f9f6f2'),
    accent: '#f2b179',
    chrome: {
      '--bg': '#faf8ef', '--board-bg': '#bbada0', '--cell-bg': 'rgba(238,228,218,0.35)',
      '--text': '#776e65', '--text-muted': '#8f7a66', '--panel': '#bbada0',
      '--btn': '#8f7a66', '--btn-hover': '#9f8b77', '--btn-active': '#f59563',
      '--btn-inactive': '#cdc1b4', '--overlay': 'rgba(238,228,218,0.82)',
    },
  },
};

// The 8 quick-pick swatches. A `palette` preset uses PALETTES; the rest are
// hue/sat/dark triples driving the live ramp.
export const PRESETS = [
  { id: 'nightfall', name: 'Nightfall',     hue: 207, sat: 45, dark: true },
  { id: 'original',  name: 'Original 2048', palette: 'original', dark: false },
  { id: 'seafoam',   name: 'Seafoam',       hue: 172, sat: 40, dark: false },
  { id: 'sage',      name: 'Sage',          hue: 115, sat: 30, dark: false },
  { id: 'lavender',  name: 'Lavender',      hue: 270, sat: 36, dark: false },
  { id: 'amber',     name: 'Amber',         hue: 35,  sat: 52, dark: true },
  { id: 'rose',      name: 'Rosé',          hue: 340, sat: 40, dark: true },
  { id: 'slate',     name: 'Slate',         hue: 210, sat: 10, dark: true },
];

/** Turn a preset into a full theme object. */
export function presetToTheme(preset) {
  if (preset.palette) {
    return { hue: DEFAULT_THEME.hue, sat: DEFAULT_THEME.sat, dark: preset.dark, palette: preset.palette };
  }
  return { hue: preset.hue, sat: preset.sat, dark: preset.dark, palette: null };
}

/** Is this preset the one currently in effect? (for the active ring) */
export function isPresetActive(preset, theme) {
  if (preset.palette) return theme.palette === preset.palette;
  return !theme.palette && theme.hue === preset.hue && theme.sat === preset.sat && theme.dark === preset.dark;
}

/** Representative colours for a preset's swatch (background + accent dot). */
export function presetAccent(preset) {
  return preset.palette ? PALETTES[preset.palette].accent : `hsl(${preset.hue} ${preset.sat}% 55%)`;
}
export function presetBg(preset) {
  if (preset.palette) return PALETTES[preset.palette].chrome['--bg'];
  return preset.dark ? `hsl(${preset.hue} 18% 14%)` : `hsl(${preset.hue} 34% 93%)`;
}

/**
 * A tile's lightness as a function of its value (hue mode only). The ramp
 * direction flips with the background so big tiles always stand out:
 *   dark bg  → small tiles dark, big tiles bright (glow)
 *   light bg → small tiles light, big tiles dark (ink)
 */
export function tileLightness(value, dark) {
  const step = (Math.log2(value) - 1) * 11.6;
  return dark
    ? Math.min(92, Math.max(25, 25 + step))
    : Math.min(82, Math.max(30, 82 - step));
}

/** Inline style for a tile. Palette mode = explicit colour; hue mode = ramp
 *  (hue + saturation come from CSS vars, so dragging recolours without a
 *  re-render; only lightness is baked per value). */
export function tileStyle(value, theme) {
  const p = theme.palette && PALETTES[theme.palette];
  if (p) return { background: p.colors[value] || p.fallback, color: p.text(value) };
  const L = Math.round(tileLightness(value, theme.dark));
  return {
    background: `hsl(var(--tile-hue, 207) var(--tile-sat, 45%) ${L}%)`,
    color: L > 60 ? '#1b2128' : '#eef2f6',
  };
}

/** Write the whole theme to :root as CSS variables. */
export function applyTheme(theme) {
  const r = document.documentElement.style;
  const p = theme.palette && PALETTES[theme.palette];
  if (p) {
    Object.entries(p.chrome).forEach(([k, v]) => r.setProperty(k, v));
    r.setProperty('--accent', p.accent);
    return; // tiles use explicit palette colours; --tile-hue/sat are unused here
  }
  const { hue, sat, dark } = theme;
  r.setProperty('--tile-hue', String(hue));
  r.setProperty('--tile-sat', `${sat}%`);
  r.setProperty('--accent', `hsl(${hue} ${sat}% 55%)`);
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
