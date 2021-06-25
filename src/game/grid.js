class Grid {
  static size = new Phaser.Math.Vector2(11, 7);
  static gapSize = new Phaser.Math.Vector2(10, 10);
  static tileSize = new Phaser.Math.Vector2(100, 100);
  static cellSize = this.tileSize.clone().add(this.gapSize);

  static tiles = Array(Grid.size.x * Grid.size.y).fill(null);
  static permanents = Array(Grid.size.x * Grid.size.y).fill(null);

  static createBoard() {
    const bg = Game.spawn.sprite(0, -60, 'BattleMap5').setScale(0.85);
    Game.add(bg);

    // spawn tiles
    const tileGroup = Game.spawn.group();
    for (let i in Grid.tiles) {
      const tile = new Tile(i, Grid.tileSize, Grid.gapSize);
      tileGroup.add(tile.gameObject);
      Grid.tiles[i] = tile;
    }

    // align tiles
    gridAlignCenterGameObject(Grid.tiles, Grid.size, Grid.cellSize);
    Game.add(Grid.tiles);

    // move tiles up
    for (const tile of Grid.tiles)
      tile.gameObject.y -= 55;

    // return tile group
    return tileGroup;
  }

  static resetBoardState() {
    Grid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));
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
  static movePermanent(fromX, fromY, toX, toY) {
    const fromIndex = toIndex(fromX, fromY);
    Grid.permanents[toIndex(toX, toY)] = Grid.permanents[fromIndex];
    Grid.permanents[fromIndex] = null;
  }
  static removePermanentAt(x, y) {
    const card = Grid.getPermanentAt(x, y);
    if (!card) return;
    Grid.permanents[toIndex(x, y)] = null;
    Grid.getTileAt(x, y).updateCards();
    card.destroyCard();
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
