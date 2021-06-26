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
  static addToWorld() {
    for (let go of arguments) {
      if (go instanceof Phaser.GameObjects.GameObject)
        Game.world.add(go);
      else if (go.gameObject !== undefined)
        Game.world.add(go.gameObject);
      else
        console.error("It's can't be added to the world!");
    }
  }
}
