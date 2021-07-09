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
    Game.spawn = scene.add;
    Game.pipeline = {
      grayScale: scene.renderer.pipelines.get('Gray')
    };
  }

  // alias to Game.world.add
  static addToWorld(layer, objs) {
    function add(layer, obj) {
      if (obj instanceof Phaser.GameObjects.GameObject) {
        Layer.add(layer, obj);
      } else if (obj.gameObject !== undefined) {
        Layer.add(layer, obj.gameObject);
      } else {
        console.error("It can't be added to the world! (not a gameobject?)");
      }
    }

    if (Array.isArray(objs)) {
      for (const obj of objs)
        add(layer, obj);
    } else {
      add(layer, objs);
    }
  }

  static tryPlayAnimation(thing, key) {
    if (Game.scene.anims.exists(key))
      thing.play(key);
    else
      console.error(`Can't play animation: "${key}" <- this anim key does not exists.`);
  }
}
