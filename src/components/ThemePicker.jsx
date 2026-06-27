import { useEffect, useRef, useState } from 'react';
import { PRESETS, presetToTheme, isPresetActive, presetAccent, presetBg } from '../theme.js';

// A deliberately low-key control: a small colour dot fixed in the bottom-right
// corner. Click it for the paint panel — 8 preset swatches up top, then live
// hue / vividness / dark-light controls below.
export default function ThemePicker({ theme, onChange, onReset }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside the control.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Tweaking any slider/toggle exits a preset's palette into custom hue mode.
  const tweak = (patch) => onChange({ ...theme, palette: null, ...patch });

  return (
    <div className="paint" ref={ref}>
      {open && (
        <div className="paint-panel" role="dialog" aria-label="Customise colours">
          <div className="paint-presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                className={'swatch' + (isPresetActive(p, theme) ? ' active' : '')}
                style={{ background: presetBg(p) }}
                title={p.name}
                aria-label={p.name}
                onClick={() => onChange(presetToTheme(p))}
              >
                <span className="swatch-dot" style={{ background: presetAccent(p) }} />
              </button>
            ))}
          </div>

          <div className="paint-row">
            <label htmlFor="paint-hue">Colour</label>
            <input
              id="paint-hue"
              className="hue-slider"
              type="range"
              min="0"
              max="360"
              step="1"
              value={theme.hue}
              onChange={(e) => tweak({ hue: Number(e.target.value) })}
            />
          </div>
          <div className="paint-row">
            <label htmlFor="paint-sat">Vividness</label>
            <input
              id="paint-sat"
              type="range"
              min="12"
              max="85"
              step="1"
              value={theme.sat}
              onChange={(e) => tweak({ sat: Number(e.target.value) })}
            />
          </div>
          <div className="paint-row">
            <label>Background</label>
            <div className="seg">
              <button className={!theme.palette && theme.dark ? 'on' : ''} onClick={() => tweak({ dark: true })}>Dark</button>
              <button className={!theme.palette && !theme.dark ? 'on' : ''} onClick={() => tweak({ dark: false })}>Light</button>
            </div>
          </div>
          <button className="paint-reset" onClick={onReset}>Reset to default</button>
        </div>
      )}
      <button
        className="paint-btn"
        aria-label="Customise colours"
        title="Customise colours"
        onClick={() => setOpen((o) => !o)}
      />
    </div>
  );
}
