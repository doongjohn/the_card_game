class Board {
  // board settings
  static size = new Phaser.Math.Vector2(11, 7);
  static gap = 3;
  static tileSize = new Phaser.Math.Vector2(105, 105);
  static cellSize = this.tileSize.clone().add({ x: Board.gap, y: Board.gap });

  // board array
  static tiles = Array(Board.size.x * Board.size.y).fill(null);
  static permanents = Array(Board.size.x * Board.size.y).fill(null);

  static init() {
    // spawn stage background image
    Game.addToWorld(Layer.BG, Game.spawn.sprite(0, -100, 'BattleMap5').setScale(0.85));

    // spawn tiles
    for (const i in Board.tiles) {
      const tile = new Tile(i, Board.tileSize, Board.gap);
      Game.addToWorld(Layer.Board, tile);
      Board.tiles[i] = tile;
    }

    // align tiles
    gridAlignCenter(Board.tiles, Board.size, Board.cellSize, (tile, x, y) => {
      tile.gameObject.setPosition(x, y);
    });
    Board.tiles.forEach(tile => tile.gameObject.y -= 85);

    // set commanders
    Board.setPermanentAt(1, 3, Match.player1.commander);
    Board.setPermanentAt(9, 3, Match.player2.commander);
  }

  static occupied(x, y, ...arrays) {
    // check if tiles at x, y in arrays are occupied
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
    // set every tiles state
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
    if (Board.occupied(x, y, Board.permanents)) {
      console.log(`Can't spawn a permanent here! (tile:[${x}, ${y}] is already occupied)`);
    } else {
      Board.permanents[toIndex(x, y)] = card;
      card.cardPiece.setPos(x, y);
      card.cardPiece.show();
    }
  }
  static movePermanentAt(x, y, newX, newY) {
    // moves a card piece to x, y
    let curPos = toIndex(x, y);
    let newPos = toIndex(newX, newY);
    Board.permanents[newPos] = Board.permanents[curPos];
    Board.permanents[curPos] = null;
  }
  static swapPermanentAt(x, y, x2, y2) {
    // swaps two cards piece at x, y, and x2, y2
    let curPos = toIndex(x, y);
    let newPos = toIndex(x2, y2);
    [Board.permanents[newPos], Board.permanents[curPos]] =
      [Board.permanents[curPos], Board.permanents[newPos]];
  }
  static removePermanentAt(x, y) {
    // remove a card piece at x, y
    let card = Board.getPermanentAt(x, y);
    if (card) {
      Board.permanents[toIndex(x, y)] = null;
      card.cardPiece.pieceData.pos = null;
      card.cardPiece.hide();
    }
  }
};

function toCoord(index) {
  let result = { x: -1, y: -1 };
  result.y = Math.floor(index / Board.size.x);
  result.x = index - result.y * Board.size.x;
  return result;
}

function toIndex() {
  // args: ({ x: x, y: y }) or (x, y)
  if (arguments.length == 1) {
    const pos = arguments[0];
    return (pos.x < 0 || pos.y < 0 || pos.x >= Board.size.x || pos.y >= Board.size.y)
      ? -1
      : Board.size.x * pos.y + pos.x;
  }
  if (arguments.length == 2) {
    const x = arguments[0];
    const y = arguments[1];
    return (x < 0 || y < 0 || x >= Board.size.x || y >= Board.size.y)
      ? -1
      : Board.size.x * y + x;
  }
}

function gridAlignCenter(items, gridSize, cellSize, setPosFn) {
  const
    startX = (cellSize.x - cellSize.x * gridSize.x) * 0.5,
    startY = (cellSize.y - cellSize.y * gridSize.y) * 0.5;

  let
    x = startX,
    y = startY,
    indexX = 0,
    indexY = 0;

  for (const item of items) {
    if (!item)
      continue;

    setPosFn(item, x, y);

    if (indexX < gridSize.x - 1) {
      indexX += 1;
      x += cellSize.x;
      continue;
    }

    if (indexY < gridSize.y - 1) {
      indexX = 0;
      indexY += 1;
      x = startX;
      y += cellSize.y;
    }
  }
}

class BoardPermanentData {
  // NOTE: this can get complex if I implement effects...
  // and maybe there is a better way of managing history...
  constructor() {
    this.cardData = [];
    this.cardPieceData = [];

    for (const card of Board.permanents) {
      if (!card) {
        this.cardData.push(null);
        this.cardPieceData.push(null);
        continue;
      }

      this.cardData.push({
        index: card.data.index,
        owner: card.data.owner
      });
      this.cardPieceData.push(card.cardPiece.pieceData.clone());
    }
  }
  restore() {
    for (const i in Board.permanents) {
      const owner = this.cardData[i]?.owner;
      const pos = toCoord(i);
      if (!owner) {
        Board.removePermanentAt(pos.x, pos.y);
        continue;
      }

      const index = this.cardData[i].index;
      const card = index == -1 ? owner.commander : owner.allCards[index];
      const data = this.cardPieceData[i];

      Board.removePermanentAt(pos.x, pos.y);
      Board.setPermanentAt(pos.x, pos.y, card);

      card.cardPiece.pieceData = data;
      card.cardPiece.tap(data.tapped);

      Board.permanents[i] = card;
    }
  }
}