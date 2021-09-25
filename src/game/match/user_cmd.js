class UserCommand {
  constructor() {
    this.saves = []
  }
  save() {
    for (const arg of arguments)
      this.saves.push(new arg())
  }
  undoAll() {
    for (const save of this.saves)
      save.undo()
  }
  cmd_execute() {
    UserAction.pushCommand(this)
    this.execute(...arguments)
  }
  cmd_undo() {
    UserAction.popCommand()
    UserAction.execute(CmdCancelAll)
    this.undo()
  }
  execute() { /* interface function */ }
  undo() { /* interface function */ }
}

class CmdCancelAll {
  static execute() {
    UserAction.setState(UserAction.StateEmpty)
    Board.setTileStateAll(TileStateNormal)
    CardInfoUI.hide()
  }
}
class CmdCancel {
  static execute() {
    if (UserAction.state == UserAction.StateEmpty)
      return

    if (UserAction.state == UserAction.StateView) {
      CmdCancelAll.execute()
      return
    }

    for (const tile of Board.tiles)
      tile != Match.selectedTile && tile.fsm.setState(TileStateNormal)
    UserAction.cancelState()
  }
}

class CmdEndTurn extends UserCommand {
  execute() {
    // save data
    this.save(UndoMatch, UndoPlayer, UndoCardZoneBoard)

    // deselect all
    Match.selectedCard = null
    Match.selectedTile = null

    // cycle turn
    const newTurn = (Match.turn % 2) + 1
    Match.turnPlayer = Match.players[newTurn - 1]
    Match.oppsPlayer = Match.players[Match.turn - 1]
    Match.turn = newTurn

    // reset tile state
    Board.setTileStateAll(TileStateNormal)

    // untap cards
    CardZoneBoard.permanents.cards.forEach(card => card?.cardPiece.tap(false))

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`
    Match.turnPlayer.handUI.update()
    Match.turnPlayer.handUI.show()
    Match.oppsPlayer.handUI.hide()
  }
  undo() {
    // restore data
    this.undoAll()

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`
    Match.turnPlayer.handUI.update()
    Match.turnPlayer.handUI.show()
    Match.oppsPlayer.handUI.hide()
  }
}

class CmdUnitSetTeam extends UserAction {
  execute(card, team) {
    if (!card)
      return

    this.save(UndoCardZoneBoard)
    card.cardPiece.setTeam(team)
  }
  undo() {
    this.undoAll()
  }
}

class CmdUnitTapToggle extends UserCommand {
  execute(card) {
    if (!card || card.cardPiece.faceDowned)
      return

    this.save(UndoCardZoneBoard)
    card.cardPiece.tap(!card.cardPiece.pieceData.tapped)
  }
  undo() {
    this.undoAll()
  }
}
class CmdUnitTap extends UserCommand {
  execute(card) {
    if (!card || card.cardPiece.faceDowned)
      return

    this.save(UndoCardZoneBoard)
    card.cardPiece.tap(true)
  }
  undo() {
    this.undoAll()
  }
}
class CmdUnitUntap extends UserCommand {
  execute(card) {
    if (!card || card.cardPiece.faceDowned)
      return

    this.save(UndoCardZoneBoard)
    card.cardPiece.tap(false)
  }
  undo() {
    this.undoAll()
  }
}

class CmdUnitFaceToggle extends UserCommand {
  execute(card) {
    if (!card) return

    this.save(UndoCardZoneBoard)
    card.cardPiece.faceDown(!card.cardPiece.pieceData.faceDowned)
  }
  undo() {
    this.undoAll()
  }
}
class CmdUnitFaceDown extends UserCommand {
  execute(card) {
    if (!card) return

    this.save(UndoCardZoneBoard)
    card.cardPiece.faceDown(true)
  }
  undo() {
    this.undoAll()
  }
}
class CmdUnitFaceUp extends UserCommand {
  execute(card) {
    if (!card) return

    this.save(UndoCardZoneBoard)
    card.cardPiece.faceDown(false)
  }
  undo() {
    this.undoAll()
  }
}

class CmdUnitRevitalize extends UserCommand {
  execute(card) {
    if (!card) return

    this.save(UndoCardZoneBoard)
    card.cardPiece.revitalize()
  }
  undo() {
    this.undoAll()
  }
}

