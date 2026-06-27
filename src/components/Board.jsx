import Tile from './Tile.jsx';

// The board has two layers stacked in the same space:
//   1. 16 static background cells (the empty grid you always see).
//   2. The live tiles, absolutely positioned on top and keyed by id.
// Keying by id is what lets a tile keep its DOM node as it moves, so CSS can
// animate the slide instead of React tearing it down and rebuilding it.
export default function Board({ tiles, size }) {
  return (
    // --size drives the CSS grid template and the cell-size calc; the number of
    // background cells is size² so the empty grid always matches the board.
    <div className="board" style={{ '--size': size }}>
      {Array.from({ length: size * size }, (_, i) => (
        <div key={`bg-${i}`} className="cell-bg" />
      ))}
      {tiles.map((tile) => (
        <Tile key={tile.id} tile={tile} />
      ))}
    </div>
  );
}
