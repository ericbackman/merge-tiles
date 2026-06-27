import { useLayoutEffect, useState } from 'react';
import { useGame } from './hooks/useGame.js';
import { RULES } from './game/rules.js';
import { DEFAULT_THEME, applyTheme, loadTheme, saveTheme } from './theme.js';
import Board from './components/Board.jsx';
import ThemePicker from './components/ThemePicker.jsx';
import './App.css';

const SIZES = [4, 5, 6];

export default function App() {
  const { tiles, score, won, over, move, reset, setMode, setSize, rule, size } = useGame();

  // The switcher reads straight from the RULES registry, so adding a rule in
  // rules.js makes a button appear here automatically — no UI changes needed.
  const modes = Object.values(RULES);

  // Live "chameleon paint": theme is persisted and applied to :root before the
  // browser paints (useLayoutEffect) so a saved skin shows with no flash.
  const [theme, setTheme] = useState(loadTheme);
  useLayoutEffect(() => {
    applyTheme(theme);
    saveTheme(theme);
  }, [theme]);

  return (
    <div className="app">
      <header>
        <h1>Merge Tiles</h1>
        <span className="mode">{rule.name}</span>
      </header>

      {modes.length > 1 && (
        <div className="modes">
          {modes.map((r) => (
            <button
              key={r.id}
              className={'mode-btn' + (r.id === rule.id ? ' active' : '')}
              onClick={() => setMode(r)}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      <div className="sizes">
        <span className="sizes-label">Board</span>
        {SIZES.map((n) => (
          <button
            key={n}
            className={'size-btn' + (n === size ? ' active' : '')}
            onClick={() => setSize(n)}
          >
            {n}×{n}
          </button>
        ))}
      </div>

      <div className="hud">
        <div className="score">
          Score
          <strong>{score}</strong>
        </div>
        <button onClick={reset}>New game</button>
      </div>

      <p className="rule-blurb">{rule.blurb}</p>

      <div className="board-wrap">
        <Board tiles={tiles} size={size} dark={theme.dark} />
        {(won || over) && (
          <div className="overlay">
            <div className="overlay-text">
              {won ? `🎉 You reached ${rule.target}!` : 'Game over'}
            </div>
            <button onClick={reset}>Play again</button>
          </div>
        )}
      </div>

      <p className="hint">Arrow keys or WASD to play.</p>
      <div className="dpad">
        <button onClick={() => move('up')} aria-label="up">↑</button>
        <div className="dpad-row">
          <button onClick={() => move('left')} aria-label="left">←</button>
          <button onClick={() => move('down')} aria-label="down">↓</button>
          <button onClick={() => move('right')} aria-label="right">→</button>
        </div>
      </div>

      <footer className="credit">
        An original take on the 2048 genre — mechanics inspired by{' '}
        <a href="https://github.com/gabrielecirulli/2048" target="_blank" rel="noreferrer noopener">
          2048 by Gabriele Cirulli
        </a>
        . Not affiliated. Built by Eric Backman.
      </footer>

      <ThemePicker theme={theme} onChange={setTheme} onReset={() => setTheme(DEFAULT_THEME)} />
    </div>
  );
}
