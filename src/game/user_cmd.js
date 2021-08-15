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
  }
}

class CmdUnitPlanMove {
  static execute() {
    const permanent = Match.turnPlayer.selectedTile?.getPermanent();
    if (!permanent) return;

    const tile = Match.turnPlayer.selectedTile;
    if (!permanent.isMyTurn() || permanent.tapped() || !permanent.canMove())
      return;

    // Unit Plan Move
    UserAction.setState(UserAction.StatePlanMove);

    function setMoveSelectionTile(x, y) {
      if (!Board.getPermanentAt(x, y))
        Board.getTileAt(x, y)?.fsm.setState(TileStateMoveSelection);
    }

    const u = { x: tile.pos.x, y: tile.pos.y - 1 };
    const d = { x: tile.pos.x, y: tile.pos.y + 1 };
    const r = { x: tile.pos.x + 1, y: tile.pos.y };
    const l = { x: tile.pos.x - 1, y: tile.pos.y };

    const blockedR = Board.getPermanentAt(r.x, r.y);
    const blockedL = Board.getPermanentAt(l.x, l.y);
    const blockedU = Board.getPermanentAt(u.x, u.y);
    const blockedD = Board.getPermanentAt(d.x, d.y);

    if (!blockedR) {
      setMoveSelectionTile(r.x, r.y);
      setMoveSelectionTile(r.x + 1, r.y);
    }
    if (!blockedL) {
      setMoveSelectionTile(l.x, l.y);
      setMoveSelectionTile(l.x - 1, l.y);
    }
    if (!blockedU) {
      setMoveSelectionTile(u.x, u.y);
      setMoveSelectionTile(u.x, u.y - 1);
    }
    if (!blockedD) {
      setMoveSelectionTile(d.x, d.y);
      setMoveSelectionTile(d.x, d.y + 1);
    }

    if (!blockedR || !blockedU) setMoveSelectionTile(r.x, u.y);
    if (!blockedR || !blockedD) setMoveSelectionTile(r.x, d.y);
    if (!blockedL || !blockedU) setMoveSelectionTile(l.x, u.y);
    if (!blockedL || !blockedD) setMoveSelectionTile(l.x, d.y);

    //  update tile state
    Board.tiles.forEach((tile) => {
      if (!tile.fsm.curState.compare(TileStateSelected, TileStateMoveSelection))
        tile.fsm.setState(TileStateNoInteraction);
    });
  }
}
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
  }
}

class CmdUnitPlanAttack {
  static execute() {
    const permanent = Match.turnPlayer.selectedTile?.getPermanent();
    if (!permanent) return;
    if (!permanent.isMyTurn() || permanent.tapped()) return;

    const tile = Match.turnPlayer.selectedTile;

    // Unit Plan Attack
    UserAction.setState(UserAction.StatePlanAttack);

    function setAttackSelectionTile(x, y) {
      const target = Board.getPermanentAt(x, y);
      if (target && target.data.team != permanent.data.team) {
        Board.getTileAt(x, y).fsm.setState(TileStateAttackSelection);
        return 1;
      }
      return 0;
    }

    function findNearByEnemy() {
      const u = { x: tile.pos.x, y: tile.pos.y - 1 };
      const d = { x: tile.pos.x, y: tile.pos.y + 1 };
      const r = { x: tile.pos.x + 1, y: tile.pos.y };
      const l = { x: tile.pos.x - 1, y: tile.pos.y };

      let count = 0;
      count += setAttackSelectionTile(r.x, r.y);
      count += setAttackSelectionTile(l.x, l.y);
      count += setAttackSelectionTile(u.x, u.y);
      count += setAttackSelectionTile(d.x, d.y);
      count += setAttackSelectionTile(r.x, u.y);
      count += setAttackSelectionTile(r.x, d.y);
      count += setAttackSelectionTile(l.x, u.y);
      count += setAttackSelectionTile(l.x, d.y);
      return count;
    }

    // check if there are no enemies near by
    if (!findNearByEnemy()) {
      console.log('[Match] No attack target found.');
      return;
    }

    // update tile state
    Board.tiles.forEach((tile) => {
      if (!tile.fsm.curState.compare(TileStateSelected, TileStateAttackSelection))
        tile.fsm.setState(TileStateNoInteraction);
    });
  }
}
class CmdUnitAttack extends UserCommand {
  execute(tile) {
    this.save(BoardPermanentData);

    // attcak target permanent
    Match.turnPlayer.selectedTile.getPermanent().doAttack(tile.getPermanent());

    // update tile state
    Board.tiles.forEach(t => {
      if (!t.fsm.curState.compare(TileStateSelected))
        t.fsm.setState(TileStateNormal);
    });

    // update match action state
    UserAction.setState(UserAction.StateView);
  }
  undo() {
    this.restoreAll();
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
    Board.setPermanentAt(tile.pos.x, tile.pos.y, Match.turnPlayer.selectedCard);

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