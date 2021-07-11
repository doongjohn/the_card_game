// TODO: implement command pattern
// - add ui state data
// - add board state data (includes tile state)
// - add player state data (deck, hand)
class GameStateData {
  constructor(cmd) {
    MatchAction.commands.push(cmd);
    this.prev = MatchAction.commands[MatchAction.commands.length - 1];
    this.state = MatchAction.state;
    this.turn = Match.turn;
    this.turnPlayer = Match.turnPlayer;
    this.oppsPlayer = Match.oppsPlayer;
    this.selectedTile = Match.turnPlayer.selectedTile;
    this.selectedCard = Match.turnPlayer.selectedTile;
    MatchAction.state = this;
  }
  restore() {
    MatchAction.commands.pop();
    MatchAction.setState(this.state);
    Match.turn = this.turn;
    Match.turnPlayer = this.turnPlayer;
    Match.oppsPlayer = this.oppsPlayer;
    Match.turnPlayer.selectedTile = this.selectedTile;
    Match.turnPlayer.selectedCard = this.selectedCard;
  }
}

class UserCancel {
  execute() {
    if (MatchAction.state == MatchAction.StateEmpty)
      return;

    this.data = new GameStateData(this);
    if (MatchAction.state == MatchAction.StateView) {
      Board.tiles.forEach(tile => { tile.fsm.setState(TileStateNormal); });
      MatchAction.setState(MatchAction.StateEmpty);
    } else {
      Board.tiles.forEach(tile => { if (tile != Match.turnPlayer.selectedTile) tile.fsm.setState(TileStateNormal) });
      MatchAction.setState(MatchAction.StateView);
    }
  }
  undo() {
    this.data.restore();
  }
}

class UserEndTurn {
  execute() {
    this.data = new GameStateData(this);
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
  undo() {
    this.data.restore();

    // update ui
    Match.turnText.text = `P${Match.turn}'s turn`;
    Match.turnPlayer.handUI.update();
    Match.turnPlayer.handUI.show();
    Match.oppsPlayer.handUI.hide();
  }
}