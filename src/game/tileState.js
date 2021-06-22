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
    obj.tileFg.setFillStyle(0xffbe0d, 0.25);

    if (obj.cards.permanent) {
      obj.cards.permanent.visual.showCard();
      obj.cards.permanent.visual.card.setPosition(-775, -190);
    }
  }
  onExit(obj) {
    if (obj.cards.permanent) {
      obj.cards.permanent.visual.hideCard();
    }
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
    Grid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal));
    Match.player.selectedTile = obj;
    Match.player.selectedTile.fsm.setState(TileStateSelected);
    MatchAction.setState(MatchAction.StateView);
  }
}

class TileStateSpawnPermanentSelection extends TileState {
  onEnter(obj) {
    obj.tileBg.setFillStyle(0x25c477, 0.4);
    obj.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha);
  }
  onExit(obj) {
    obj.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha);
  }
  onClick(obj) {
    const selectedCard = Match.player.selectedCard;
    Grid.spawnPermanent(
      Match.player.selectedCard.data.team,
      selectedCard.visual.cardArt.assetNameTrimmed,
      obj.pos.x,
      obj.pos.y
    );

    Grid.tiles.forEach(tile => {
      if (tile != selectedCard)
        tile.fsm.setState(TileStateNormal);
    });
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
    const permanent = Match.player.selectedTile.cards.permanent;
    permanent.changePos(obj.pos.x, obj.pos.y);
    permanent.visual.updateCardObj(permanent.objData);

    Match.player.selectedTile.updateCards();
    Match.player.selectedTile = obj;
    Match.player.selectedTile.updateCards();
    Grid.tiles.forEach(tile => {
      if (tile == Match.player.selectedTile) {
        tile.fsm.setState(TileStateSelected);
      } else {
        tile.fsm.setState(TileStateNormal);
      }
    });
    MatchAction.setState(MatchAction.StateView);
  }
}

class TileStateMoveSelection extends TileStateChangePosSelection {
  onClick(obj) {
    const permanent = Match.player.selectedTile.cards.permanent;
    permanent.moveTo(obj.pos.x, obj.pos.y);

    Match.player.selectedTile.updateCards();
    Match.player.selectedTile = obj;
    Match.player.selectedTile.updateCards();
    Grid.tiles.forEach(tile => {
      if (tile == Match.player.selectedTile) {
        tile.fsm.setState(TileStateSelected);
      } else {
        tile.fsm.setState(TileStateNormal);
      }
    });
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
    Match.player.selectedTile.cards.permanent.doAttack(obj.cards.permanent);
    Match.player.selectedTile.updateCards();
    obj.updateCards();

    Grid.tiles.forEach(tile => {
      if (tile != Match.player.selectedTile)
        tile.fsm.setState(TileStateNormal);
    });
    MatchAction.setState(MatchAction.StateView);
  }
}
