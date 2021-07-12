// TODO: implement command pattern
class MatchStateData {
  constructor(cmd) {
    UserAction.pushCommand(cmd);
    this.matchData = new MatchData();
    this.userActionData = new UserActionData();
    this.playerData = new PlayerData();
    this.boardData = new BoardData();
    // TODO: save ui state
  }
  restore() {
    UserAction.popCommand();
    this.matchData.restore();
    this.userActionData.restore();
    this.playerData.restore();
    this.boardData.restore();
    // TODO: restore ui state
  }
}

class CmdCancel {
  execute() {
    if (UserAction.state == UserAction.StateEmpty)
      return;

    this.data = new MatchStateData(this);
    if (UserAction.state == UserAction.StateView) {
      Board.tiles.forEach(tile => { tile.fsm.setState(TileStateNormal); });
      UserAction.setState(UserAction.StateEmpty);
    } else {
      Board.tiles.forEach(tile => { if (tile != Match.turnPlayer.selectedTile) tile.fsm.setState(TileStateNormal) });
      UserAction.setState(UserAction.StateView);
    }
  }
  undo() {
    this.data.restore();
  }
}

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

class CmdUnitPlanTeleport {
  execute() {
    const permanent = Match.turnPlayer.selectedTile?.getPermanent();
    if (!permanent) return;

    this.data = new MatchStateData(this);

    // Unit Plan Move
    UserAction.setState(UserAction.StatePlanMove);

    // update tile state
    Board.tiles.forEach(tile => {
      if (!tile.fsm.curState.compare(TileStateSelected))
        tile.fsm.setState(tile.getPermanent() ? TileStateNoInteraction : TileStateChangePosSelection);
    });
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