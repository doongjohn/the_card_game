class TileColor {
  static BG = { rgb: 0x000000, alpha: 0.1 };
  static FG = {
    rgb: 0x000000, alpha: 0,
    hover: {
      rgb: 0x000000, alpha: 0.2
    }
  };
}

class Tile {
  constructor(index, size, gapSize) {
    this.index = index;
    this.pos = toCoord(this.index);
    this.gameObject = this.initGameObject(size, gapSize);
    this.cards = {
      permanent: null,
      spell: null,
      land: null
    };
    
    this.fsm = new FSM(this, TileStateNormal);
    this.fsm.onStateChange = (obj) => {
      this.setHoverFunction(
        () => this.fsm.curState.onHoverEnter(obj),
        () => this.fsm.curState.onHoverExit(obj)
      );
    };

    this.tileFg.on('pointerdown', () => {
      this.fsm.curState.onClick(this);
    });
  }

  initGameObject(size, gapSize) {
    this.tileBg = Game.spawn.rectangle(
      0, 0,
      size.x,
      size.y,
      TileColor.BG.rgb
    );

    this.tileFg = Game.spawn.rectangle(
      0, 0,
      size.x + gapSize.x,
      size.y + gapSize.y,
      TileColor.FG.rgb,
      TileColor.FG.alpha
    ).setInteractive();

    return Game.spawn.container(0, 0, [
      this.tileBg,
      this.tileFg
    ]);
  }

  updateCards() {
    // TODO: add spell and rune
    this.cards.permanent = Grid.getPermanentAt(this.pos.x, this.pos.y);
  }

  removeHoverFunction() {
    this.tileFg.removeAllListeners('pointerover');
    this.tileFg.removeAllListeners('pointerout');
    Game.scene.input.removeAllListeners('gameout');
  }
  addHoverFunction(onHoverEnter, onHoverExit) {
    this.tileFg.on('pointerover', onHoverEnter);
    this.tileFg.on('pointerout', onHoverExit);
    Game.scene.input.on('gameout', onHoverExit);
  }
  setHoverFunction(onHoverEnter, onHoverExit) {
    this.removeHoverFunction();
    this.addHoverFunction(onHoverEnter, onHoverExit);
  }
};