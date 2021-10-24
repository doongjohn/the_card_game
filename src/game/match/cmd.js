class Cmd { }

Cmd.cancelAll = function () {
  UserAction.setState(UserAction.StateEmpty)
  tileGrid.setStateAll(TileStateNormal)
  CardInfoUI.hide()
}
Cmd.cancel = function () {
  if (UserAction.state == UserAction.StateEmpty)
    return

  if (UserAction.state == UserAction.StateView) {
    CmdCancelAll.execute()
    return
  }

  for (const tile of tileGrid.tiles)
    tile != Match.selectedTile && tile.fsm.setState(TileStateNormal)
  UserAction.cancelState()
}
Cmd.endTurn = function () {
  // save data
  MatchHist.push(HistMatch)
  MatchHist.push(HistPlayer)
  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  // deselect all
  Match.selectedCard = null
  Match.selectedTile = null

  // cycle turn
  const newTurn = (Match.turn % 2) + 1
  Match.turnPlayer = Match.players[newTurn - 1]
  Match.oppsPlayer = Match.players[Match.turn - 1]
  Match.turn = newTurn

  // TODO: refactor this (make game phases)
  Match.turnPlayer.handDrawFromDeck()

  // reset tile state
  tileGrid.setStateAll(TileStateNormal)

  // untap cards
  for (let card of CardZoneBoard.permanents.cards) {
    if (card && !card.cardPiece.faceDowned) {
      card.cardPiece.untap()
    }
  }

  // update ui
  Match.turnText.text = `P${Match.turn}'s turn`
  Match.turnPlayer.handUI.update()
  Match.turnPlayer.handUI.show()
  Match.oppsPlayer.handUI.hide()
}

Cmd.permanentSetTeam = function (card, team) {
  if (!card)
    return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.setTeam(team)
}

Cmd.permanentRevitalize = function (card) {
  if (!card) return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.revitalize()
}

Cmd.permanentTapToggle = function (card) {
  if (!card || card.cardPiece.faceDowned)
    return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.setTap(!card.cardPiece.pieceData.tapped)
}
Cmd.permanentTap = function (card) {
  if (!card || card.cardPiece.faceDowned)
    return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.setTap(true)
}
Cmd.permanentUntap = function (card) {
  if (!card || card.cardPiece.faceDowned)
    return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.setTap(false)
}

Cmd.permanentFaceToggle = function (card) {
  if (!card) return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.setFaceDown(!card.cardPiece.pieceData.faceDowned)
}
Cmd.permanentFaceDown = function (card) {
  if (!card) return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.tap()
  card.cardPiece.faceDown()
}
Cmd.permanentFaceUp = function (card) {
  if (!card) return

  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  card.cardPiece.faceUp()
}

Cmd.permanentPlanTeleport = function (card) {
  if (!card) return

  // update user action state
  UserAction.setState(UserAction.StatePlanMove)

  // update tile state
  for (let tile of tileGrid.tiles) {
    if (!tile.fsm.curState.is(TileStateSelected))
      tile.fsm.setState(tile.getPermanent() ? TileStateNoInteraction : TileStateChangePosSelection)
  }
}
Cmd.permanentTeleport = function (tile) {
  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  // update user action state
  UserAction.setState(UserAction.StateView)

  // update permanent
  let card = Match.selectedTile.getPermanent()
  CardZoneBoard.setPermanentPos(card, tile.pos.x, tile.pos.y)
  card.cardPiece.visualUpdatePos()

  // update selected tile
  Match.selectedTile = tile

  // update tile state
  for (let t of tileGrid.tiles) {
    if (t == Match.selectedTile)
      t.fsm.setState(TileStateSelected)
    else
      t.fsm.setState(TileStateNormal)
  }
}

