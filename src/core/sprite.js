class PixelSprite extends Phaser.GameObjects.Sprite {
  constructor(x, y, assetNameFull, assetName, frame) {
    super(Game.scene, x, y, assetNameFull, frame);
    this.assetNameFull = assetNameFull;
    this.assetName = assetName;

    this.texture.setFilter(Phaser.ScaleModes.NEAREST);
    Game.spawn.existing(this);
  }
}

class SpriteCardArt extends PixelSprite {
  constructor(x, y, assetName) {
    super(x, y, 'CardArt:' + assetName, assetName, 0);
  }
}

class SpriteManager {
  static BoardBG = {
    load() {
      Game.scene.load.image('BattleMap1', 'assets/board_bg/battlemap1.png');
      Game.scene.load.image('BattleMap5', 'assets/board_bg/battlemap5.png');
    }
  };

  static CardArt = {
    cardArtLoad(...data) {
      for (const x of data) {
        Game.scene.load.spritesheet(
          x.name, `assets/card_art/${x.fileName}`, {
          frameWidth: x.width,
          frameHeight: x.height
        });
      }
    },

    cardArtCreateAnim(...data) {
      for (const x of data) {
        Game.scene.anims.create({
          key: x.key,
          frames: Game.scene.anims.generateFrameNumbers(x.name, {
            start: 0,
            end: x.length - 1
          }),
          frameRate: 16,
          repeat: -1
        });
      }
    },

    load() {
      this.cardArtLoad(
        {
          name: 'CardArt:RagnoraTheRelentless',
          fileName: 'RagnoraTheRelentless.png',
          width: 130, height: 130
        },
        {
          name: 'CardArt:ArgeonHighmayne',
          fileName: 'ArgeonHighmayne.png',
          width: 100, height: 100
        },
        {
          name: 'CardArt:ZirAnSunforge',
          fileName: 'ZirAnSunforge.png',
          width: 100, height: 100
        },
        {
          name: 'CardArt:RazorcragGolem',
          fileName: 'RazorcragGolem.png',
          width: 120, height: 120
        },
        {
          name: 'CardArt:Sojourner',
          fileName: 'Sojourner.png',
          width: 80, height: 80
        },
        {
          name: 'CardArt:Rex',
          fileName: 'Rex.png',
          width: 100, height: 100
        },
      );
    },

    createAnims() {
      this.cardArtCreateAnim(
        {
          name: 'CardArt:RagnoraTheRelentless',
          key: 'CardArt:Idle:RagnoraTheRelentless',
          length: 14
        },
        {
          name: 'CardArt:ArgeonHighmayne',
          key: 'CardArt:Idle:ArgeonHighmayne',
          length: 11
        },
        {
          name: 'CardArt:ZirAnSunforge',
          key: 'CardArt:Idle:ZirAnSunforge',
          length: 14
        },
        {
          name: 'CardArt:RazorcragGolem',
          key: 'CardArt:Idle:RazorcragGolem',
          length: 14
        },
        {
          name: 'CardArt:Sojourner',
          key: 'CardArt:Idle:Sojourner',
          length: 12
        },
        {
          name: 'CardArt:Rex',
          key: 'CardArt:Idle:Rex',
          length: 12
        },
      );
    }
  };
}
