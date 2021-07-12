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
  static hoveringTile = null; // run onHoverEnter on state change

  constructor(index, size, gapSize) {
    this.gameObject = this.initGameObject(size, gapSize);
    this.index = index;
    this.pos = toCoord(index);
    this.fsm = new FSM(this, TileStateNormal, (obj) => {
      obj.setHoverEnter(() => {
        Tile.hoveringTile = obj;
        obj.fsm.curState.onHoverEnter(obj);
      });
      obj.setHoverExit(() => {
        Tile.hoveringTile = null;
        obj.fsm.curState.onHoverExit(obj);
      });
      if (Tile.hoveringTile == obj)
        Tile.hoveringTile.fsm.curState.onHoverEnter(obj);
    });

    // get cards
    this.getPermanent = () => Board.permanents[index];
    // this.getLand = () => Board.lands[index];
    // this.getSpell = () => Board.spells[index];
    // this.getRune = () => Board.runes[index];
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
    ).setInteractive().on('pointerdown', () => this.fsm.curState.onClick(this));

    return Game.spawn.container(0, 0, [this.tileBg, this.tileFg]);
  }

  setHoverEnter(func) {
    this.tileFg.removeAllListeners('pointerover');
    this.tileFg.on('pointerover', func);
  }
  setHoverExit(func) {
    this.tileFg.removeAllListeners('pointerout');
    this.tileFg.on('pointerout', func);
    Game.scene.input.removeAllListeners('gameout');
    Game.scene.input.on('gameout', func);
  }
};
