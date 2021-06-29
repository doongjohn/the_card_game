class Board {
  static size = new Phaser.Math.Vector2(11, 7);
  static gapSize = new Phaser.Math.Vector2(5, 5);
  static tileSize = new Phaser.Math.Vector2(100, 100);
  static cellSize = this.tileSize.clone().add(this.gapSize);

  static tiles = Array(Board.size.x * Board.size.y).fill(null);
  static permanents = Array(Board.size.x * Board.size.y).fill(null);

  static init() {
    // spawn a background image
    const bg = Game.spawn.sprite(0, -100, 'BattleMap5').setScale(0.85);
    Layer.bg.add(bg);

    for (const i in Board.tiles) {
      // spawn a tile
      const tile = new Tile(i, Board.tileSize, Board.gapSize);
      
      // add to layer
      Layer.board.add(tile.gameObject);

      // update array
      Board.tiles[i] = tile;
    }

    // align tiles
    gridAlignCenterGameObject(Board.tiles, Board.size, Board.cellSize);

    // move tiles up
    for (const tile of Board.tiles)
      tile.gameObject.y -= 80;
  }

  static gridToWorldPos(x, y) {
    const tile = Board.getTileAt(x, y);
    return { x: tile.gameObject.x, y: tile.gameObject.y };
  }

  static occupied(x, y, arrays) {
    const index = toIndex(x, y);
    for (const array of arrays)
      if (array[index]) return true;
    return false;
  }

  static getTileAt(x, y) {
    const index = toIndex(x, y);
    return (index < 0 || index >= Board.size.x * Board.size.y) ? null : Board.tiles[index];
  }
  static setTileStateAll(state) {
    Board.tiles.forEach(tile => tile.fsm.setState(state));
  }

  static getPermanentAt(x, y) {
    const index = toIndex(x, y);
    return (index < 0 || index >= Board.size.x * Board.size.y) ? null : Board.permanents[index];
  }
  static spawnPermanent(card, x, y) {
    if (Board.occupied(x, y, [Board.permanents])) {
      console.log("Can't spawn a permanent here! (this tile is occupied)");
      return;
    }

    // spawn board obj
    card.spawnBoardObj(x, y);

    // update array
    Board.permanents[toIndex(x, y)] = card;
    Board.tiles[toIndex(x, y)].updateCards();
  }
  static movePermanent(x, y, targetX, targetY) {
    const from = toIndex(x, y);
    const target = toIndex(targetX, targetY);

    // swap permanent
    Board.permanents[target] = Board.permanents[from];
    Board.permanents[from] = null;
    
    // update tile
    Board.tiles[from].updateCards();
    Board.tiles[target].updateCards();
  }
  static removePermanentAt(x, y) {
    // check permanent
    const card = Board.getPermanentAt(x, y);
    if (!card) return;

    // remove from board
    Board.permanents[toIndex(x, y)] = null;
    Board.getTileAt(x, y).updateCards();

    // destroy visual
    card.boardObj.destroy();
  }
};

function toCoord(i) {
  const result = new Phaser.Math.Vector2(-1, -1);
  result.y = Math.floor(i / Board.size.x);
  result.x = i - result.y * Board.size.x;
  return result;
}
function toIndex() {
  if (arguments.length == 1) {
    const v = arguments[0];
    return (v.x < 0 || v.y < 0 || v.x >= Board.size.x || v.y >= Board.size.y)
      ? -1
      : Board.size.x * v.y + v.x;
  } else if (arguments.length == 2) {
    const x = arguments[0];
    const y = arguments[1];
    return (x < 0 || y < 0 || x >= Board.size.x || y >= Board.size.y)
    ? -1
    : Board.size.x * y + x;
  }
}

function gridAlignCenter(items, gridSize, cellSize) {
  const startX = (cellSize.x - cellSize.x * gridSize.x) * 0.5;
  const startY = (cellSize.y - cellSize.y * gridSize.y) * 0.5;
  let curX = startX;
  let curY = startY;
  let xIndex = 0;
  let yIndex = 0;

  for (const item of items) {
    if (item == null)
      continue;

    item.setPosition(curX, curY);
    if (xIndex < gridSize.x - 1) {
      xIndex += 1;
      curX += cellSize.x;
      continue;
    }

    if (yIndex < gridSize.y - 1) {
      xIndex = 0;
      yIndex += 1;
      curX = startX;
      curY += cellSize.y;
    }
  }
}
function gridAlignCenterGameObject(items, gridSize, cellSize) {
  const startX = (cellSize.x - cellSize.x * gridSize.x) * 0.5;
  const startY = (cellSize.y - cellSize.y * gridSize.y) * 0.5;
  let curX = startX;
  let curY = startY;
  let xIndex = 0;
  let yIndex = 0;

  for (const item of items) {
    if (item == null)
      continue;

    item.gameObject.setPosition(curX, curY);
    if (xIndex < gridSize.x - 1) {
      xIndex += 1;
      curX += cellSize.x;
      continue;
    }

    if (yIndex < gridSize.y - 1) {
      xIndex = 0;
      yIndex += 1;
      curX = startX;
      curY += cellSize.y;
    }
  }
}
