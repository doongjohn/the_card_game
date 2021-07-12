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

  static getLastCommand() {
    return UserAction.commands[UserAction.commands.length - 1];
  }
  static pushCommand(cmd) {
    UserAction.commands.push(cmd);
  }
  static popCommand() {
    UserAction.commands.pop();
  }
  static undo() {
    UserAction.getLastCommand()?.undo();
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
    UserInput.keys = Game.scene.input.keyboard.addKeys({
      // test input
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

    UserInput.keys.undo.on('down', () => UserAction.undo());
    UserInput.keys.unitTap.on('down', MatchAction.onUnitTap);
    UserInput.keys.unitTeleport.on('down', () => new CmdUnitPlanTeleport().execute());

    UserInput.keys.cancel.on('down', () => new CmdCancel().execute());
    UserInput.keys.endTurn.on('down', () => new CmdEndTurn().execute());
    UserInput.keys.unitMove.on('down', MatchAction.onUnitMove);
    UserInput.keys.unitAttack.on('down', MatchAction.onUnitAttack);
  }
}