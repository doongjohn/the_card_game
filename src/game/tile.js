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
    // tile data
    this.index = index;
    this.pos = toCoord(this.index);
    this.gameObject = this.initGameObject(size, gapSize);
    this.cards = {
      permanent: null,
      spell: null,
      rune: null,
      land: null
    };

    // tile state
    this.fsm = new FSM(this, TileStateNormal, (obj) => {
      this.setHoverFunction(
        () => this.fsm.curState.onHoverEnter(obj),
        () => this.fsm.curState.onHoverExit(obj)
      );
    });

    // tile click event
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
    this.cards.permanent = Board.getPermanentAt(this.pos.x, this.pos.y);
    // TODO:
    // this.cards.spell = Board.getSpellAt(this.pos.x, this.pos.y);
    // this.cards.rune = Board.getRuneAt(this.pos.x, this.pos.y);
    // this.cards.land = Board.getLandAt(this.pos.x, this.pos.y);
  }

  setHoverFunction(onHoverEnter, onHoverExit) {
    // remove current event
    this.tileFg.removeAllListeners('pointerover');
    this.tileFg.removeAllListeners('pointerout');
    Game.scene.input.removeAllListeners('gameout');

    // set hover event
    this.tileFg.on('pointerover', onHoverEnter);
    this.tileFg.on('pointerout', onHoverExit);
    Game.scene.input.on('gameout', onHoverExit);
  }
};
