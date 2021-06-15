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

    if (self.cards.permanent) {
      self.cards.permanent.visual.showCard();
      self.cards.permanent.visual.card.setPosition(-775, -190);
    }
  }
  onExit(self) {
    if (self.cards.permanent) {
      self.cards.permanent.visual.hideCard();
    }
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
    Grid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));
    Match.player.selectedTile = self;
    Match.player.selectedTile.fsm.setState(TileStateSelected);
  }
}

class TileStateSpawnPermanentSelection extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(0x25c477, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onExit(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(self) {
    const selectedCard = Match.player.selectedCard;
    Grid.spawnPermanent(
      Match.player.selectedCard.data.team,
      selectedCard.visual.cardArt.assetNameTrimmed,
      self.pos.x,
      self.pos.y
    )

    Grid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));
    Match.player.selectedTile.fsm.setState(TileStateSelected);
  }
}

class TileStateMoveSelection extends TileState {
  onEnter(self) {
    self.tileBg.setFillStyle(0x2b5dff, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onExit(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(self) {
    const permanent = Match.player.selectedTile.cards.permanent;
    permanent.moveTo(self.pos.x, self.pos.y);

    Grid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));
    Match.player.selectedTile.updateCards();
    Match.player.selectedTile = self;
    Match.player.selectedTile.updateCards();
    Match.player.selectedTile.fsm.setState(TileStateSelected);
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
    const permanent = Match.player.selectedTile.cards.permanent;
    const target = self.cards.permanent;
    permanent.doDamage(target);
    Match.player.selectedTile.updateCards();
    self.updateCards();

    Grid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));
    Match.player.selectedTile.fsm.setState(TileStateSelected);
  }
}
