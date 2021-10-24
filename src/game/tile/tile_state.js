class TileState extends FSMState {
  onHoverEnter(tile) {
    tile.tileFg.setFillStyle(TileColor.FG.hover.rgb, TileColor.FG.hover.alpha)
  }
  onHoverExit(tile) {
    tile.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha)
  }
  onClick(tile) { }
}

class TileStateNoInteraction extends TileState {
  onStateEnter(tile) {
    tile.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha)
    tile.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha)
  }
  onHoverEnter(tile) { }
  onHoverExit(tile) { }
}

class TileStateSelected extends TileState {
  onStateEnter(tile) {
    tile.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha)
    tile.tileFg.setFillStyle(0xffbe0d, 0.25)

    const permanent = tile.getPermanent()
    if (permanent) {
      CardInfoUI.update(permanent)
      CardInfoUI.show()
    }
  }
  onStateExit(tile) {
    CardInfoUI.hide()
  }
  onHoverEnter(tile) { }
  onHoverExit(tile) { }
}

class TileStateNormal extends TileState {
  onStateEnter(tile) {
    tile.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha)
    tile.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha)
  }
  onClick(tile) {
    // update tile state
    tileGrid.tiles.forEach(tile => tile.fsm.setState(TileStateNormal))

    // select this tile
    Match.selectedTile = tile
    Match.selectedTile.fsm.setState(TileStateSelected)

    // update match action state
    UserAction.setState(UserAction.StateView)
  }
}

class TileStateSpawnPermanentSelection extends TileState {
  onStateEnter(tile) {
    tile.tileBg.setFillStyle(0x259c51, 0.4)
    tile.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha)

    // show card info
    CardInfoUI.update(Match.selectedCard)
    CardInfoUI.show()
  }
  onClick(tile) {
    Cmd.permanentDeclareSummon(tile)
  }
}

class TileStateChangePosSelection extends TileState {
  onStateEnter(tile) {
    tile.tileBg.setFillStyle(0x2b5dff, 0.4)
    tile.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha)
  }
  onStateExit(tile) {
    tile.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha)
  }
  onClick(tile) {
    Cmd.permanentTeleport(tile)
  }
}

class TileStateMoveSelection extends TileStateChangePosSelection {
  onClick(tile) {
    Cmd.permanentMove(tile)
  }
}

class TileStateAttackSelection extends TileState {
  onStateEnter(tile) {
    tile.tileBg.setFillStyle(0xff2b2b, 0.4)
    tile.tileFg.setFillStyle(TileColor.FG.rgb, TileColor.FG.alpha)
  }
  onStateExit(tile) {
    tile.tileBg.setFillStyle(TileColor.BG.rgb, TileColor.BG.alpha)
  }
  onClick(tile) {
    Cmd.permanentAttack(tile.getPermanent())
  }
}
