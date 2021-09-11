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
  execute() {
    // interface function
  }
  undo() {
    // interface function
  }
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
    if (UserAction.state == UserAction.StateEmpty)
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
    this.save(MatchData, UserActionData, BoardPermanentData);

    // deselect all
    Match.turnPlayer.selectedCard = null;
    Match.turnPlayer.selectedTile = null;

    // cycle turn
    const newTurn = (Match.turn % 2) + 1;
    Match.turnPlayer = Match.players[newTurn - 1];
    Match.oppsPlayer = Match.players[Match.turn - 1];
    Match.turn = newTurn;

    // update stuffs
    // TODO: refactor end of turn to action
    Board.permanents.forEach(card => card?.cardPiece.refresh());
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

// TODO: maybe rename Unit to Permanent?

class CmdUnitSetTeam extends UserAction {
  execute(card, team) {
    if (!card)
      return;

    this.save(BoardPermanentData);
    card.cardPiece.setTeam(team);
  }
  undo() {
    this.restoreAll();
  }
}

class CmdUnitTapToggle extends UserCommand {
  execute(card) {
    if (!card || card.cardPiece.faceDowned)
      return;

    this.save(BoardPermanentData);
    card.cardPiece.tap(!card.cardPiece.pieceData.tapped);
  }
  undo() {
    this.restoreAll();
  }
}
class CmdUnitTap extends UserCommand {
  execute(card) {
    if (!card || card.cardPiece.faceDowned)
      return;

    this.save(BoardPermanentData);
    card.cardPiece.tap(true);
  }
  undo() {
    this.restoreAll();
  }
}
class CmdUnitUntap extends UserCommand {
  execute(card) {
    if (!card || card.cardPiece.faceDowned)
      return;

    this.save(BoardPermanentData);
    card.cardPiece.tap(false);
  }
  undo() {
    this.restoreAll();
  }
}

class CmdUnitFaceToggle extends UserCommand {
  execute(card) {
    if (!card) return;

    this.save(BoardPermanentData);
    card.cardPiece.faceDown(!card.cardPiece.pieceData.faceDowned);
  }
  undo() {
    this.restoreAll();
  }
}
class CmdUnitFaceDown extends UserCommand {
  execute(card) {
    if (!card) return;

    this.save(BoardPermanentData);
    card.cardPiece.faceDown(true);
  }
  undo() {
    this.restoreAll();
  }
}
class CmdUnitFaceUp extends UserCommand {
  execute(card) {
    if (!card) return;

    this.save(BoardPermanentData);
    card.cardPiece.faceDown(false);
  }
  undo() {
    this.restoreAll();
  }
}

class CmdUnitRefresh extends UserCommand {
  execute(card) {
    if (!card) return;

    this.save(BoardPermanentData);
    card.cardPiece.refresh();
  }
  undo() {
    this.restoreAll();
  }
}

class CmdUnitPlanTeleport {
  static execute() {
    const card = Match.turnPlayer.selectedTile?.getPermanent();
    if (!card) return;

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
    Match.turnPlayer.selectedTile.getPermanent().cardPiece.setPos(tile.pos.x, tile.pos.y);
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
    const card = Match.turnPlayer.selectedTile?.getPermanent();
    if (!card) return;

    const tile = Match.turnPlayer.selectedTile;
    if (Match.turn != card.cardPiece.pieceData.owner.team
      || card.cardPiece.pieceData.tapped
      || !card.cardPiece.canMove())
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
    Match.turnPlayer.selectedTile.getPermanent().cardPiece.moveTo(tile.pos.x, tile.pos.y);
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
    const card = Match.turnPlayer.selectedTile?.getPermanent();
    if (!card) return;
    if (Match.turn != card.cardPiece.pieceData.owner.team || card.cardPiece.pieceData.tapped) return;

    const tile = Match.turnPlayer.selectedTile;

    // Unit Plan Attack
    UserAction.setState(UserAction.StatePlanAttack);

    function setAttackSelectionTile(x, y) {
      const target = Board.getPermanentAt(x, y);
      if (target && target.cardPiece.pieceData.owner.team != card.cardPiece.pieceData.owner.team) {
        Board.getTileAt(x, y).fsm.setState(TileStateAttackSelection);
        return 1;
      }
      return 0;
    }

    function getNearbyEnemyCount() {
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

    // check enemies nearby
    if (!getNearbyEnemyCount()) {
      console.log('[Match] There is no attack target nearby.');
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
    Match.turnPlayer.selectedTile.getPermanent().cardPiece.doAttack(tile.getPermanent().cardPiece);

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

class CmdUnitPlanSummon {
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
      tile.fsm.setState(
        tile.getPermanent() || !tile.canSummon
          ? TileStateNoInteraction
          : TileStateSpawnPermanentSelection
      );
    });
  }
}
class CmdUnitDeclareSummon {
  // TODO: impelement declare summon
  static execute(tile) {
    // update user action state
    UserAction.setState(UserAction.StateDeclarePermanentSpawn);

    // show declared card paper

    // occupy the selected tile

    // update tile state
    Board.setTileStateAll(TileStateNoInteraction);

    // show some kind of indicator at selected tile
    Match.turnPlayer.selectedTile = tile;
    tile.fsm.setState(TileStateSelected);
    tile.canSummon = false;

    // TODO: wait for the opponent respose
    // - if opponent cancels the summon: this card will return to hand and selected tile will be empty
    // - else: set the card on the selected tile
    UserAction.execute(CmdUnitSummon, tile);

    tile.canSummon = true;
  }
}
class CmdUnitSummon extends UserCommand {
  execute(tile) {
    this.save(PlayerData, BoardPermanentData);

    // update user action state
    UserAction.setState(UserAction.StateView);

    // summon a selected permanent
    Board.setPermanentAt(tile.pos.x, tile.pos.y, Match.turnPlayer.selectedCard);

    // remove from hand
    Match.turnPlayer.handRemove(Match.turnPlayer.selectedCard);

    // update tile state
    Board.setTileStateAll(TileStateNormal);

    // select this tile
    Match.turnPlayer.selectedTile = tile;
    tile.fsm.setState(TileStateSelected);
  }
  undo() {
    this.restoreAll();
  }
}