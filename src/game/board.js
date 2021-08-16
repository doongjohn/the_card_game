class Board {
  // board settings
  static size = new Phaser.Math.Vector2(11, 7);
  static gapSize = new Phaser.Math.Vector2(5, 5);
  static tileSize = new Phaser.Math.Vector2(100, 100);
  static cellSize = this.tileSize.clone().add(this.gapSize);

  // board array
  static tiles = Array(Board.size.x * Board.size.y).fill(null);
  static permanents = Array(Board.size.x * Board.size.y).fill(null);

  static init() {
    // stage background image
    const stageBg = Game.spawn.sprite(0, -100, 'BattleMap5').setScale(0.85);
    Game.addToWorld(Layer.BG, stageBg);

    // spawn tiles
    for (const i in Board.tiles) {
      const tile = new Tile(i, Board.tileSize, Board.gapSize);
      Game.addToWorld(Layer.Board, tile);
      Board.tiles[i] = tile;
    }

    // align tiles
    gridAlignCenterGameObject(Board.tiles, Board.size, Board.cellSize);
    Board.tiles.forEach(tile => tile.gameObject.y -= 80);

    // set commanders
    Board.setPermanentAt(1, 3, Match.turnPlayer.commander);
    Board.setPermanentAt(9, 3, Match.oppsPlayer.commander);
  }

  static occupied(x, y, arrays) {
    // check if a tile at x, y is occupied
    const index = toIndex(x, y);
    for (const array of arrays)
      if (array[index]) return true;
    return false;
  }
  static gridToWorldPos(x, y) {
    // convert grid position to world position
    const tile = Board.getTileAt(x, y);
    return { x: tile.gameObject.x, y: tile.gameObject.y };
  }

  static getTileAt(x, y) {
    // returns a tile object at x, y
    const index = toIndex(x, y);
    return index < 0 || index >= Board.tiles.length ? null : Board.tiles[index];
  }
  static setTileStateAll(state) {
    // set every tile's state
    for (const tile of Board.tiles)
      tile.fsm.setState(state);
  }

  static getPermanentAt(x, y) {
    // returns the card at x, y
    const index = toIndex(x, y);
    return index < 0 || index >= Board.tiles.length ? null : Board.permanents[index];
  }
  static setPermanentAt(x, y, card) {
    // spawns a card piece at x, y
    if (Board.occupied(x, y, [Board.permanents])) {
      console.log(`Can't spawn a permanent here! (tile:[${x}, ${y}] is already occupied)`);
    } else {
      Board.permanents[toIndex(x, y)] = card;
      card.cardPiece.setPos(x, y);
      card.cardPiece.show();
    }
  }
  static movePermanentAt(x, y, newX, newY) {
    // moves a card piece to x, y
    const curPos = toIndex(x, y);
    const newPos = toIndex(newX, newY);
    Board.permanents[newPos] = Board.permanents[curPos];
    Board.permanents[curPos] = null;
  }
  static removePermanentAt(x, y) {
    // remove a card piece at x, y
    const card = Board.getPermanentAt(x, y);
    if (card) {
      Board.permanents[toIndex(x, y)] = null;
      card.cardPiece.pieceData.pos = null;
      card.cardPiece.hide();
    }
  }
};

function toCoord(index) {
  const result = { x: -1, y: -1 };
  result.y = Math.floor(index / Board.size.x);
  result.x = index - result.y * Board.size.x;
  return result;
}
function toIndex() {
  if (arguments.length == 1) {
    const v = arguments[0];
    return (v.x < 0 || v.y < 0 || v.x >= Board.size.x || v.y >= Board.size.y)
      ? -1
      : Board.size.x * v.y + v.x;
  }
  if (arguments.length == 2) {
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
    if (item == null) continue;

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

class BoardPermanentData {
  // I need to make boardObj spawn / remove logic for BoardPermanentData
  // and also save all boardobj stats (attack, health, etc)
  // this can get complex if I implement effects...
  constructor() {
    this.cardInfo = [];
    this.cardPieceData = [];
    for (const card of Board.permanents) {
      if (card) {
        this.cardInfo.push({ owner: card.owner, index: card.index });
        this.cardPieceData.push(card.cardPiece.pieceData.clone());
      } else {
        this.cardInfo.push(null);
        this.cardPieceData.push(null);
      }
    }
  }
  restore() {
    for (const i in Board.permanents) {
      const owner = this.cardInfo[i]?.owner;
      const pos = toCoord(i);
      if (!owner) {
        Board.removePermanentAt(pos.x, pos.y);
        continue;
      }

      const permanent = this.cardInfo[i].index == -1
        ? owner.commander
        : owner.allCards[this.cardInfo[i].index];

      if (!permanent?.boardObj)
        permanent.spawnBoardObj(pos.x, pos.y);

      // restore saved data
      const data = this.cardPieceData[i];
      permanent.boardObj.data = data;
      permanent.boardObj.setPos(pos.x, pos.y);
      data.tapped ? permanent.tap() : permanent.untap();

      Board.permanents[i] = permanent;
    }
  }
}