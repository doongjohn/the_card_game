// boardGrid only contains tiles
// it does not contains permanents, spells, etc..
// those are managed by CardZoneBoard

const tileGrid = new Grid({
  gap: 3,
  size: { x: 11, y: 7 },
  tileSize: { x: 105, y: 105 }
})

tileGrid.init = function () {
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

tileGrid.coordToWorldPos = function (x, y) {
  const tile = tileGrid.getTileAtCoord(x, y)
  return {
    x: tile.gameObject.x,
    y: tile.gameObject.y
  }
}

tileGrid.setStateAll = function (state) {
  for (const tile of tileGrid.tiles)
    tile.fsm.setState(state)
}