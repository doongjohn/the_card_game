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

  static pushCommand(cmd) {
    UserAction.commands.push(cmd)
  }
  static popCommand() {
    UserAction.commands.pop()
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

class UserActionData {
  constructor() {
    this.prevCommand = UserAction.getLastCommand()
    this.state = UserAction.state
  }
  restore() {
    UserAction.state = this.state
  }
}

class UserInput {
  static init() {
    // init key bindings
    UserInput.keys = Game.scene.input.keyboard.addKeys({
      // cheat input
      undo: 'u',
      unitTap: 't',
      unitFaceToggle: 'f',
      unitTeleport: 'p',

      // game input
      confirm: 'enter',
      cancel: 'esc',
      endTurn: 'space',
      unitMove: 'm',
      unitAttack: 'a',
    })

    // cheat input
    UserInput.keys.undo.on('down', () => UserAction.undo())
    UserInput.keys.unitTap.on('down', () => UserAction.execute(CmdUnitTapToggle,
      Match.turnPlayer.selectedTile.getPermanent()))
    UserInput.keys.unitFaceToggle.on('down', () => UserAction.execute(CmdUnitFaceToggle,
      Match.turnPlayer.selectedTile.getPermanent()))
    UserInput.keys.unitTeleport.on('down', () => UserAction.execute(CmdUnitPlanTeleport))

    // game input
    UserInput.keys.cancel.on('down', () => UserAction.execute(CmdCancel))
    UserInput.keys.endTurn.on('down', () => UserAction.execute(CmdEndTurn))
    UserInput.keys.unitMove.on('down', () => UserAction.execute(CmdUnitPlanMove))
    UserInput.keys.unitAttack.on('down', () => UserAction.execute(CmdUnitPlanAttack))
  }
}