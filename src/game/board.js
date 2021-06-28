class Board {
  static size = new Phaser.Math.Vector2(11, 7);
  static gapSize = new Phaser.Math.Vector2(5, 5);
  static tileSize = new Phaser.Math.Vector2(100, 100);
  static cellSize = this.tileSize.clone().add(this.gapSize);

  static tiles = Array(Board.size.x * Board.size.y).fill(null);
  static permanents = Array(Board.size.x * Board.size.y).fill(null);

  static init() {
    const bg = Game.spawn.sprite(0, -100, 'BattleMap5').setScale(0.85);
    Layer.bg.add(bg);

    // spawn tiles
    const tileGroup = Game.spawn.group();
    for (let i in Board.tiles) {
      const tile = new Tile(i, Board.tileSize, Board.gapSize);
      tileGroup.add(tile.gameObject);
      Layer.board.add(tile.gameObject);
      Board.tiles[i] = tile;
    }

    // align tiles
    gridAlignCenterGameObject(Board.tiles, Board.size, Board.cellSize);

    // move tiles up
    for (const tile of Board.tiles)
      tile.gameObject.y -= 80;

    // return tile group
    return tileGroup;
  }

  static gridToWorldPos(x, y) {
    const tile = Board.getTileAt(x, y);
    return {
      x: tile.gameObject.x,
      y: tile.gameObject.y
    };
  }

  static occupied(x, y) {
    // TODO: check more cards. (spells, runes, etc)
    return Board.getPermanentAt(x, y);
  }

  static getTileAt(x, y) {
    const index = toIndex(x, y);
    if (index < 0 || index >= Board.size.x * Board.size.y)
      return null;
    return Board.tiles[index];
  }
  static setTileStateAll(state) {
    Board.tiles.forEach(tile => tile.fsm.setState(state));
  }

  static getPermanentAt(x, y) {
    const index = toIndex(x, y);
    if (index < 0 || index >= Board.size.x * Board.size.y)
      return null;
    return Board.permanents[index];
  }
  static spawnPermanent(team, assetName, x, y) {
    if (Board.occupied(x, y)) {
      console.log("you can't spawn there! (tile is occupied)");
      return null;
    }

    // create card
    const card = new CardPermanent(team, assetName);
    card.boardObj.setPos(x, y);
    card.boardObj.show();

    // update array
    Board.permanents[toIndex(x, y)] = card;
    Board.tiles[toIndex(x, y)].updateCards();

    return card;
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

  for (let item of items) {
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

  for (let item of items) {
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
