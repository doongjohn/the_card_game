// NOTE: Why does phaser hate nested continer?
class Layer {
  static BG = 0;
  static Board = 1;
  static Permanent = 2;
  static UI = 3;

  static init() {
    Layer.roots = [];
    for (let i = 0; i < 4; ++i)
      Layer.roots.push(Game.spawn.container(Game.center.x, Game.center.y).setDepth(i));
  }

  static add(layer, obj) {
    Layer.roots[layer].add(obj);
  }
  static getIndex(layer, obj) {
    return Layer.roots[layer].getIndex(obj);
  }

  static moveTo(layer, obj, index) {
    Layer.roots[layer].moveTo(obj, index);
  }
  static bringToTop(layer, obj) {
    Layer.roots[layer].bringToTop(obj);
  }
}