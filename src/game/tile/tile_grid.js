class TileGrid extends Grid {
  init() {
    // spawn stage background image
    const background = Game.spawn.sprite(0, -100, 'BattleMap1').setScale(0.85)
    Game.addToWorld(Layer.BG, background)

    // spawn tiles
    for (const i in this.tiles) {
      const tile = new Tile(i, this.tileSize, this.gap)
      Game.addToWorld(Layer.Board, tile)
      this.tiles[i] = tile
    }

    // align tiles
    GridUtil.alignCenter(this.tiles, this.size, this.cellSize, (tile, x, y) => {
      tile.gameObject.setPosition(x, y - 85)
    })
  }
  coordToWorldPos(x, y) {
    const tile = tileGrid.getTileAtCoord(x, y)
    return {
      x: tile.gameObject.x,
      y: tile.gameObject.y
    }
  }
  setStateAll(state) {
    for (const tile of tileGrid.tiles) {
      tile.fsm.setState(state)
    }
  }

  getNearbyStraight(pos) {
    let result = []
    for (let p of GridUtil.getCoordNearbyStraight(pos))
      this.coordToIndex(p) > 0 && (result.push(this.getTileAtCoord(p.x, p.y)))
    return result
  }
  getNearbyDiagonal(pos) {
    let result = []
    for (let p of GridUtil.getCoordNearbyDiagonal(pos))
      this.coordToIndex(p) > 0 && (result.push(this.getTileAtCoord(p.x, p.y)))
    return result
  }
  getNearby(pos) {
    let result = []
    for (let p of GridUtil.getCoordNearby(pos))
      this.coordToIndex(p) > 0 && (result.push(this.getTileAtCoord(p.x, p.y)))
    return result
  }
}

const tileGrid = new TileGrid({
  gap: 3,
  size: CardZoneBoard.size,
  tileSize: { x: 105, y: 105 }
})
