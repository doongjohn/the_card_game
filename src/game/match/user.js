class UserAction {
  static StateEmpty = 0
  static StateView = 1
  static StatePlanMove = 2
  static StatePlanAttack = 3
  static StateCounterAttack = 4
  static StatePlanPermanentSpawn = 5
  static StateDeclarePermanentSpawn = 6
  static state = UserAction.StateEmpty

  static setState(state) {
    UserAction.state = state
  }
  static cancelState() {
    if (UserAction.state == UserAction.StateEmpty)
      return
    if (UserAction.state == UserAction.StateView)
      UserAction.setState(UserAction.StateEmpty)
    else
      UserAction.setState(UserAction.StateView)
  }
}

class UserInput {
  static init() {
    // cheat input
    UserInput.cheatKeys = Game.scene.input.keyboard.addKeys({
      undo: 'u',
      unitTap: 't',
      unitFaceToggle: 'f',
      unitTeleport: 'p',
    })
    UserInput.cheatKeys.undo.on('down', () => MatchHist.undo())
    UserInput.cheatKeys.unitTap.on('down', () => Cmd.permanentTapToggle(Match.selectedTile?.getPermanent()))
    UserInput.cheatKeys.unitFaceToggle.on('down', () => Cmd.permanentFaceToggle(Match.selectedTile?.getPermanent()))
    UserInput.cheatKeys.unitTeleport.on('down', () => Cmd.permanentPlanTeleport(Match.selectedTile?.getPermanent()))

    // game input
    UserInput.keys = Game.scene.input.keyboard.addKeys({
      confirm: 'enter',
      cancel: 'esc',
      endTurn: 'space',
      unitMove: 'm',
      unitAttack: 'a',
    })
    UserInput.keys.cancel.on('down', () => Cmd.cancel())
    UserInput.keys.endTurn.on('down', () => Cmd.endTurn())
    UserInput.keys.unitMove.on('down', () => Cmd.permanentPlanMove(Match.selectedTile?.getPermanent()))
    UserInput.keys.unitAttack.on('down', () => Cmd.permanentPlanAttack(Match.selectedTile?.getPermanent()))
  }
}