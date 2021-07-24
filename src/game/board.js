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
    // background image
    const bg = Game.spawn.sprite(0, -100, 'BattleMap5').setScale(0.85);
    Game.addToWorld(Layer.BG, bg);

    // spawn tiles
    for (const i in Board.tiles) {
      const tile = new Tile(i, Board.tileSize, Board.gapSize);
      Game.addToWorld(Layer.Board, tile.gameObject);
      Board.tiles[i] = tile;
    }

    // align tiles
    gridAlignCenterGameObject(Board.tiles, Board.size, Board.cellSize);
    Board.tiles.forEach(tile => tile.gameObject.y -= 80);

    // spawn commanders
    Board.spawnPermanentAt(1, 3, Match.turnPlayer.commander);
    Board.spawnPermanentAt(9, 3, Match.oppsPlayer.commander);
  }

  static gridToWorldPos(x, y) {
    // convert grid position to world position
    const tile = Board.getTileAt(x, y);
    return { x: tile.gameObject.x, y: tile.gameObject.y };
  }

  static occupied(x, y, arrays) {
    // check if a tile at x, y is occupied
    const index = toIndex(x, y);
    for (const array of arrays)
      if (array[index]) return true;
    return false;
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
    // returns a permanent at x, y
    const index = toIndex(x, y);
    return index < 0 || index >= Board.tiles.length ? null : Board.permanents[index];
  }
  static spawnPermanentAt(x, y, card) {
    // spawns a boardObj at x, y and returns a boardObj
    if (Board.occupied(x, y, [Board.permanents])) {
      console.log(`Can't spawn a permanent here! (tile:[${x}, ${y}] is already occupied)`);
      return null;
    } else {
      Board.permanents[toIndex(x, y)] = card;
      return card.spawnBoardObj(x, y);
    }
  }
  static movePermanentAt(x, y, newX, newY) {
    // moves a permanent to x, y
    const curPos = toIndex(x, y);
    const newPos = toIndex(newX, newY);
    Board.permanents[newPos] = Board.permanents[curPos];
    Board.permanents[curPos] = null;
  }
  static removePermanentAt(x, y) {
    // remove a permanent at x, y
    const card = Board.getPermanentAt(x, y);
    if (card) {
      Board.permanents[toIndex(x, y)] = null;
      card.boardObj.destroy();
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

class BoardTileStateData {
  // TODO: do I really need this?
  constructor() {
    this.tileStates = [];
    for (const tile of Board.tiles)
      this.tileStates.push(tile.fsm.curState);
  }
  restore() {
    for (const i in Board.tiles)
      Board.tiles[i].fsm.setStateProto(this.tileStates[i]);
  }
}

class BoardPermanentData {
  // in order to make this undo possible
  // I need to make boardObj spawn / remove logic for BoardPermanentData
  // and also save all boardobj stats (attack, health, etc)
  // this can get complex if I implement effects...
  constructor() {
    this.boardObjData = [];
    this.cardInfo = [];
    for (const permanent of Board.permanents) {
      if (!permanent) {
        this.boardObjData.push(null);
        this.cardInfo.push(null);
      } else {
        this.boardObjData.push(permanent.boardObj.data.deepCopy());
        this.cardInfo.push({ owner: permanent.cardOwner, index: permanent.cardIndex });
      }
    }
  }
  restore() {
    for (const i in Board.permanents) {
      const owner = this.cardInfo[i]?.owner;
      if (owner) {
        let permanent = owner && this.cardInfo[i].index != -1
          ? owner.allCards[this.cardInfo[i].index]
          : owner.commander;

        if (permanent?.boardObj) {
          const data = this.boardObjData[i];
          permanent.boardObj.data = data;
          data.tapped ? permanent.tap() : permanent.untap();
          permanent.setPos(data.pos.x, data.pos.y);
          Board.permanents[i] = permanent;
        } else {
          Board.permanents[i] = null;
        }

        // TODO: make me!
        if (Board.permanents[i]) {
          Board.removePermanentAt(toIndex(i));
          if (permanent?.boardObj) {
            Board.permanents[i] = permanent;
          }
        } else {

        }
      }
    }
  }
}