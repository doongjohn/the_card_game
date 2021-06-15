class TileState {
  onStateEnter(self) { }
  onStateExit(self) { }
  onHoverEnter(self) {
    self.tileFg.setFillStyle(TileColor.FG.hover.rgb, TileColor.FG.hover.alpha);
  }
  onHoverExit(self) {
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onClick(self) { }
}

class TileStateNoInteraction extends TileState {
  onStateEnter(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onHoverEnter(self) { }
  onHoverExit(self) { }
}

class TileStateSelected extends TileState {
  onStateEnter(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    self.tileFg.setFillStyle(0xffbe0d, 0.25);

    if (self.cards.permanent) {
      self.cards.permanent.visual.showCard();
      self.cards.permanent.visual.card.setPosition(-775, -190);
    }
  }
  onStateExit(self) {
    if (self.cards.permanent) {
      self.cards.permanent.visual.hideCard();
    }
  }
  onHoverEnter(self) { }
  onHoverExit(self) { }
}

class TileStateNormal extends TileState {
  onStateEnter(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onClick(self) {
    Grid.tiles.forEach(tile => tile.setState(TileStateNormal.prototype));
    Match.player.selectedTile = self;
    Match.player.selectedTile.setState(TileStateSelected.prototype);
  }
}

class TileStateSpawnPermanentSelection extends TileState {
  onStateEnter(self) {
    self.tileBg.setFillStyle(0x25c477, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onStateExit(self) {
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

    Grid.tiles.forEach(tile => tile.setState(TileStateNormal.prototype));
    Match.player.selectedTile.setState(TileStateSelected.prototype);
  }
}

class TileStateMoveSelection extends TileState {
  onStateEnter(self) {
    self.tileBg.setFillStyle(0x2b5dff, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onStateExit(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(self) {
    const permanent = Match.player.selectedTile.cards.permanent;
    permanent.moveTo(self.pos.x, self.pos.y);

    Grid.tiles.forEach(tile => tile.setState(TileStateNormal.prototype));
    Match.player.selectedTile.updateCards();
    Match.player.selectedTile = self;
    Match.player.selectedTile.updateCards();
    Match.player.selectedTile.setState(TileStateSelected.prototype);
  }
}

class TileStateAttackSelection extends TileState {
  onStateEnter(self) {
    self.tileBg.setFillStyle(0xff2b2b, 0.4);
    self.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onStateExit(self) {
    self.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(self) {
    const permanent = Match.player.selectedTile.cards.permanent;
    const target = self.cards.permanent;
    permanent.doDamage(target);
    Match.player.selectedTile.updateCards();
    self.updateCards();

    Grid.tiles.forEach(tile => tile.setState(TileStateNormal.prototype));
    Match.player.selectedTile.setState(TileStateSelected.prototype);
  }
}
