class MatchHist {
  static commands = []
  static histSet = new Set()

  static push(hist) {
    MatchHist.histSet.add(hist)
  }
  static save() {
    this.commands.push([...MatchHist.histSet].map(save => new save()))
    MatchHist.histSet.clear()
  }
  static undo() {
    if (this.commands.length > 0)
      for (let save of this.commands.pop()) save.undo()

    let permanent = Match.selectedTile?.getPermanent()
    if (permanent)
      CardInfoUI.update(permanent)
    else
      CardInfoUI.hide()
  }
}