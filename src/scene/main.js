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

    // init layer
    Layer.init();
    
    // init match
    Match.init();

    // init board
    Grid.initBoard();
    Grid.spawnPermanent(Team.P1, 'ZirAnSunforge', 1, 3);
    Grid.spawnPermanent(Team.P2, 'RagnoraTheRelentless', 9, 3);
  }

  // update(time, delta) {
  //   // runs every frame
  // }
}
