class Match {
  static player1 = null
  static player2 = null
  static players = []

  static turn = Team.P1
  static turnPlayer = null
  static oppsPlayer = null

  // TODO: multiple tiles and cards can be selected
  static selectedTile = null
  static selectedCard = null

  static init() {
    // init input
    UserInput.init()

    // init players
    Match.player1 = new Player(Team.P1)
    Match.player2 = new Player(Team.P2)
    Match.players = [Match.player1, Match.player2]
    Match.turnPlayer = Match.player1
    Match.oppsPlayer = Match.player2

    // init players cards
    Match.player1.cardInit()
    Match.player2.cardInit()
    Match.player1.handInit()
    Match.player2.handInit()

    // init ui
    CardInfoUI.init()
    Match.turnPlayer.handUI.show()


    // TEST: test effect 'onAttack'
    const onAttackEffectP1 = new Effect(
      EffectType.MandatoryTrigger,
      Match.player1.commander,
      function (target) {
        console.log(`I hit "${target.data.name}"!`)
      }
    )
    // TEST: test effect 'onTakeDamage'
    const onTakeDamageEffectP2 = new Effect(
      EffectType.MandatoryTrigger,
      Match.player2.commander,
      function (attacker) {
        console.log(`I took damage by "${attacker.data.name}"!`)
      }
    )
    EffectEvent.add('onAttack', onAttackEffectP1)
    EffectEvent.add('onTakeDamage', onTakeDamageEffectP2)


    // TEST: turn indicator
    Game.spawn.rectangle(Game.center.x, 25, 200, 50, 0x000000).setFillStyle(0x000000, 0.6)
    Match.turnText = Game.spawn.text(Game.center.x, 10, 'P1\'s turn', {
      color: '#ffffff',
      font: '30px Play',
      align: 'center'
    }).setOrigin(0.5, 0)

    // TEST: help text
    Game.spawn.text(10, 60,
      'SPACE : end turn\n' +
      'P     : teleport\n' +
      'T     : toggle tap\n' +
      'F     : toggle face-down\n' +
      'M     : move\n' +
      'A     : attack', {
      color: '#ffffff',
      font: '20px consolas',
      backgroundColor: '#00000099'
    }).setPadding(10, 10, 10, 10)
  }
}

class UndoMatch {
  constructor() {
    this.turn = Match.turn
    this.turnPlayer = Match.turnPlayer
    this.oppsPlayer = Match.oppsPlayer
  }
  undo() {
    Match.turn = this.turn
    Match.turnPlayer = this.turnPlayer
    Match.oppsPlayer = this.oppsPlayer
  }
}