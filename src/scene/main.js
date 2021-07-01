class MainScene extends Phaser.Scene {
  init() {
    Game.init(this);
  }

  preload() {
    // load assets
    SpriteManager.BoardBG.load();
    SpriteManager.CardArt.load();
  }

  create() {
    // create animations
    SpriteManager.CardArt.createAnims();

    Layer.init();
    Match.init();
    Board.init();
  }

  // update(time, delta) {
  //   // runs every frame
  // }
}
