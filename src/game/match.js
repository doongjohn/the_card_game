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
  // players
  static players = [
    new Player(Team.P1),
    new Player(Team.P2)
  ];
  // current player
  static player = Match.players[0];

  // current turn
  static turn = Team.P1;

  // static turnText = null;

  static init() {
    // init Match Action
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
    Grid.tiles.forEach(tile => {
      tile.setState(TileStateNormal.prototype)
    });

    // update text
    Match.turnText.text = `P${Match.turn}'s turn`;
  }

  static isThisTurn(permanent) {
    return permanent.data.team == Match.turn;
  }
}

// TODO:
// - manage action state
// - add action state functions
class MatchAction {
  static keys = null;

  // action state
  static StateEmpty = 0;
  static StatePlanMove = 1;
  static StatePlanAttack = 2;
  static StateCounterAttack = 2;
  static state = MatchAction.StateEmpty;

  static init() {
    // initialize key bindings
    MatchAction.keys = Game.scene.input.keyboard.addKeys({
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

    MatchAction.keys.cancel.on('down', () => {
      Grid.tiles.forEach(tile => {
        if (tile.state == TileStateSelected.prototype) return;
        tile.setState(TileStateNormal.prototype)
      });
    });

    MatchAction.keys.confirm.on('down', () => {
      // TODO
      console.log('enter key pressed');
    });

    MatchAction.keys.endTurn.on('down', () => {
      Match.nextTurn();
    });

    MatchAction.keys.unitTeleport.on('down', () => {
      if (!Match.player.selectedTile)
        return;

      if (!Match.player.selectedTile.cards.permanent)
        return;

      Grid.tiles.forEach(tile => {
        if (tile.state == TileStateSelected.prototype || tile.cards.permanent) return;
        tile.setState(TileStateMoveSelection.prototype)
      });
    });

    MatchAction.keys.unitTap.on('down', () => {
      const selectedTile = Match.player.selectedTile;
      if (!selectedTile.cards.permanent) return;
      if (selectedTile.cards.permanent.isTapped()) {
        selectedTile.cards.permanent.untap();
      } else {
        selectedTile.cards.permanent.tap();
      }
    });

    MatchAction.keys.unitMove.on('down', () => {
      if (!Match.player.selectedTile)
        return;

      const selectedTile = Match.player.selectedTile;

      if (!selectedTile.cards.permanent || !Match.isThisTurn(selectedTile.cards.permanent))
        return;

      if (selectedTile.cards.permanent.isTapped())
        return;

      Grid.tiles.forEach(tile => {
        if (tile.state == TileStateSelected.prototype) return;
        tile.setState(TileStateNoInteraction.prototype)
      });

      const selected = Match.player.selectedTile;

      function setMoveSelectionTile(x, y) {
        if (!Grid.getPermanentAt(x, y))
          Grid.getTileAt(x, y) ?.setState(TileStateMoveSelection.prototype);
      }

      const blockedR = Grid.getPermanentAt(selected.pos.x + 1, selected.pos.y);
      const blockedL = Grid.getPermanentAt(selected.pos.x - 1, selected.pos.y);
      const blockedU = Grid.getPermanentAt(selected.pos.x, selected.pos.y - 1);
      const blockedD = Grid.getPermanentAt(selected.pos.x, selected.pos.y + 1);

      if (!blockedR) {
        setMoveSelectionTile(selected.pos.x + 1, selected.pos.y);
        setMoveSelectionTile(selected.pos.x + 2, selected.pos.y);
      }
      if (!blockedL) {
        setMoveSelectionTile(selected.pos.x - 1, selected.pos.y);
        setMoveSelectionTile(selected.pos.x - 2, selected.pos.y);
      }
      if (!blockedU) {
        setMoveSelectionTile(selected.pos.x, selected.pos.y - 1);
        setMoveSelectionTile(selected.pos.x, selected.pos.y - 2);
      }
      if (!blockedD) {
        setMoveSelectionTile(selected.pos.x, selected.pos.y + 1);
        setMoveSelectionTile(selected.pos.x, selected.pos.y + 2);
      }

      if (!blockedR || !blockedU)
        setMoveSelectionTile(selected.pos.x + 1, selected.pos.y - 1);
      if (!blockedR || !blockedD)
        setMoveSelectionTile(selected.pos.x + 1, selected.pos.y + 1);
      if (!blockedL || !blockedU)
        setMoveSelectionTile(selected.pos.x - 1, selected.pos.y - 1);
      if (!blockedL || !blockedD)
        setMoveSelectionTile(selected.pos.x - 1, selected.pos.y + 1);
    });

    MatchAction.keys.unitAttack.on('down', () => {
      if (!Match.player.selectedTile)
        return;

      const selectedTile = Match.player.selectedTile;

      if (!selectedTile.cards.permanent || !Match.isThisTurn(selectedTile.cards.permanent))
        return;

      if (selectedTile.cards.permanent.isTapped())
        return;

      Grid.tiles.forEach(tile => {
        if (tile.state == TileStateSelected.prototype) return;
        tile.setState(TileStateNoInteraction.prototype)
      });

      let targetFound = false;

      function setAttackSelectionTile(x, y) {
        const target = Grid.getPermanentAt(x, y);
        if (target && target.data.team != selectedTile.cards.permanent.data.team) {
          Grid.getTileAt(x, y).setState(TileStateAttackSelection.prototype);
          targetFound = true;
        }
      }

      setAttackSelectionTile(selectedTile.pos.x + 1, selectedTile.pos.y);
      setAttackSelectionTile(selectedTile.pos.x - 1, selectedTile.pos.y);
      setAttackSelectionTile(selectedTile.pos.x, selectedTile.pos.y - 1);
      setAttackSelectionTile(selectedTile.pos.x, selectedTile.pos.y + 1);
      setAttackSelectionTile(selectedTile.pos.x + 1, selectedTile.pos.y - 1);
      setAttackSelectionTile(selectedTile.pos.x + 1, selectedTile.pos.y + 1);
      setAttackSelectionTile(selectedTile.pos.x - 1, selectedTile.pos.y - 1);
      setAttackSelectionTile(selectedTile.pos.x - 1, selectedTile.pos.y + 1);

      if (!targetFound) {
        Grid.tiles.forEach(tile => {
          if (tile.state == TileStateSelected.prototype) return;
          tile.setState(TileStateNormal.prototype)
        });
      }
    });
  }
}