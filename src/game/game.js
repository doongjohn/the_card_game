class Game {
  static scene = null;
  static world = null;
  static mainCam = null;
  static center = null;
  static spawn = null; // alias to scene.add
  static pipeline = null;

  static init(scene) {
    Game.scene = scene;
    Game.mainCam = scene.cameras.main;
    Game.center = new Phaser.Math.Vector2(Game.mainCam.centerX, Game.mainCam.centerY);
    Game.world = scene.add.container(Game.center.x, Game.center.y);
    Game.spawn = scene.add;
    Game.pipeline = {
      grayScale: scene.renderer.pipelines.get('Gray')
    };
  }

  // alias to world.add
  static add(gameObject) {
    if (Array.isArray(gameObject)) {
      for (let x of gameObject)
        if (x instanceof Phaser.GameObjects.GameObject)
          Game.world.add(x);
        else if (x.gameObject !== undefined)
          Game.world.add(x.gameObject);
      return;
    }
    if (gameObject instanceof Phaser.GameObjects.GameObject)
      Game.world.add(gameObject);
    else if (gameObject.gameObject !== undefined)
      Game.world.add(gameObject.gameObject);
  }
}
