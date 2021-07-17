class TileState extends FSMState {
  onHoverEnter(self) {
    self.tileFg.setFillStyle(TileColor.FG.hover.rgb, TileColor.FG.hover.alpha);
  }
  onHoverExit(self) {
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onClick(self) { }
}

class TileStateNoInteraction extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onHoverEnter(self) { }
  onHoverExit(self) { }
}

class TileStateSelected extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    self.tileFg.setFillStyle(0xffbe0d, 0.25);

    const permanent = self.getPermanent();
    if (permanent) {
      CardInfoUI.updateInfo(permanent);
      CardInfoUI.show();
    }
  }
  onExit(self) {
    const permanent = self.getPermanent();
    if (permanent)
      CardInfoUI.hide();
  }
  onHoverEnter(self) { }
  onHoverExit(self) { }
}

class TileStateNormal extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onClick(self) {
    // update tile state
    Board.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));

    // select this tile
    Match.turnPlayer.selectedTile = self;
    Match.turnPlayer.selectedTile.fsm.setState(TileStateSelected);

    // update match action state
    UserAction.setState(UserAction.StateView);
  }
}

class TileStateSpawnPermanentSelection extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(0x259c51, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);

    // show card info
    CardInfoUI.updateInfo(Match.turnPlayer.selectedCard);
    CardInfoUI.show();
  }
  onExit(self) {
    // hide card info
    CardInfoUI.hide();
  }
  onClick(self) {
    UserAction.execute(CmdUnitSpawn, self);
  }
}

class TileStateChangePosSelection extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(0x2b5dff, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onExit(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(self) {
    UserAction.execute(CmdUnitTeleport, self);
  }
}

class TileStateMoveSelection extends TileStateChangePosSelection {
  onClick(self) {
    UserAction.execute(CmdUnitMove, self);
  }
}

class TileStateAttackSelection extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(0xff2b2b, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onExit(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(self) {
    // attcak target permanent
    Match.turnPlayer.selectedTile.getPermanent().doAttack(self.getPermanent());

    // update tile state
    Board.tiles.forEach(tile => {
      if (tile != Match.turnPlayer.selectedTile)
        tile.fsm.setState(TileStateNormal);
    });

    // update match action state
    UserAction.setState(UserAction.StateView);
  }
}
