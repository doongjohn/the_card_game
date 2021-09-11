class PixelSprite extends Phaser.GameObjects.Sprite {
  constructor(x, y, assetName) {
    super(Game.scene, x, y, assetName);
    this.assetName = assetName;
    this.texture.setFilter(Phaser.ScaleModes.NEAREST);
    Game.spawn.existing(this);
  }
}

class SpriteCardArt extends PixelSprite {
  constructor(x, y, assetName) {
    super(x, y, 'CardArt:' + assetName, assetName);
  }
}

class SpriteManager {
  static BoardBG = {
    load() {
      Game.scene.load.image('BattleMap1', 'assets/board_bg/battlemap1.png');
      Game.scene.load.image('BattleMap5', 'assets/board_bg/battlemap5.png');
    }
  };

  static CardBack = {
    load() {
      Game.scene.load.image('CardBackDefault', 'assets/card_back/CardBackDefault.png');
    }
  };

  static CardArt = {
    cardArtLoad(...data) {
      for (const x of data) {
        Game.scene.load.spritesheet(
          'CardArt:' + x.fileName, `assets/card_art/${x.fileName}.png`, {
          frameWidth: x.width,
          frameHeight: x.height
        });
      }
    },
    cardArtLoadFromUrl(...data) {
      for (const x of data) {
        Game.scene.load.image('CardArt:' + x.name, x.url);
      }
    },

    cardArtCreateAnim(...data) {
      for (const x of data) {
        Game.scene.anims.create({
          key: 'CardArt:' + x.key + ':' + x.name,
          frames: Game.scene.anims.generateFrameNumbers(
            'CardArt:' + x.name,
            {
              start: 0,
              end: x.length - 1
            }
          ),
          frameRate: 16,
          repeat: -1
        });
      }
    },

    load() {
      // this.cardArtLoadFromUrl(
      //   {
      //     name: 'BloodtearAlchmist',
      //     url: 'https://static.wikia.nocookie.net/duelyst_gamepedia/images/2/2c/Bloodtear_Alchemist_idle.gif',
      //     width: 80, height: 80
      //   }
      // );
      this.cardArtLoad(
        {
          fileName: 'RagnoraTheRelentless',
          width: 130, height: 130
        },
        {
          fileName: 'ArgeonHighmayne',
          width: 100, height: 100
        },
        {
          fileName: 'ZirAnSunforge',
          width: 100, height: 100
        },
        {
          fileName: 'RazorcragGolem',
          width: 120, height: 120
        },
        {
          fileName: 'Sojourner',
          width: 80, height: 80
        },
        {
          fileName: 'Rex',
          width: 100, height: 100
        },
        {
          fileName: 'KaleosXaan',
          width: 80, height: 80
        },
      );
    },

    createAnims() {
      this.cardArtCreateAnim(
        {
          name: 'RagnoraTheRelentless',
          key: 'Idle',
          length: 14
        },
        {
          name: 'ArgeonHighmayne',
          key: 'Idle',
          length: 11
        },
        {
          name: 'ZirAnSunforge',
          key: 'Idle',
          length: 14
        },
        {
          name: 'RazorcragGolem',
          key: 'Idle',
          length: 14
        },
        {
          name: 'Sojourner',
          key: 'Idle',
          length: 12
        },
        {
          name: 'Rex',
          key: 'Idle',
          length: 12
        },
        {
          name: 'KaleosXaan',
          key: 'Idle',
          length: 14
        },
      );
    }
  };
}
