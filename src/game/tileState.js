class TileState extends FSMState {
  onHoverEnter(obj) {
    obj.tileFg.setFillStyle(TileColor.FG.hover.rgb, TileColor.FG.hover.alpha);
  }
  onHoverExit(obj) {
    obj.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onClick(obj) { }
}

class TileStateNoInteraction extends TileState {
  onEnter(obj) {
    obj.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    obj.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onHoverEnter(obj) { }
  onHoverExit(obj) { }
}

class TileStateSelected extends TileState {
  onEnter(obj) {
    obj.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    obj.tileFg.setFillStyle(0xffbe0d, 0.25); // yellow fg color

    // show card on the screen
    if (obj.cards.permanent)
      obj.cards.permanent.visual.showCard().setPosition(-775, -190);
  }
  onExit(obj) {
    // hide card on the screen
    if (obj.cards.permanent)
      obj.cards.permanent.visual.hideCard();
  }
  onHoverEnter(obj) { }
  onHoverExit(obj) { }
}

class TileStateNormal extends TileState {
  onEnter(obj) {
    obj.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
    obj.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onClick(obj) {
    // update tile state
    Grid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));

    // select this tile
    Match.turnPlayer.selectedTile = obj;
    Match.turnPlayer.selectedTile.fsm.setState(TileStateSelected);

    // update match action state
    MatchAction.setState(MatchAction.StateView);
  }
}

class TileStateSpawnPermanentSelection extends TileState {
  onEnter(obj) {
    obj.tileBg.setFillStyle(0x259c51, 0.4);
    obj.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onClick(obj) {
    // spawn a selected permanent
    const selectedCard = Match.turnPlayer.selectedCard;
    Grid.spawnPermanent(
      selectedCard.data.team,
      selectedCard.visual.cardArt.assetNameTrimmed,
      obj.pos.x,
      obj.pos.y
    );

    // update tile state
    Grid.tiles.forEach(tile => {
      if (!tile.fsm.curState.compare(TileStateSelected))
        tile.fsm.setState(TileStateNormal);
    });

    // update match action state
    MatchAction.setState(MatchAction.StateView);
  }
}

class TileStateChangePosSelection extends TileState {
  onEnter(obj) {
    obj.tileBg.setFillStyle(0x2b5dff, 0.4);
    obj.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onExit(obj) {
    obj.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(obj) {
    // update selected tile
    Match.turnPlayer.selectedTile.cards.permanent.changePosTo(obj.pos.x, obj.pos.y);
    Match.turnPlayer.selectedTile = obj;
    
    // update tile state
    Grid.tiles.forEach(tile => {
      if (tile == Match.turnPlayer.selectedTile)
        tile.fsm.setState(TileStateSelected);
      else
        tile.fsm.setState(TileStateNormal);
    });

    // update match action state
    MatchAction.setState(MatchAction.StateView);
  }
}

class TileStateMoveSelection extends TileStateChangePosSelection {
  onClick(obj) {
    // update selected tile
    Match.turnPlayer.selectedTile.cards.permanent.moveTo(obj.pos.x, obj.pos.y);
    Match.turnPlayer.selectedTile = obj;

    // update tile state
    Grid.tiles.forEach(tile => {
      if (tile == Match.turnPlayer.selectedTile)
        tile.fsm.setState(TileStateSelected);
      else
        tile.fsm.setState(TileStateNormal);
    });

    // update match action state
    MatchAction.setState(MatchAction.StateView);
  }
}

class TileStateAttackSelection extends TileState {
  onEnter(obj) {
    obj.tileBg.setFillStyle(0xff2b2b, 0.4);
    obj.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onExit(obj) {
    obj.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(obj) {
    // attcak target permanent
    Match.turnPlayer.selectedTile.cards.permanent.doAttack(obj.cards.permanent);

    // update tile cards
    Match.turnPlayer.selectedTile.updateCards();
    obj.updateCards();

    // update tile state
    Grid.tiles.forEach(tile => {
      if (tile != Match.turnPlayer.selectedTile)
        tile.fsm.setState(TileStateNormal);
    });

    // update match action state
    MatchAction.setState(MatchAction.StateView);
  }
}
