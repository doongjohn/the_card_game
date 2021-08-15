class Match {
  static turn = Team.P1;
  static player1 = new Player(Team.P1);
  static player2 = new Player(Team.P2);
  static players = [Match.player1, Match.player2];
  static turnPlayer = Match.player1;
  static oppsPlayer = Match.player2;

  // TODO: make a card manager
  static boardarea = [];
  static graveyard = [];

  static init() {
    // init input
    UserInput.init();

    // init commanders
    // TODO: track commanders hp and determine the game result
    Match.player1.commander = createCardPermanent(-1, Match.player1, 'ZirAnSunforge');
    Match.player2.commander = createCardPermanent(-1, Match.player2, 'RagnoraTheRelentless');

    // TEST: init players card
    Match.player1.cardInit();
    Match.player2.cardInit();

    // TEST: init players hand
    Match.player1.handInit();
    Match.player2.handInit();

    // TEST: test effect
    const onDealDamageEffectP1 = new Effect(
      EffectType.MandatoryTrigger,
      Match.turnPlayer.commander,
      (self, target) => console.log(`I hit "${target.data.name}"`)
    );
    EffectCallback.add('onDealDamage', onDealDamageEffectP1);

    // init ui
    CardInfoUI.init();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();

    // TEST: ui
    Game.spawn.text(10, 5,
      `[SPACE]: end turn
[P]: teleport
[T]: tap / untap
[M]: move
[A]: attack`, {
      color: '#000000',
      font: '20px consolas',
      align: 'left'
    });
    Game.spawn.rectangle(Game.center.x, 10, 200, 100, 0x000000);
    Match.turnText = Game.spawn.text(Game.center.x, 10, 'P1\'s turn', {
      color: '#ffffff',
      font: '32px Arial',
      align: 'center'
    }).setOrigin(0.5, 0);
  }
}

class MatchData {
  constructor() {
    this.turn = Match.turn;
    this.turnPlayer = Match.turnPlayer;
    this.oppsPlayer = Match.oppsPlayer;
  }
  restore() {
    Match.turn = this.turn;
    Match.turnPlayer = this.turnPlayer;
    Match.oppsPlayer = this.oppsPlayer;
  }
}