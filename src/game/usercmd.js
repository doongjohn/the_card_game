class UserCommand {
  constructor() {
    this.saves = [];
  }

  save() {
    for (const arg of arguments) {
      this.saves.push(new arg());
    }
  }
  restoreAll() {
    for (const save of this.saves) {
      save.restore();
    }
  }

  cmd_execute() {
    UserAction.pushCommand(this);
    this.execute(...arguments);
  }
  cmd_undo() {
    UserAction.popCommand();
    UserAction.execute(CmdCancelAll);
    this.undo();
  }
  execute() { }
  undo() { }
}

class CmdCancelAll {
  static execute() {
    UserAction.setState(UserAction.StateEmpty);
    Board.setTileStateAll(TileStateNormal);
    CardInfoUI.hide();
  }
}

class CmdCancel {
  static execute() {
    if (UserAction.state != UserAction.StateEmpty)
      return;

    if (UserAction.state == UserAction.StateView) {
      CmdCancelAll.execute();
    } else {
      UserAction.setState(UserAction.StateView);
      for (const tile of Board.tiles)
        if (tile != Match.turnPlayer.selectedTile)
          tile.fsm.setState(TileStateNormal);
    }
  }
}

class CmdEndTurn extends UserCommand {
  execute() {
    // save data
    this.save(MatchData, UserActionData);

    // deselect all
    Match.turnPlayer.selectedCard = null;
    Match.turnPlayer.selectedTile = null;

    // cycle turn
    const newTurn = (Match.turn % 2) + 1;
    Match.turnPlayer = Match.players[newTurn - 1];
    Match.oppsPlayer = Match.players[Match.turn - 1];
    Match.turn = newTurn;

    // update stuffs
    Board.permanents.forEach(permanent => permanent?.resetOnTurnStart());
    Board.setTileStateAll(TileStateNormal);

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`;
    Match.turnPlayer.handUI.update();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();
  }
  undo() {
    // restore data
    this.restoreAll();

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`;
    Match.turnPlayer.handUI.update();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();
  }
}

class CmdUnitTap extends UserCommand {
  execute() {
    this.save(BoardPermanentData);

    const permanent = Match.turnPlayer.selectedTile.getPermanent();
    if (permanent)
      permanent.tapped() ? permanent.untap() : permanent.tap();
  }
  undo() {
    this.restoreAll();
  }
}

class CmdUnitPlanTeleport {
  static execute() {
    const permanent = Match.turnPlayer.selectedTile?.getPermanent();
    if (!permanent) return;

    // update user action state
    UserAction.setState(UserAction.StatePlanMove);

    // update tile state
    Board.tiles.forEach(tile => {
      if (!tile.fsm.curState.compare(TileStateSelected))
        tile.fsm.setState(tile.getPermanent() ? TileStateNoInteraction : TileStateChangePosSelection);
    });
  }
}
class CmdUnitTeleport extends UserCommand {
  execute(tile) {
    this.save(UserActionData, BoardPermanentData);

    // update user action state
    UserAction.setState(UserAction.StateView);

    // update selected tile
    Match.turnPlayer.selectedTile.getPermanent().setPos(tile.pos.x, tile.pos.y);
    Match.turnPlayer.selectedTile = tile;

    // update tile state
    Board.tiles.forEach(t => {
      if (t == Match.turnPlayer.selectedTile)
        t.fsm.setState(TileStateSelected);
      else
        t.fsm.setState(TileStateNormal);
    });
  }
  undo() {
    this.restoreAll();
    // Match.turnPlayer.selectedTile = null;
    // Board.setTileStateAll(TileStateNormal);
    // CardInfoUI.hide();
  }
}

// TODO: implement plan move
class CmdUnitMove extends UserCommand {
  execute(tile) {
    this.save(UserActionData, BoardPermanentData);

    // update match action state
    UserAction.setState(UserAction.StateView);

    // update selected tile
    Match.turnPlayer.selectedTile.getPermanent().moveTo(tile.pos.x, tile.pos.y);
    Match.turnPlayer.selectedTile = tile;

    // update tile state
    Board.tiles.forEach(t => {
      if (t == Match.turnPlayer.selectedTile)
        t.fsm.setState(TileStateSelected);
      else
        t.fsm.setState(TileStateNormal);
    });
  }
  undo() {
    this.restoreAll();
    // Match.turnPlayer.selectedTile = null;
    // Board.setTileStateAll(TileStateNormal);
    // CardInfoUI.hide();
  }
}

class CmdUnitPlanSpawn {
  static execute(card) {
    // update user action state
    UserAction.setState(UserAction.StatePlanPermanentSpawn);

    // update selected card
    Match.turnPlayer.selectedTile = null;
    Match.turnPlayer.selectedCard = card;
    CardInfoUI.updateInfo(card);
    CardInfoUI.show();

    // update tile state
    Board.tiles.forEach(tile => {
      const permanent = tile.getPermanent();
      permanent ? tile.fsm.setState(TileStateNoInteraction) : tile.fsm.setState(TileStateSpawnPermanentSelection);
    });
  }
}

class CmdUnitSpawn extends UserCommand {
  execute(tile) {
    this.save(PlayerData, BoardPermanentData);

    // update user action state
    UserAction.setState(UserAction.StateView);

    // spawn a selected permanent
    Board.spawnPermanentAt(tile.pos.x, tile.pos.y, Match.turnPlayer.selectedCard);

    // remove from hand
    Match.turnPlayer.handRemove(Match.turnPlayer.selectedCard);

    // update tile state
    for (const t of Board.tiles)
      if (!t.fsm.curState.compare(TileStateSelected))
        t.fsm.setState(TileStateNormal);
  }
  undo() {
    this.restoreAll();
  }
}

// TODO: implement move cmd
// TODO: implement attack cmd