class CmdUnitPlanTeleport {
  static execute() {
    const card = Match.selectedTile?.getPermanent()
    if (!card) return

    // update user action state
    UserAction.setState(UserAction.StatePlanMove)

    // update tile state
    Board.tiles.forEach(tile => {
      if (!tile.fsm.curState.compare(TileStateSelected))
        tile.fsm.setState(tile.getPermanent() ? TileStateNoInteraction : TileStateChangePosSelection)
    })
  }
}
class CmdUnitTeleport extends UserCommand {
  execute(tile) {
    this.save(UndoCardZoneBoard)

    // update user action state
    UserAction.setState(UserAction.StateView)

    // update selected tile
    Match.selectedTile.getPermanent().cardPiece.setPos(tile.pos.x, tile.pos.y)
    Match.selectedTile = tile

    // update tile state
    Board.tiles.forEach(t => {
      if (t == Match.selectedTile)
        t.fsm.setState(TileStateSelected)
      else
        t.fsm.setState(TileStateNormal)
    })
  }
  undo() {
    this.undoAll()
  }
}

class CmdUnitPlanMove {
  static execute() {
    const card = Match.selectedTile?.getPermanent()
    if (!card || Match.turn != card.cardPiece.pieceData.owner.team) return

    if (card.cardPiece.pieceData.tapped || !card.cardPiece.canMove())
      return

    const tile = Match.selectedTile

    function setMoveSelectionTile(x, y) {
      if (!Board.getPermanentAt(x, y))
        Board.getTileAt(x, y)?.fsm.setState(TileStateMoveSelection)
    }

    const u = { x: tile.pos.x, y: tile.pos.y - 1 }
    const d = { x: tile.pos.x, y: tile.pos.y + 1 }
    const r = { x: tile.pos.x + 1, y: tile.pos.y }
    const l = { x: tile.pos.x - 1, y: tile.pos.y }
    const rBlocked = Board.getPermanentAt(r.x, r.y) != null
    const lBlocked = Board.getPermanentAt(l.x, l.y) != null
    const uBlocked = Board.getPermanentAt(u.x, u.y) != null
    const dBlocked = Board.getPermanentAt(d.x, d.y) != null

    if (!rBlocked) {
      setMoveSelectionTile(r.x, r.y)
      setMoveSelectionTile(r.x + 1, r.y)
    }
    if (!lBlocked) {
      setMoveSelectionTile(l.x, l.y)
      setMoveSelectionTile(l.x - 1, l.y)
    }
    if (!uBlocked) {
      setMoveSelectionTile(u.x, u.y)
      setMoveSelectionTile(u.x, u.y - 1)
    }
    if (!dBlocked) {
      setMoveSelectionTile(d.x, d.y)
      setMoveSelectionTile(d.x, d.y + 1)
    }

    ; (!rBlocked || !uBlocked) && setMoveSelectionTile(r.x, u.y)
      ; (!rBlocked || !dBlocked) && setMoveSelectionTile(r.x, d.y)
      ; (!lBlocked || !uBlocked) && setMoveSelectionTile(l.x, u.y)
      ; (!lBlocked || !dBlocked) && setMoveSelectionTile(l.x, d.y)

    // update user action
    UserAction.setState(UserAction.StatePlanMove)

    // update tile state
    Board.tiles.forEach((tile) => {
      if (!tile.fsm.curState.compare(TileStateSelected, TileStateMoveSelection))
        tile.fsm.setState(TileStateNoInteraction)
    })
  }
}
class CmdUnitMove extends UserCommand {
  execute(tile) {
    this.save(UndoCardZoneBoard)

    // update match action state
    UserAction.setState(UserAction.StateView)

    // update selected tile
    Match.selectedTile.getPermanent().cardPiece.moveTo(tile.pos.x, tile.pos.y)
    Match.selectedTile = tile

    // update tile state
    Board.tiles.forEach(t => {
      if (t == Match.selectedTile)
        t.fsm.setState(TileStateSelected)
      else
        t.fsm.setState(TileStateNormal)
    })
  }
  undo() {
    this.undoAll()
  }
}

