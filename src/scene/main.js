class MainScene extends Phaser.Scene {
  init() {
    Game.init(this)
  }

  preload() {
    SpriteManager.BoardBG.load()
    SpriteManager.CardBack.load()
    SpriteManager.CardArt.load()
  }

  create() {
    SpriteManager.CardArt.createAnims()
    Layer.init()

    Match.init()
    tileGrid.init()
    CardZoneBoard.init()
  }
}