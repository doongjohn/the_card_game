// FIXEME: display bug!
class Layer {
  static init() {
    Layer.BG =
      Game.spawn.layer().setDepth(0);
    Layer.Board =
      Game.spawn.layer().setDepth(1);
    Layer.Permanent =
      Game.spawn.layer().setDepth(2);
    Layer.UI =
      Game.spawn.layer().setDepth(3);
  }
}