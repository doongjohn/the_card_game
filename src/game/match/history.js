class History {
  static commands = []
  static save(...saves) {
    this.commands.push(saves.map(save => new save()))
  }
  static undo() {
    if (this.commands.length > 0)
      for (let save of this.commands.pop()) save.undo()
  }
}