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
    MatchInput.init();
    MatchAction.init();

    // init commanders
    Match.player1.commander = new CardPermanent(Team.P1, 'ZirAnSunforge');
    Match.player2.commander = new CardPermanent(Team.P2, 'RagnoraTheRelentless');

    // init card info ui
    CardInfoUI.init();

    // TEST: init players hand
    Match.player1.initHand();
    Match.player2.initHand();
    Match.oppsPlayer.handUI.hide();

    // TEST: test effect
    const onDealDamageEffectP1 = new Effect(
      EffectType.MandatoryTrigger,
      Match.turnPlayer.commander,
      (self, target) => console.log(`I hit "${target.data.name}"`)
    );
    EffectCallback.add("onDealDamage", onDealDamageEffectP1);

    // TEMP: help text
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

    // TEMP: turn text
    Game.spawn.rectangle(Game.center.x, 10, 200, 100, 0x000000);
    Match.turnText = Game.spawn.text(Game.center.x, 10, 'P1\'s turn', {
      color: '#ffffff',
      font: '32px Arial',
      align: 'center'
    }).setOrigin(0.5, 0);
  }

  static isThisTurn(permanent) {
    return permanent.data.team == Match.turn;
  }

  static nextTurn() {
    // deselect all
    Match.turnPlayer.selectedCard = null;
    Match.turnPlayer.selectedTile = null;

    // cycle turn
    Match.oppsPlayer = Match.turnPlayer;
    Match.turn = (Match.turn % 2) + 1;
    Match.turnPlayer = Match.players[Match.turn - 1];

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`;
    Match.turnPlayer.handUI.update();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();

    // untap permanents
    Board.permanents.forEach(permanent => permanent?.resetOnTurnStart());

    // reset tile state
    Board.setTileStateAll(TileStateNormal);
  }
}

class MatchInput {
  static keys = null;

  static init() {
    MatchInput.keys = Game.scene.input.keyboard.addKeys({
      cancel: 'esc',
      confirm: 'enter',

      // test command
      unitTeleport: 'p',
      unitTap: 't',

      // game command
      endTurn: 'space',
      unitMove: 'm',
      unitAttack: 'a',
    });
  }
}

class MatchAction {
  static StateEmpty = 0;
  static StateView = 1;
  static StatePlanMove = 2;
  static StatePlanAttack = 3;
  static StateCounterAttack = 4;
  static StatePlanPermanentSpawn = 5;
  static state = MatchAction.StateEmpty;

  static init() {
    MatchInput.keys.cancel.on('down', () => {
      // cancel current match action state
      MatchAction.cancleState();
    });
    MatchInput.keys.confirm.on('down', () => {
      // TODO: maybe this key is unnecessary?
      console.log('enter key pressed!');
    });
    MatchInput.keys.endTurn.on('down', () => {
      // continue to next turn
      Match.nextTurn();
    });
    MatchInput.keys.unitTeleport.on('down', MatchAction.onUnitTeleport);
    MatchInput.keys.unitTap.on('down', MatchAction.onUnitTap);
    MatchInput.keys.unitMove.on('down', MatchAction.onUnitMove);
    MatchInput.keys.unitAttack.on('down', MatchAction.onUnitAttack);
  }

  static setState(state) {
    MatchAction.state = state;
  }
  static cancleState() {
    if (MatchAction.state == MatchAction.StateEmpty)
      return;

    if (MatchAction.state == MatchAction.StateView) {
      Board.tiles.forEach(tile => { tile.fsm.setState(TileStateNormal); });
      MatchAction.setState(MatchAction.StateEmpty);
    } else {
      Board.tiles.forEach(tile => {
        if (tile != Match.turnPlayer.selectedTile)
          tile.fsm.setState(TileStateNormal);
      });
      MatchAction.setState(MatchAction.StateView);
    }
  }

  static onUnitTeleport() {
    if (!Match.turnPlayer.selectedTile || !Match.turnPlayer.selectedTile.cards.permanent)
      return;

    // Unit Plan Move
    MatchAction.setState(MatchAction.StatePlanMove);

    // update tile state
    Board.tiles.forEach(tile => {
      if (tile.fsm.curState.compare(TileStateSelected))
        return;

      if (tile.cards.permanent)
        tile.fsm.setState(TileStateNoInteraction);
      else
        tile.fsm.setState(TileStateChangePosSelection);
    });
  }
  static onUnitTap() {
    if (!Match.turnPlayer.selectedTile.cards.permanent)
      return;

    const permanent = Match.turnPlayer.selectedTile.cards.permanent;
    if (permanent.tapped())
      permanent.untap();
    else
      permanent.tap();
  }
  static onUnitMove() {
    if (!Match.turnPlayer.selectedTile || !Match.turnPlayer.selectedTile.cards.permanent)
      return;

    const selected = Match.turnPlayer.selectedTile;
    if (!Match.isThisTurn(selected.cards.permanent)
      || selected.cards.permanent.tapped()
      || !selected.cards.permanent.canMove())
      return;

    // Unit Plan Move
    MatchAction.setState(MatchAction.StatePlanMove);

    function setMoveSelectionTile(x, y) {
      if (!Board.getPermanentAt(x, y))
        Board.getTileAt(x, y)?.fsm.setState(TileStateMoveSelection);
    }

    const u = { x: selected.pos.x, y: selected.pos.y - 1 };
    const d = { x: selected.pos.x, y: selected.pos.y + 1 };
    const r = { x: selected.pos.x + 1, y: selected.pos.y };
    const l = { x: selected.pos.x - 1, y: selected.pos.y };

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
    if (!Match.turnPlayer.selectedTile)
      return;

    const selectedTile = Match.turnPlayer.selectedTile;

    if (!selectedTile.cards.permanent || !Match.isThisTurn(selectedTile.cards.permanent))
      return;
    if (selectedTile.cards.permanent.tapped())
      return;

    // Unit Plan Attack
    MatchAction.setState(MatchAction.StatePlanAttack);

    function setAttackSelectionTile(x, y) {
      const target = Board.getPermanentAt(x, y);
      if (target && target.data.team != selectedTile.cards.permanent.data.team) {
        Board.getTileAt(x, y).fsm.setState(TileStateAttackSelection);
        return 1;
      }
      return 0;
    }

    function findNearByEnemy() {
      const u = { x: selectedTile.pos.x, y: selectedTile.pos.y - 1 };
      const d = { x: selectedTile.pos.x, y: selectedTile.pos.y + 1 };
      const r = { x: selectedTile.pos.x + 1, y: selectedTile.pos.y };
      const l = { x: selectedTile.pos.x - 1, y: selectedTile.pos.y };

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
