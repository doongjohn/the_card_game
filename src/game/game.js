class Game {
  /** @type {Phaser.Scene} */
  static scene = null
  /** @type {Phaser.Cameras.Scene2D.Camera} */
  static mainCam = null
  /** @type {Phaser.Math.Vector2} */
  static center = null
  /** @type {Phaser.GameObjects.GameObjectFactory} */
  static spawn = null
  static pipeline = null

  static init(scene) {
    Game.scene = scene
    Game.spawn = scene.add
    Game.mainCam = scene.cameras.main
    Game.center = new Phaser.Math.Vector2(Game.mainCam.centerX, Game.mainCam.centerY)
    Game.pipeline = {
      grayScale: scene.renderer.pipelines.get('Gray')
    }
  }

  // alias to Game.world.add
  static addToWorld(layer, ...objs) {
    function tryAdd(obj) {
      if (obj instanceof Phaser.GameObjects.GameObject)
        Layer.add(layer, obj)
      else if (obj.gameObject !== undefined)
        Layer.add(layer, obj.gameObject)
      else
        console.error(`"${obj}": doesn't contains a gameobject!`)
    }
    for (let obj of objs) {
      if (Array.isArray(obj))
        obj.forEach(o => tryAdd(o))
      else
        tryAdd(obj)
    }
  }

  static playAnimation(sprite, key) {
    if (!Game.scene.anims.exists(key)) {
      console.error(`Can't play animation: "${key}"\nthis animation key does not exists.`)
      return
    }
    sprite.play(key)
  }
}
