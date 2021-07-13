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
    Match.player1.commander = new CardPermanent(Team.P1, 'ZirAnSunforge', -1);
    Match.player2.commander = new CardPermanent(Team.P2, 'RagnoraTheRelentless', -1);

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
    EffectCallback.add("onDealDamage", onDealDamageEffectP1);

    // init ui
    CardInfoUI.init();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();

    // TEMP UI: help text
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
    // TEMP UI: turn text
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

// TODO: rafactor these functions to command pattern
class MatchAction {
  static onUnitMove() {
    const permanent = Match.turnPlayer.selectedTile?.getPermanent();
    if (!permanent) return;

    const tile = Match.turnPlayer.selectedTile;
    if (!permanent.isMyTurn() || permanent.tapped() || !permanent.canMove())
      return;

    // Unit Plan Move
    UserAction.setState(UserAction.StatePlanMove);

    function setMoveSelectionTile(x, y) {
      if (!Board.getPermanentAt(x, y))
        Board.getTileAt(x, y)?.fsm.setState(TileStateMoveSelection);
    }

    const u = { x: tile.pos.x, y: tile.pos.y - 1 };
    const d = { x: tile.pos.x, y: tile.pos.y + 1 };
    const r = { x: tile.pos.x + 1, y: tile.pos.y };
    const l = { x: tile.pos.x - 1, y: tile.pos.y };

    const blockedR = Board.getPermanentAt(r.x, r.y);
    const blockedL = Board.getPermanentAt(l.x, l.y);
    const blockedU = Board.getPermanentAt(u.x, u.y);
    const blockedD = Board.getPermanentAt(d.x, d.y);

    if (!blockedR) {
      setMoveSelectionTile(r.x, r.y);
      setMoveSelectionTile(r.x + 1, r.y);
    }
    if (!blockedL) {
      setMoveSelectionTile(l.x, l.y);
      setMoveSelectionTile(l.x - 1, l.y);
    }
    if (!blockedU) {
      setMoveSelectionTile(u.x, u.y);
      setMoveSelectionTile(u.x, u.y - 1);
    }
    if (!blockedD) {
      setMoveSelectionTile(d.x, d.y);
      setMoveSelectionTile(d.x, d.y + 1);
    }

    if (!blockedR || !blockedU) setMoveSelectionTile(r.x, u.y);
    if (!blockedR || !blockedD) setMoveSelectionTile(r.x, d.y);
    if (!blockedL || !blockedU) setMoveSelectionTile(l.x, u.y);
    if (!blockedL || !blockedD) setMoveSelectionTile(l.x, d.y);

    //  update tile state
    Board.tiles.forEach((tile) => {
      if (!tile.fsm.curState.compare(TileStateSelected, TileStateMoveSelection))
        tile.fsm.setState(TileStateNoInteraction);
    });
  }
  static onUnitAttack() {
    const permanent = Match.turnPlayer.selectedTile?.getPermanent();
    if (!permanent) return;
    if (!permanent.isMyTurn() || permanent.tapped()) return;

    const tile = Match.turnPlayer.selectedTile;

    // Unit Plan Attack
    UserAction.setState(UserAction.StatePlanAttack);

    function setAttackSelectionTile(x, y) {
      const target = Board.getPermanentAt(x, y);
      if (target && target.data.team != permanent.data.team) {
        Board.getTileAt(x, y).fsm.setState(TileStateAttackSelection);
        return 1;
      }
      return 0;
    }

    function findNearByEnemy() {
      const u = { x: tile.pos.x, y: tile.pos.y - 1 };
      const d = { x: tile.pos.x, y: tile.pos.y + 1 };
      const r = { x: tile.pos.x + 1, y: tile.pos.y };
      const l = { x: tile.pos.x - 1, y: tile.pos.y };

      let count = 0;
      count += setAttackSelectionTile(r.x, r.y);
      count += setAttackSelectionTile(l.x, l.y);
      count += setAttackSelectionTile(u.x, u.y);
      count += setAttackSelectionTile(d.x, d.y);
      count += setAttackSelectionTile(r.x, u.y);
      count += setAttackSelectionTile(r.x, d.y);
      count += setAttackSelectionTile(l.x, u.y);
      count += setAttackSelectionTile(l.x, d.y);
      return count;
    }

    // check if there are no enemies near by
    if (!findNearByEnemy()) {
      console.log("[Match] No attack target found.");
      return;
    }

    // update tile state
    Board.tiles.forEach((tile) => {
      if (!tile.fsm.curState.compare(TileStateSelected, TileStateAttackSelection))
        tile.fsm.setState(TileStateNoInteraction);
    });
  }
}