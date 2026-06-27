# Merge Tiles

An original, educational take on the sliding-tile merge genre (the "2048" family),
built from scratch in React + Vite. Slide tiles, merge matching ones, watch the
numbers climb — but the **merge rule is swappable**, so the same engine teaches
different number sets and operations.

🎮 **Play:** [2048.ericbackman.com](https://2048.ericbackman.com)

## Modes — the whole point

Merge Tiles varies three independent axes, so one engine produces many games:

- **Operation** — how tiles combine: addition (Classic), multiplication, or Fibonacci adjacency
- **Seed** — where the number set starts: 2 (Classic), 3, 5, 7
- **Board size** — 4×4, 5×5, or 6×6

Adding a mode is a few lines of *data*, not code — see [`src/game/rules.js`](src/game/rules.js).

## Run it

```bash
npm install
npm run dev      # play at the printed localhost URL
npm test         # run the engine test suite (28 tests)
npm run build    # produce a static build in dist/
```

## Architecture

- `src/game/engine.js` — pure, tested game logic (slide, merge, spawn, win/lose).
  Tile-identity based: every tile keeps a stable `id`, so a single CSS `transform`
  transition animates slides with no animation JavaScript.
- `src/game/rules.js` — the swappable merge rules. The thesis of the project.
- `src/components/` — presentation only (`Board`, `Tile`).
- `src/hooks/useGame.js` — React state (`useReducer`) plus keyboard and swipe input.

## Credits & attribution

Merge Tiles is an **independent, original implementation** inspired by **2048**,
created by **[Gabriele Cirulli](https://github.com/gabrielecirulli/2048)** (2014,
MIT-licensed) — which was itself based on *1024* and *Threes!*.

No source code, art, or assets from the original were used. This project shares only
the genre's underlying game *mechanics*, which are not themselves copyrightable. The
name, the visual design (the "Nightfall" theme), the modes, and all code are original
to this project.

Merge Tiles is **not affiliated with, endorsed by, or connected to** Gabriele Cirulli
or the original 2048.

## License

[MIT](LICENSE) © 2026 Eric Backman
