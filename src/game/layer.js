// NOTE: Why does phaser hate nested continer?
class Layer {
  static BG = 0
  static Default = 1
  static Board = 2
  static Permanent = 3
  static UI = 4

  static init() {
    Layer.roots = []
    for (let i = 0; i < 5; ++i)
      Layer.roots.push(Game.spawn.container(Game.center.x, Game.center.y).setDepth(i))
  }

  static add(layer, obj) {
    Layer.roots[layer].add(obj)
  }
  static getIndex(layer, obj) {
    return Layer.roots[layer].getIndex(obj)
  }

  static moveTo(layer, obj, index) {
    Layer.roots[layer].moveTo(obj, index)
  }
  static bringToTop(layer, obj) {
    Layer.roots[layer].bringToTop(obj)
  }
}