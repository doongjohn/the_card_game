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

  // alias to Game.world.add
  static addToWorld(things, layer) {
    function add(thing, layer) {
      if (thing instanceof Phaser.GameObjects.GameObject) {
        Game.world.add(thing);
        layer.add(thing);
        return;
      }
      if (thing.gameObject !== undefined) {
        Game.world.add(thing.gameObject);
        layer.add(thing.gameObject);
        return;
      }
      console.error("It can't be added to the world! (not a gameobject?)");
    }

    if (Array.isArray(things)) {
      for (const thing of things)
        add(thing, layer);
    } else {
      add(things, layer);
    }
  }

  static tryPlayAnimation(thing, key) {
    if (Game.scene.anims.exists(key))
      thing.play(key);
    else
      console.error(`Can't play animation: "${key}" <- this anim key does not exists.`);
  }
}
