class UserAction {
  static StateEmpty = 0;
  static StateView = 1;
  static StatePlanMove = 2;
  static StatePlanAttack = 3;
  static StateCounterAttack = 4;
  static StatePlanPermanentSpawn = 5;
  static state = UserAction.StateEmpty;
  static commands = [];

  static setState(state) {
    UserAction.state = state;
  }

  static pushCommand(cmd) {
    UserAction.commands.push(cmd);
  }
  static popCommand() {
    UserAction.commands.pop();
  }
  static getLastCommand() {
    return UserAction.commands[UserAction.commands.length - 1];
  }

  static execute() {
    const cmd = arguments[0];
    const args = [...arguments].slice(1);
    if (cmd.prototype instanceof UserCommand) {
      const inst = new cmd();
      if (arguments.length > 1)
        inst.cmd_execute(...args);
      else
        inst.cmd_execute();
      return inst;
    } else {
      if (arguments.length > 1)
        cmd.execute(...args);
      else
        cmd.execute();
      return null;
    }
  }
  static undo() {
    UserAction.getLastCommand()?.cmd_undo();
  }
}

class UserActionData {
  constructor() {
    this.prevCommand = UserAction.getLastCommand();
    this.state = UserAction.state;
  }
  restore() {
    UserAction.state = this.state;
  }
}

class UserInput {
  static init() {
    // init key bindings
    UserInput.keys = Game.scene.input.keyboard.addKeys({
      // cheat input
      undo: 'u',
      unitTap: 't',
      unitTeleport: 'p',

      // game input
      confirm: 'enter',
      cancel: 'esc',
      endTurn: 'space',
      unitMove: 'm',
      unitAttack: 'a',
    });

    // cheat input
    UserInput.keys.undo.on('down', () => UserAction.undo());
    UserInput.keys.unitTap.on('down', () => UserAction.execute(CmdUnitTap));
    UserInput.keys.unitTeleport.on('down', () => UserAction.execute(CmdUnitPlanTeleport));

    // game input
    UserInput.keys.cancel.on('down', () => UserAction.execute(CmdCancel));
    UserInput.keys.endTurn.on('down', () => UserAction.execute(CmdEndTurn));
    UserInput.keys.unitMove.on('down', MatchAction.onUnitMove);
    UserInput.keys.unitAttack.on('down', MatchAction.onUnitAttack);
  }
}