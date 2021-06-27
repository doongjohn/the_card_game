class Grid {
  static size = new Phaser.Math.Vector2(11, 7);
  static gapSize = new Phaser.Math.Vector2(5, 5);
  static tileSize = new Phaser.Math.Vector2(100, 100);
  static cellSize = this.tileSize.clone().add(this.gapSize);

  static tiles = Array(Grid.size.x * Grid.size.y).fill(null);
  static permanents = Array(Grid.size.x * Grid.size.y).fill(null);

  static initBoard() {
    const bg = Game.spawn.sprite(0, -100, 'BattleMap5').setScale(0.85);
    Layer.bg.add(bg);

    // spawn tiles
    const tileGroup = Game.spawn.group();
    for (let i in Grid.tiles) {
      const tile = new Tile(i, Grid.tileSize, Grid.gapSize);
      tileGroup.add(tile.gameObject);
      Layer.board.add(tile.gameObject);
      Grid.tiles[i] = tile;
    }

    // align tiles
    gridAlignCenterGameObject(Grid.tiles, Grid.size, Grid.cellSize);

    // move tiles up
    for (const tile of Grid.tiles)
      tile.gameObject.y -= 80;

    // return tile group
    return tileGroup;
  }

  static setTileStateAll(state) {
    Grid.tiles.forEach(tile => tile.fsm.setState(state));
  }

  static gridToWorldPos(x, y) {
    const tile = Grid.getTileAt(x, y);
    return {
      x: tile.gameObject.x,
      y: tile.gameObject.y
    };
  }

  static getTileAt(x, y) {
    const index = toIndex(x, y);
    if (index < 0 || index >= Grid.size.x * Grid.size.y)
      return null;
    return Grid.tiles[index];
  }

  static spawnPermanent(team, assetName, x, y) {
    if (Grid.getPermanentAt(x, y)) {
      console.log('a permanent already exists there!');
      return null;
    }

    const card = new CardPermanent(team, assetName);
    card.objData.setPos(x, y);
    card.visual.showCardObj(card.objData);

    Grid.setPermanentAt(x, y, card);
    Grid.getTileAt(x, y).updateCards();
    return card;
  }
  static getPermanentAt(x, y) {
    const index = toIndex(x, y);
    if (index < 0 || index >= Grid.size.x * Grid.size.y)
      return null;
    return Grid.permanents[index];
  }
  static setPermanentAt(x, y, permanent) {
    Grid.permanents[toIndex(x, y)] = permanent;
  }
  static movePermanent(x, y, targetX, targetY) {
    const from = toIndex(x, y);
    const target = toIndex(targetX, targetY);
    Grid.permanents[target] = Grid.permanents[from];
    Grid.permanents[from] = null;
    Grid.tiles[from].updateCards();
    Grid.tiles[target].updateCards();
  }
  static removePermanentAt(x, y) {
    // check permanent
    const card = Grid.getPermanentAt(x, y);
    if (!card)
      return;

    // remove from board
    Grid.permanents[toIndex(x, y)] = null;
    Grid.getTileAt(x, y).updateCards();

    // destroy visual
    card.visual.destroy();
  }
};

function toCoord(i) {
  const result = new Phaser.Math.Vector2(-1, -1);
  result.y = Math.floor(i / Grid.size.x);
  result.x = i - result.y * Grid.size.x;
  return result;
}

function toIndex() {
  // TODO: update all calls
  if (arguments.length == 1) {
    const v = arguments[0];
    return (v.x < 0 || v.y < 0 || v.x >= Grid.size.x || v.y >= Grid.size.y)
      ? -1
      : Grid.size.x * v.y + v.x;
  } else if (arguments.length == 2) {
    const x = arguments[0];
    const y = arguments[1];
    return (x < 0 || y < 0 || x >= Grid.size.x || y >= Grid.size.y)
    ? -1
    : Grid.size.x * y + x;
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