Cmd.permanentPlanMove = function (card) {
  if (!card || !card.cardPiece.isActiveTurn() || !card.cardPiece.canMove())
    return

  const tile = Match.selectedTile

  function setMoveSelectionTile(x, y) {
    if (!CardZoneBoard.getPermanentAt(x, y))
      tileGrid.getTileAtCoord(x, y)?.fsm.setState(TileStateMoveSelection)
  }

  const u = { x: tile.pos.x, y: tile.pos.y - 1 }
  const d = { x: tile.pos.x, y: tile.pos.y + 1 }
  const r = { x: tile.pos.x + 1, y: tile.pos.y }
  const l = { x: tile.pos.x - 1, y: tile.pos.y }
  const rBlocked = CardZoneBoard.getPermanentAt(r.x, r.y) != null
  const lBlocked = CardZoneBoard.getPermanentAt(l.x, l.y) != null
  const uBlocked = CardZoneBoard.getPermanentAt(u.x, u.y) != null
  const dBlocked = CardZoneBoard.getPermanentAt(d.x, d.y) != null

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
  for (let tile of tileGrid.tiles) {
    if (!tile.fsm.curState.is(TileStateSelected, TileStateMoveSelection))
      tile.fsm.setState(TileStateNoInteraction)
  }
}
Cmd.permanentMove = function (tile) {
  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  // update match action state
  UserAction.setState(UserAction.StateView)

  // update permanent
  let card = Match.selectedTile.getPermanent()
  CardZoneBoard.setPermanentPos(card, tile.pos.x, tile.pos.y)
  card.cardPiece.moveTo(tile.pos.x, tile.pos.y)
  card.cardPiece.visualTweenPosTo(tile.pos.x, tile.pos.y)

  // update selected tile
  Match.selectedTile = tile

  // update tile state
  for (let t of tileGrid.tiles) {
    if (t == Match.selectedTile)
      t.fsm.setState(TileStateSelected)
    else
      t.fsm.setState(TileStateNormal)
  }
}

Cmd.permanentPlanAttack = function (card) {
  if (!card || !card.cardPiece.isActiveTurn() || !card.cardPiece.canAttack())
    return

  const tile = Match.selectedTile

  // Unit Plan Attack
  UserAction.setState(UserAction.StatePlanAttack)

  function setAttackSelectionTile(x, y) {
    const target = CardZoneBoard.getPermanentAt(x, y)
    if (target && target.cardPiece.pieceData.owner.team != card.cardPiece.pieceData.owner.team) {
      tileGrid.getTileAtCoord(x, y).fsm.setState(TileStateAttackSelection)
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
  for (let tile of tileGrid.tiles) {
    if (!tile.fsm.curState.is(TileStateSelected, TileStateAttackSelection))
      tile.fsm.setState(TileStateNoInteraction)
  }
}
Cmd.permanentAttack = function (target) {
  MatchHist.push(HistPlayer)
  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  // update match action state
  UserAction.setState(UserAction.StateView)

  // update tile state
  for (let t of tileGrid.tiles) {
    if (!t.fsm.curState.is(TileStateSelected))
      t.fsm.setState(TileStateNormal)
  }

  // attcak target permanent
  Match.selectedTile.getPermanent().cardPiece.doAttack(target.cardPiece)
}
Cmd.permanentCounterAttack = function (self, target) {
  MatchHist.push(HistPlayer)
  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  // update match action state
  UserAction.setState(UserAction.StateView)

  // update tile state
  for (let t of tileGrid.tiles) {
    if (!t.fsm.curState.is(TileStateSelected))
      t.fsm.setState(TileStateNormal)
  }

  // attcak target permanent
  self.cardPiece.doCounterAttack(target.cardPiece)
}

Cmd.permanentPlanSummon = function (card) {
  // update user action state
  UserAction.setState(UserAction.StatePlanPermanentSpawn)

  // update selected card
  Match.selectedTile = null
  Match.selectedCard = card
  CardInfoUI.update(card)
  CardInfoUI.show()

  // update tile state
  for (let tile of tileGrid.tiles) {
    tile.fsm.setState(
      tile.getPermanent() || !tile.allowSummon
        ? TileStateNoInteraction
        : TileStateSpawnPermanentSelection
    )
  }
}
Cmd.permanentDeclareSummon = function (tile) {
  // update user action state
  UserAction.setState(UserAction.StateDeclarePermanentSpawn)

  // show declared card paper

  // occupy the selected tile
  tile.allowSummon = false

  // update tile state
  tileGrid.setStateAll(TileStateNoInteraction)

  // show some kind of indicator at selected tile
  Match.selectedTile = tile
  tile.fsm.setState(TileStateSelected)

  // TODO: wait for the opponent respose
  // - if opponent cancels the summon: this card will return to hand and selected tile will be empty
  // - else: set the card on the selected tile
  Cmd.permanentSummon(tile)

  tile.allowSummon = true
}
Cmd.permanentSummon = function (tile) {
  MatchHist.push(HistPlayer)
  MatchHist.push(HistCardZoneBoard)
  MatchHist.save()

  // update user action state
  UserAction.setState(UserAction.StateView)

  // move card from hand to board
  Match.turnPlayer.handSummon(tile.pos.x, tile.pos.y, Match.selectedCard)

  // update tile state
  tileGrid.setStateAll(TileStateNormal)

  // select this tile
  Match.selectedTile = tile
  Match.selectedTile.fsm.setState(TileStateSelected)
}