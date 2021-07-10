class MainScene extends Phaser.Scene {
  init() {
    Game.init(this);
  }

  preload() {
    SpriteManager.BoardBG.load();
    SpriteManager.CardArt.load();
  }

  create() {
    SpriteManager.CardArt.createAnims();

    Layer.init();
    Match.init();
    Board.init();
  }

  // update(time, delta) {
  //   // runs every frame
  // }
}