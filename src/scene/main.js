// TODO implement transform group
class TransformGroup {
  constructor(x, y) {
    this.x = Game.center.x;
    this.y = Game.center.y;
    this.local = {
      x: x,
      y: y
    };
    this.child = [];
  }
  add(obj) {
    this.child.push(obj);
    obj.local = { x: obj.x, y: obj.y };
    obj.x = Game.center.x + obj.local.x;
    obj.y = Game.center.y + obj.local.y;
  }
}

class MainScene extends Phaser.Scene {
  init() {
    Game.init(this);
  }

  preload() {
    SpriteManager.BoardBG.load();
    SpriteManager.CardArt.load();
  }

  create() {
    SpriteManager.CardArt.createAnims();

    // Layer.init();
    // Match.init();
    // Board.init();

    const group = new TransformGroup(0, 0);
    const rect = Game.spawn.rectangle(0, 0, 100, 100, 0x000000);
    group.add(rect);
  }

  // update(time, delta) {
  //   // runs every frame
  // }
}