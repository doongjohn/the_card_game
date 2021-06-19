class Team {
  static None = 0;
  static P1 = 1;
  static P2 = 2;
}

class Player {
  constructor(team) {
    this.selectedTile = null;
    this.selectedCard = null;
    this.team = team;
  }
}

class Match {
  static players = [
    new Player(Team.P1),
    new Player(Team.P2)
  ];
  static player = Match.players[0]; // current player
  static turn = Team.P1;            // current turn

  static init() {
    MatchInput.init();
    MatchAction.init();

    // temp help text
    const helpText = Game.spawn.text(10, 5,
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

  static nextTurn() {
    // cycle turn
    Match.turn = (Match.turn % 2) + 1;
    Match.player = Match.players[Match.turn - 1];

    // deselect tile
    Match.player.selectedTile = null;
    Grid.tiles.forEach(tile => { tile.fsm.setState(TileStateNormal); });

    // update text
    Match.turnText.text = `P${Match.turn}'s turn`;
  }

  static isThisTurn(permanent) {
    return permanent.data.team == Match.turn;
  }
}

class MatchInput {
  static keys = null;

  static init() {
    MatchInput.keys = Game.scene.input.keyboard.addKeys({
      cancel: 'esc',
      confirm: 'enter',
      endTurn: 'space',

      // test action
      unitTeleport: 'p',
      unitTap: 't',

      // normal action
      unitMove: 'm',
      unitAttack: 'a',
    });
  }
}

// TODO:
// - manage action state
// - add action state functions
class MatchAction {
  // action state
  static StateEmpty = 0;
  static StateView = 1;
  static StatePlanMove = 2;
  static StatePlanAttack = 3;
  static StateCounterAttack = 4;
  static state = MatchAction.StateEmpty;

  static init() {
    MatchInput.keys.cancel.on('down', () => {
      MatchAction.cancleState();
    });

    MatchInput.keys.confirm.on('down', () => {
      // TODO
      console.log('enter key pressed!');
    });

    MatchInput.keys.endTurn.on('down', () => {
      Match.nextTurn();
    });

    MatchInput.keys.unitTeleport.on('down', () => {
      if (!Match.player.selectedTile)
        return;

      if (!Match.player.selectedTile.cards.permanent)
        return;

      MatchAction.setState(MatchAction.StatePlanMove);

      Grid.tiles.forEach(tile => {
        if (tile.fsm.curState == TileStateSelected || tile.cards.permanent) return;
        tile.fsm.setState(TileStateMoveSelection)
      });
    });

    MatchInput.keys.unitTap.on('down', () => {
      if (!Match.player.selectedTile.cards.permanent)
        return;

      const cards = Match.player.selectedTile.cards;
      if (cards.permanent.isTapped()) {
        cards.permanent.untap();
      } else {
        cards.permanent.tap();
      }
    });

    MatchInput.keys.unitMove.on('down', () => {
      if (!Match.player.selectedTile || !Match.player.selectedTile.cards.permanent)
        return;

      const selected = Match.player.selectedTile;

      if (!Match.isThisTurn(selected.cards.permanent) || selected.cards.permanent.isTapped())
        return;
      
      MatchAction.setState(MatchAction.StatePlanMove);

      // make all tiles unselectable
      Grid.tiles.forEach(tile => {
        if (tile.fsm.curState != TileStateSelected)
          tile.fsm.setState(TileStateNoInteraction);
      });

      function setMoveSelectionTile(x, y) {
        if (!Grid.getPermanentAt(x, y))
          Grid.getTileAt(x, y) ?.fsm.setState(TileStateMoveSelection);
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

      if (!blockedR || !blockedU)
        setMoveSelectionTile(r.x, u.y);
      if (!blockedR || !blockedD)
        setMoveSelectionTile(r.x, d.y);
      if (!blockedL || !blockedU)
        setMoveSelectionTile(l.x, u.y);
      if (!blockedL || !blockedD)
        setMoveSelectionTile(l.x, d.y);
    });

    MatchInput.keys.unitAttack.on('down', () => {
      if (!Match.player.selectedTile)
        return;

      const selectedTile = Match.player.selectedTile;

      if (!selectedTile.cards.permanent || !Match.isThisTurn(selectedTile.cards.permanent))
        return;

      if (selectedTile.cards.permanent.isTapped())
        return;

      function setAttackSelectionTile(x, y) {
        const target = Grid.getPermanentAt(x, y);
        if (target && target.data.team != selectedTile.cards.permanent.data.team)
          Grid.getTileAt(x, y).fsm.setState(TileStateAttackSelection);
      }

      const u = { x: selectedTile.pos.x, y: selectedTile.pos.y - 1 };
      const d = { x: selectedTile.pos.x, y: selectedTile.pos.y + 1 };
      const r = { x: selectedTile.pos.x + 1, y: selectedTile.pos.y };
      const l = { x: selectedTile.pos.x - 1, y: selectedTile.pos.y };

      setAttackSelectionTile(r.x, r.y);
      setAttackSelectionTile(l.x, l.y);
      setAttackSelectionTile(u.x, u.y);
      setAttackSelectionTile(d.x, d.y);
      setAttackSelectionTile(r.x, u.y);
      setAttackSelectionTile(r.x, d.y);
      setAttackSelectionTile(l.x, u.y);
      setAttackSelectionTile(l.x, d.y);

      Grid.tiles.forEach(tile => {
        if (tile.fsm.curState != TileStateSelected && tile.fsm.curState != TileStateAttackSelection)
          tile.fsm.setState(TileStateNoInteraction);
      });
    });
  }

  static setState(state) {
    if (MatchAction.state == state) return;
    MatchAction.state = state;
  }
  
  static cancleState() {
    if (MatchAction.state == MatchAction.StateView) {
      MatchAction.setState(MatchAction.StateEmpty);
      Grid.tiles.forEach(tile => { tile.fsm.setState(TileStateNormal); });
    } else {
      MatchAction.setState(MatchAction.StateView);
      Grid.tiles.forEach(tile => {
        if (tile.fsm.curState != TileStateSelected)
          tile.fsm.setState(TileStateNormal);
      });
    }
  }
}