class MainScene extends Phaser.Scene {
  init(data) {
    Game.init(this);
  }

  preload() {
    // load assets
    SpriteManager.BoardBG.load();
    SpriteManager.CardArt.load();
  }

  create(data) {
    // create animations
    SpriteManager.CardArt.createAnims();

    Match.init();

    const board = Grid.createBoard();
    const p1Commander = Grid.spawnPermanent(Team.P1, 'ZirAnSunforge', 1, 3);
    const p2Commander = Grid.spawnPermanent(Team.P2, 'RagnoraTheRelentless', 9, 3);
  }

  update(time, delta) {
    // runs every frame
  }
}
