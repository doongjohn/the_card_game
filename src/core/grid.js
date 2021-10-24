class GridUtil {
  static indexToCoord(index, length, width) {
    let pos = { x: -1, y: -1 }
    if (index < 0 || index >= length) {
      return pos
    }
    else {
      pos.y = Math.floor(index / width)
      pos.x = index - pos.y * width
      return pos
    }
  }
  static coordToIndex(x, y, width, height) {
    return x < 0 || y < 0 || x >= width || y >= height ? -1 : width * y + x
  }
  static alignCenter(items, gridSize, cellSize, iterFn) {
    const startX = (cellSize.x - cellSize.x * gridSize.x) / 2
    const startY = (cellSize.y - cellSize.y * gridSize.y) / 2

    let posX = startX, posY = startY
    let idxX = 0, idxY = 0

    for (const item of items) {
      if (!item) continue
      iterFn(item, posX, posY)

      if (idxX < gridSize.x - 1) {
        idxX += 1
        posX += cellSize.x
        continue
      }
      if (idxY < gridSize.y - 1) {
        idxX = 0
        posX = startX
        idxY += 1
        posY += cellSize.y
      }
    }
  }

  static getCoordNearbyStraight(pos) {
    return [
      { x: pos.x, y: pos.y - 1 },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x + 1, y: pos.y },
      { x: pos.x - 1, y: pos.y },
    ]
  }
  static getCoordNearbyDiagonal(pos) {
    return [
      { x: pos.x + 1, y: pos.y - 1 }, // right top
      { x: pos.x + 1, y: pos.y + 1 }, // right bot
      { x: pos.x - 1, y: pos.y - 1 }, // left top
      { x: pos.x - 1, y: pos.y + 1 }, // left bot
    ]
  }
  static getCoordNearby(pos) {
    return [
      ...GridUtil.getCoordNearbyStraight(pos),
      ...GridUtil.getCoordNearbyDiagonal(pos),
    ]
  }
}

class Grid {
  constructor({ gap, size, tileSize }) {
    this.gap = gap
    this.size = size
    this.tileSize = tileSize
    this.cellSize = {
      x: this.tileSize.x + gap,
      y: this.tileSize.y + gap
    }
    this.tiles = Array(this.size.x * this.size.y).fill(null)
  }

  indexToCoord(index) {
    return GridUtil.indexToCoord(index, this.tiles.length, this.size.x)
  }
  coordToIndex() {
    // args: x, y
    // args: { x: x, y: y }
    if (arguments.length == 1) {
      const pos = arguments[0]
      return GridUtil.coordToIndex(pos.x, pos.y, this.size.x, this.size.y)
    }
    if (arguments.length == 2) {
      const x = arguments[0]
      const y = arguments[1]
      return GridUtil.coordToIndex(x, y, this.size.x, this.size.y)
    }
    console.error('wrong arguments!')
  }

  /**
   * @callback iterTilesCallback
   * @param {number} index
   * @param {any} item
   */
  /**
   * @param {iterTilesCallback} fn
   */
  iterTiles(fn) {
    for (let i in this.tiles)
      fn(i, this.tiles[i])
  }

  /**
   * @param {number} index
   * @return {any} tile
   */
  getTileAtIndex(index) {
    return index < 0 || index >= this.tiles.length ? null : this.tiles[index]
  }

  /**
   * @param {number} x
   * @param {number} y
   * @return {any} tile
   */
  getTileAtCoord(x, y) {
    return this.getTileAtIndex(this.coordToIndex(x, y))
  }
}