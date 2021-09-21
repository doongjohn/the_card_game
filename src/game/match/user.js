class UserAction {
  static StateEmpty = 0
  static StateView = 1
  static StatePlanMove = 2
  static StatePlanAttack = 3
  static StateCounterAttack = 4
  static StatePlanPermanentSpawn = 5
  static StateDeclarePermanentSpawn = 6
  static state = UserAction.StateEmpty
  static commands = []

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
  static pushCommand(cmd) {
    UserAction.commands.push(cmd)
  }
  static popCommand() {
    let undo = UserAction.commands.pop()
    console.log(`undo: ${undo.constructor.name}`) // TEST: show undo log
  }
  static getLastCommand() {
    return UserAction.commands[UserAction.commands.length - 1]
  }

  static execute() {
    const cmd = arguments[0]
    const args = [...arguments].slice(1)
    cmd.prototype instanceof UserCommand
      ? new cmd().cmd_execute(...args)
      : cmd.execute(...args)
  }
  static undo() {
    UserAction.getLastCommand()?.cmd_undo()
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
    UserInput.cheatKeys.undo.on('down', () =>
      UserAction.undo())
    UserInput.cheatKeys.unitTap.on('down', () =>
      UserAction.execute(CmdUnitTapToggle, Match.selectedTile.getPermanent()))
    UserInput.cheatKeys.unitFaceToggle.on('down', () =>
      UserAction.execute(CmdUnitFaceToggle, Match.selectedTile.getPermanent()))
    UserInput.cheatKeys.unitTeleport.on('down', () =>
      UserAction.execute(CmdUnitPlanTeleport))

    // game input
    UserInput.keys = Game.scene.input.keyboard.addKeys({
      confirm: 'enter',
      cancel: 'esc',
      endTurn: 'space',
      unitMove: 'm',
      unitAttack: 'a',
    })
    UserInput.keys.cancel.on('down', () =>
      UserAction.execute(CmdCancel))
    UserInput.keys.endTurn.on('down', () =>
      UserAction.execute(CmdEndTurn))
    UserInput.keys.unitMove.on('down', () =>
      UserAction.execute(CmdUnitPlanMove))
    UserInput.keys.unitAttack.on('down', () =>
      UserAction.execute(CmdUnitPlanAttack))
  }
}