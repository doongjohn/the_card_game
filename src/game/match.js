class Team {
  static None = 0;
  static P1 = 1;
  static P2 = 2;
}

class Player {
  constructor(team) {
    this.team = team;
    this.selectedTile = null;
    this.selectedCard = null;
    this.deck = [];
    this.hand = [];
  }

  addToHand(card) {
    this.hand.push(card);
  }

  showHand() {
    // TODO: show hand like hearthstone
    const card0 = new CardPermanent(this.team, 'ZirAnSunforge');
    const card1 = new CardPermanent(this.team, 'ZirAnSunforge');
    const card2 = new CardPermanent(this.team, 'ZirAnSunforge');
    const card3 = new CardPermanent(this.team, 'ZirAnSunforge');
    const card4 = new CardPermanent(this.team, 'ZirAnSunforge');
    const card5 = new CardPermanent(this.team, 'ZirAnSunforge');
    const card6 = new CardPermanent(this.team, 'ZirAnSunforge');
    const card7 = new CardPermanent(this.team, 'ZirAnSunforge');
    this.addToHand(card0);
    this.addToHand(card1);
    this.addToHand(card2);
    this.addToHand(card3);
    this.addToHand(card4);
    this.addToHand(card5);
    this.addToHand(card6);
    this.addToHand(card7);

    const maxCard = 6;
    const maxWidth = (CardVisual.width + 10) * maxCard;
    const y = 515;
    let xStart = 0;
    let xGap = 0;

    // FIXEME: so many bugs...
    if (this.hand.length <= maxCard) {
      xStart = -((CardVisual.width + 10) / 2) * Math.round(this.hand.length / 2);
      xGap = CardVisual.width + 10;
    } else {
      xStart = -(maxWidth / 2) + ((CardVisual.width / 2));
      xGap = (maxWidth / (this.hand.length + 1));
    }

    let i = 0;
    for (let card of this.hand) {
      card.visual.showCard().setPosition(xStart + (xGap * i++), y);
    }
  }
}

class Match {
  static players = Object.freeze([
    new Player(Team.P1),
    new Player(Team.P2)
  ]);
  static turn = Team.P1;
  static turnPlayer = Match.players[0];
  static oppsPlayer = Match.players[1];

  static init() {
    MatchInput.init();
    MatchAction.init();

    // TEST
    Match.turnPlayer.showHand();

    // temp help text
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

    Match.turnText = Game.spawn.text(Game.center.x, 10, 'P1\'s turn', {
      color: '#000000',
      font: '32px Arial',
      align: 'center'
    }).setOrigin(0.5, 0);
  }

  static isThisTurn(permanent) {
    return permanent.data.team == Match.turn;
  }

  static nextTurn() {
    // cycle turn
    Match.oppsPlayer = Match.players[Match.turn];
    Match.turn = (Match.turn % 2) + 1;
    Match.turnPlayer = Match.players[Match.turn - 1];

    // deselect all
    Match.turnPlayer.selectedCard = null;
    Match.turnPlayer.selectedTile = null;

    // reset tile state
    Grid.setTileStateAll(TileStateNormal);

    // update text
    Match.turnText.text = `P${Match.turn}'s turn`;

    // untap permanents
    Grid.permanents.forEach(permanent => {
      if (permanent)
        permanent.resetOnTurnStart();
    });
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
      Grid.tiles.forEach(tile => { tile.fsm.setState(TileStateNormal); });
      MatchAction.setState(MatchAction.StateEmpty);
    } else {
      Grid.tiles.forEach(tile => {
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
    Grid.tiles.forEach(tile => {
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
    if (permanent.isTapped())
      permanent.untap();
    else
      permanent.tap();
  }
  static onUnitMove() {
    if (!Match.turnPlayer.selectedTile || !Match.turnPlayer.selectedTile.cards.permanent)
      return;

    const selected = Match.turnPlayer.selectedTile;
    if (!Match.isThisTurn(selected.cards.permanent)
      || selected.cards.permanent.isTapped()
      || !selected.cards.permanent.canMove())
      return;

    // Unit Plan Move
    MatchAction.setState(MatchAction.StatePlanMove);

    function setMoveSelectionTile(x, y) {
      if (!Grid.getPermanentAt(x, y))
        Grid.getTileAt(x, y)?.fsm.setState(TileStateMoveSelection);
    }

    const u = { x: selected.pos.x, y: selected.pos.y - 1 };
    const d = { x: selected.pos.x, y: selected.pos.y + 1 };
    const r = { x: selected.pos.x + 1, y: selected.pos.y };
    const l = { x: selected.pos.x - 1, y: selected.pos.y };

    const blockedR = Grid.getPermanentAt(r.x, r.y);
    const blockedL = Grid.getPermanentAt(l.x, l.y);
    const blockedU = Grid.getPermanentAt(u.x, u.y);
    const blockedD = Grid.getPermanentAt(d.x, d.y);

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
    Grid.tiles.forEach((tile) => {
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
    if (selectedTile.cards.permanent.isTapped())
      return;

    // Unit Plan Attack
    MatchAction.setState(MatchAction.StatePlanAttack);

    function setAttackSelectionTile(x, y) {
      const target = Grid.getPermanentAt(x, y);
      if (target && target.data.team != selectedTile.cards.permanent.data.team) {
        Grid.getTileAt(x, y).fsm.setState(TileStateAttackSelection);
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
    Grid.tiles.forEach((tile) => {
      if (!tile.fsm.curState.compare(TileStateSelected, TileStateAttackSelection))
        tile.fsm.setState(TileStateNoInteraction);
    });
  }
}
