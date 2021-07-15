class MatchStateData {
  constructor(cmd) {
    // push command
    UserAction.pushCommand(cmd);

    // save state
    this.matchData = new MatchData();
    this.userActionData = new UserActionData();
    this.playerData = new PlayerData();
    this.boardPermanentData = new BoardPermanentData();
    this.boardData = new BoardData();
    // TODO: save ui state
  }
  restore() {
    // pop command
    UserAction.popCommand();

    // restore state
    this.matchData.restore();
    this.userActionData.restore();
    this.playerData.restore();
    this.boardPermanentData.restore();
    this.boardData.restore();
    // TODO: restore ui state
  }
}

// TODO: make custom data saver

class CmdEndTurn {
  execute() {
    this.data = new MatchStateData(this);

    // deselect all
    Match.turnPlayer.selectedCard = null;
    Match.turnPlayer.selectedTile = null;

    // cycle turn
    Match.oppsPlayer = Match.turnPlayer;
    Match.turn = (Match.turn % 2) + 1;
    Match.turnPlayer = Match.players[Match.turn - 1];

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`;
    Match.turnPlayer.handUI.update();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();

    // untap permanents
    Board.permanents.forEach(permanent => permanent?.resetOnTurnStart());

    // reset tile state
    Board.setTileStateAll(TileStateNormal);
  }
  undo() {
    this.data.restore();

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`;
    Match.turnPlayer.handUI.update();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();
  }
}

class CmdUnitTap {
  execute() {
    this.data = new MatchStateData(this);

    const permanent = Match.turnPlayer.selectedTile.getPermanent();
    if (permanent)
      permanent.tapped() ? permanent.untap() : permanent.tap();
  }
  undo() {
    this.data.restore();
  }
}

class CmdUnitPlanTeleport {
  execute() {
    const permanent = Match.turnPlayer.selectedTile?.getPermanent();
    if (!permanent) return;

    // Unit Plan Move
    UserAction.setState(UserAction.StatePlanMove);

    // update tile state
    Board.tiles.forEach(tile => {
      if (!tile.fsm.curState.compare(TileStateSelected))
        tile.fsm.setState(tile.getPermanent() ? TileStateNoInteraction : TileStateChangePosSelection);
    });

    // TODO: split tile and permanent data
    this.data = new MatchStateData(this);
  }
  undo() {
    this.data.restore();
  }
}

class CmdUnitTeleport {
  execute() {
    this.data = new MatchStateData(this);
  }
  undo() {
    this.data.restore();
  }
}