class CmdUnitPlanAttack {
  static execute() {
    const card = Match.selectedTile?.getPermanent()
    if (!card) return

    if (Match.turn != card.cardPiece.pieceData.owner.team || card.cardPiece.pieceData.tapped)
      return

    const tile = Match.selectedTile

    // Unit Plan Attack
    UserAction.setState(UserAction.StatePlanAttack)

    function setAttackSelectionTile(x, y) {
      const target = Board.getPermanentAt(x, y)
      if (target && target.cardPiece.pieceData.owner.team != card.cardPiece.pieceData.owner.team) {
        Board.getTileAt(x, y).fsm.setState(TileStateAttackSelection)
        return 1
      }
      return 0
    }

    function getNearbyEnemyCount() {
      const u = { x: tile.pos.x, y: tile.pos.y - 1 }
      const d = { x: tile.pos.x, y: tile.pos.y + 1 }
      const r = { x: tile.pos.x + 1, y: tile.pos.y }
      const l = { x: tile.pos.x - 1, y: tile.pos.y }

      let count = 0
      count += setAttackSelectionTile(r.x, r.y)
      count += setAttackSelectionTile(l.x, l.y)
      count += setAttackSelectionTile(u.x, u.y)
      count += setAttackSelectionTile(d.x, d.y)
      count += setAttackSelectionTile(r.x, u.y)
      count += setAttackSelectionTile(r.x, d.y)
      count += setAttackSelectionTile(l.x, u.y)
      count += setAttackSelectionTile(l.x, d.y)
      return count
    }

    // check enemies nearby
    if (!getNearbyEnemyCount()) {
      console.log('[Match] There is no attack target nearby.')
      return
    }

    // update tile state
    Board.tiles.forEach((tile) => {
      if (!tile.fsm.curState.compare(TileStateSelected, TileStateAttackSelection))
        tile.fsm.setState(TileStateNoInteraction)
    })
  }
}
class CmdUnitAttack extends UserCommand {
  execute(target) {
    this.save(UndoPlayer, UndoCardZoneBoard)

    // update match action state
    UserAction.setState(UserAction.StateView)

    // update tile state
    Board.tiles.forEach(t => {
      if (!t.fsm.curState.compare(TileStateSelected))
        t.fsm.setState(TileStateNormal)
    })

    // attcak target permanent
    Match.selectedTile.getPermanent().cardPiece.doAttack(target.cardPiece)
  }
  undo() {
    this.undoAll()
  }
}
class CmdUnitCounterAttack extends UserCommand {
  execute(self, target) {
    this.save(UndoPlayer, UndoCardZoneBoard)

    // update match action state
    UserAction.setState(UserAction.StateView)

    // update tile state
    Board.tiles.forEach(t => {
      if (!t.fsm.curState.compare(TileStateSelected))
        t.fsm.setState(TileStateNormal)
    })

    // attcak target permanent
    self.cardPiece.doCounterAttack(target.cardPiece)
  }
  undo() {
    this.undoAll()
  }
}

class CmdUnitPlanSummon {
  static execute(card) {
    // update user action state
    UserAction.setState(UserAction.StatePlanPermanentSpawn)

    // update selected card
    Match.selectedTile = null
    Match.selectedCard = card
    CardInfoUI.updateInfo(card)
    CardInfoUI.show()

    // update tile state
    Board.tiles.forEach(tile => {
      tile.fsm.setState(
        tile.getPermanent() || !tile.canSummon
          ? TileStateNoInteraction
          : TileStateSpawnPermanentSelection
      )
    })
  }
}
class CmdUnitDeclareSummon {
  // TODO: impelement declare summon
  static execute(tile) {
    // update user action state
    UserAction.setState(UserAction.StateDeclarePermanentSpawn)

    // show declared card paper

    // occupy the selected tile

    // update tile state
    Board.setTileStateAll(TileStateNoInteraction)

    // show some kind of indicator at selected tile
    Match.selectedTile = tile
    tile.fsm.setState(TileStateSelected)
    tile.canSummon = false

    // TODO: wait for the opponent respose
    // - if opponent cancels the summon: this card will return to hand and selected tile will be empty
    // - else: set the card on the selected tile
    UserAction.execute(CmdUnitSummon, tile)

    tile.canSummon = true
  }
}
class CmdUnitSummon extends UserCommand {
  execute(tile) {
    this.save(UndoPlayer, UndoCardZoneBoard)

    // update user action state
    UserAction.setState(UserAction.StateView)

    // summon a selected permanent
    Board.setPermanentAt(tile.pos.x, tile.pos.y, Match.selectedCard)

    // remove from hand
    Match.turnPlayer.handRemove(Match.selectedCard)

    // update tile state
    Board.setTileStateAll(TileStateNormal)

    // select this tile
    Match.selectedTile = tile
    tile.fsm.setState(TileStateSelected)
  }
  undo() {
    this.undoAll()
  }
}