import { useReducer, useEffect } from 'react';
import { classic } from '../game/rules.js';
import { SIZE, init, moveTiles, spawnTile, isGameOver, hasWon } from '../game/engine.js';

// Map keyboard keys -> directions. Arrow keys and WASD both work.
const KEY_TO_DIR = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
};

// State now carries `size` alongside `rule` — the two are independent knobs.
function initState({ rule, size }) {
  return { tiles: init(rule, size), score: 0, won: false, over: false, rule, size };
}

// All game transitions live here. The UI only dispatches intentions.
function reducer(state, action) {
  switch (action.type) {
    case 'move': {
      const { tiles, gained, moved } = moveTiles(state.tiles, action.direction, state.rule, state.size);
      if (!moved) return state; // illegal move: nothing changes, no new tile
      const next = spawnTile(tiles, state.rule, state.size);
      return {
        ...state,
        tiles: next,
        score: state.score + gained,
        won: state.won || hasWon(next, state.rule),
        over: isGameOver(next, state.rule, state.size),
      };
    }
    case 'reset':
      return initState(state);
    case 'setMode':
      return initState({ rule: action.rule, size: state.size }); // keep board size
    case 'setSize':
      return initState({ rule: state.rule, size: action.size }); // keep rule
    default:
      return state;
  }
}

/** Owns game state and wires up keyboard + touch (swipe) input. */
export function useGame(rule = classic, size = SIZE) {
  const [state, dispatch] = useReducer(reducer, { rule, size }, initState);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const dir = KEY_TO_DIR[e.key];
      if (!dir) return;
      e.preventDefault(); // stop arrow keys scrolling the page
      dispatch({ type: 'move', direction: dir });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Touch swipe: record where a touch starts, and on release pick the
  // dominant axis. A small threshold ignores accidental taps.
  useEffect(() => {
    let startX = 0, startY = 0, tracking = false;
    const onStart = (e) => {
      const t = e.changedTouches[0];
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };
    const onEnd = (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; // too small: ignore
      const dir =
        Math.abs(dx) > Math.abs(dy)
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up');
      dispatch({ type: 'move', direction: dir });
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  return {
    ...state,
    move: (direction) => dispatch({ type: 'move', direction }),
    reset: () => dispatch({ type: 'reset' }),
    setMode: (newRule) => dispatch({ type: 'setMode', rule: newRule }),
    setSize: (newSize) => dispatch({ type: 'setSize', size: newSize }),
  };
}
