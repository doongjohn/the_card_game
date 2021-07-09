// FIXEME: display bug!
class Layer {
  static BG = 0;
  static Board = 1;
  static Permanent = 2;
  static UI = 3;

  static init() {
    Layer.roots = [];
    Layer.layers = [];
    for (let i = 0; i < 4; ++i) {
      Layer.roots.push(Game.spawn.container(Game.center.x, Game.center.y));
      Layer.layers.push(Game.spawn.layer().setDepth(i));
    }
  }
  static add(layer, obj) {
    Layer.layers[layer].add(obj);
    Layer.roots[layer].add(obj);
  }
  static getIndex(layer, obj) {
    Layer.roots[layer].getIndex(obj);
  }
  static bringToTop(layer, obj) {
    Layer.roots[layer].bringToTop(obj);
  }
  static moveTo(layer, obj, index) {
    Layer.roots[layer].moveTo(obj, index);
  }
}