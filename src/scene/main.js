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

    // init commanders
    const commanderP1 = new CardPermanent(Team.P1, 'ZirAnSunforge');
    const commanderP2 = new CardPermanent(Team.P2, 'RagnoraTheRelentless');

    // init board
    Board.init();
    Board.spawnPermanent(commanderP1, 1, 3);
    Board.spawnPermanent(commanderP2, 9, 3);
  }

  // update(time, delta) {
  //   // runs every frame
  // }
}
