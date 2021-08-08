// TODO: big refactoring using composition!
// things to do
// - card paper hover and click
// - implement permanent functions doDamage, takeDamage, doAttack, etc

class CardAssetData {
  constructor({
    spriteName
  } = {}) {
    this.spriteName = spriteName;
  }
}
class CardData {
  constructor({
    index,
    owner,
    name,
    desc,
  } = {}) {
    this.index = index;
    this.owner = owner;
    this.name = name;
    this.desc = desc;
  }
}

class CardPaper {
  // this is a paper that exists in the deck, hand, etc...
  static width = 250;
  static height = 350;
  static cardColor = 0x1e2a42;
  static descBox = {
    margin: 6,
    width: CardPaper.width - 6 * 2,
    height: 160,
    color: 0x182236
  };

  constructor(assetData, data) {
    // tween
    this.tween = null;

    // card art
    this.cardArt = new SpriteCardArt(0, 0, `CardArt:${assetData.spriteName}`, assetData.spriteName)
      .setScale(1.6)
      .setOrigin(0.5, 1);

    // play card art animation
    Game.tryPlayAnimation(this.cardArt, `CardArt:Idle:${assetData.spriteName}`);

    // card
    this.card = Game.spawn.rectangle(
      0, 0,
      CardPaper.width,
      CardPaper.height,
      CardPaper.cardColor
    ).setStrokeStyle(3, CardPaper.descBox.color, 1);

    // description box
    this.descBox = Game.spawn.rectangle(
      0, CardPaper.height / 2 - CardPaper.descBox.margin,
      CardPaper.descBox.width,
      CardPaper.descBox.height,
      CardPaper.descBox.color
    ).setOrigin(0.5, 1);

    // card name
    this.cardName = Game.spawn.text(0, 0, data.name, {
      font: '18px Play',
      align: 'center'
    }).setOrigin(0.5, 1);

    // card description
    this.cardDesc = Game.spawn.text(
      CardPaper.descBox.margin - (CardPaper.descBox.width / 2), 15,
      data.desc,
      {
        font: '16px Play',
        align: 'left',
        wordWrap: { width: CardPaper.descBox.width - CardPaper.descBox.margin }
      }
    );

    // container for this card paper
    this.visual = Game.spawn.container(0, 0);
    this.visual.setSize(CardPaper.width + 10, CardPaper.height);
    this.visual.setInteractive();
    this.visual.add([
      this.bg,
      this.cardArt,
      this.cardName,
      this.textBg,
      this.cardText
    ]);

    Game.addToWorld(Layer.UI, this.visual);
  }
  hide() {
    this.visual.setVisible(false);
  }
  show() {
    this.visual.setVisible(true);
  }
}

class CardPieceData {
  constructor({
    assetData,
    data,
    team,
    pos
  } = {}) {
    this.data = data;
    this.team = team;
    this.pos = pos;
    this.tapped = false;
    this.flipped = false;

    this.sprite = new SpriteCardArt(0, 0, `CardArt:${assetData.spriteName}`, assetData.spriteName)
      .setScale(1.6)
      .setOrigin(0.5, 1);
    this.sprite.flipX = this.team != Team.P1;

    // play animation
    Game.tryPlayAnimation(this.sprite, `CardArt:Idle:${assetData.spriteName}`);

    // TODO: add based on card type
    Game.addToWorld(Layer.Permanent, this.sprite);
  }
}
class CardPiece {
  // this is an actual piece that exists on the board.
  constructor(pieceData) {
    this.pieceData = pieceData;
  }
  updateVisual() {
    this.pieceData.sprite.flipX = this.pieceData.team != Team.P1;
  }
  hide() {
    this.pieceData.sprite.setVisible(false);
  }
  show() {
    this.pieceData.sprite.setVisible(true);
  }

  tap(bool) {
    if (bool) {
      this.pieceData.tapped = true;
      this.pieceData.sprite.setPipeline(Game.pipeline.grayScale);
    } else {
      this.pieceData.tapped = false;
      this.pieceData.sprite.resetPipeline();
    }
  }
}

class Card {
  constructor(assetData, data) {
    this.assetData = assetData;
    this.data = data;
  }
  createCardPaper() {
    this.cardPaper = new CardPaper(this.assetData, this.data);
    return this.cardPaper;
  }
  createCardPiece() {
    this.cardPiece = new CardPiece(new CardPieceData(this.assetData, this.data));
    return this.cardPiece;
  }
}

const CardUIPermanent = {
  permanentStatsUI: null,
  createPermanentStatsUi(data) {
    const text = `⛨: ${data.health} ⚔: ${data.attack}`;
    this.permanentStatsUI = Game.spawn.text(-115, -145, text, {
      font: '18px Play',
      align: 'left'
    }).setOrigin(0, 1);
    this.visual.add(this.permanentStatsUI);
  },
  updatePermanentStatsUi(data) {
    this.permanentStatsUI.text = `⛨: ${data.health} ⚔: ${data.attack}`;
  }
}

const CardDataPermanent = {
  health: 0,
  attack: 0,
};
const CardDataMovable = {
  maxMoveCount: 1,
  curMoveCount: 0,
}

class CardPermanent extends Card {
  constructor(
    assetData,
    data,
    cardDataMovable = CardDataPermanent,
    cardDataPermanent = CardDataMovable
  ) {
    super(assetData, data);
    this.data = {
      ...this.data,
      ...cardDataPermanent,
      ...cardDataMovable
    };

    this.createCardPiece();
    this.cardPiece.pieceData = {
      ...this.cardPiece.pieceData,
      ...cardDataPermanent,
      ...cardDataMovable
    };

    this.createCardPaper();
    this.cardPaper = {
      ...this.cardPaper,
      ...CardUIPermanent
    };
  }
}

function createCardPermanent(
  index,
  owner,
  spriteAssetName
) {
  console.log('ww');
  switch (spriteAssetName) {
    case 'RagnoraTheRelentless':
      return new CardPermanent(
        new CardAssetData({
          spriteName: spriteAssetName
        }),
        new CardData({
          index: index,
          owner: owner,
          name: 'Ragnora The Relentless',
          desc: 'This card is STRONG!'
        }),
        {
          health: 5,
          attack: 1
        }
      );
    case 'ArgeonHighmayne':
      return new CardPermanent(
        new CardAssetData({
          spriteName: spriteAssetName
        }),
        new CardData({
          index: index,
          owner: owner,
          name: 'Argeon Highmayne',
          desc: 'Yay, kill me.'
        }),
        {
          health: 8,
          attack: 2
        }
      );
    case 'ZirAnSunforge':
      return new CardPermanent(
        new CardAssetData({
          spriteName: spriteAssetName
        }),
        new CardData({
          index: index,
          owner: owner,
          name: 'Zir\'An Sunforge',
          desc: 'Fuck Lyonar'
        }),
        {
          health: 5,
          attack: 3
        }
      );
    case 'RazorcragGolem':
      return new CardPermanent(
        new CardAssetData({
          spriteName: spriteAssetName
        }),
        new CardData({
          index: index,
          owner: owner,
          name: 'Razorcrag Golem',
          desc: 'This card sucks. wow wow wow wow wowowowowowo.'
        }),
        {
          health: 2,
          attack: 1
        }
      );
  }
}







class CardData {
  constructor({
    assetName,
    team,
    name,
    text,
    health,
    attack,
    maxMoveCount = 1
  } = {}) {
    this.assetName = assetName;
    this.team = team;
    this.name = name;
    this.text = text;
    this.health = health;
    this.attack = attack;
    this.maxMoveCount = maxMoveCount;
  }
}

class BoardObjData {
  constructor(cardData) {
    this.team = cardData.team;
    this.attack = cardData.attack;
    this.health = cardData.health;
    this.maxMoveCount = cardData.maxMoveCount;
    this.moveCount = 0;
    this.tapped = false;
    this.pos = { x: 0, y: 0 };
  }
  clone() {
    let copy = new BoardObjData(this);
    copy.team = this.team;
    copy.attack = this.attack;
    copy.health = this.health;
    copy.maxMoveCount = this.maxMoveCount;
    copy.moveCount = this.moveCount;
    this.tapped = this.tapped;
    copy.pos = { ...this.pos };
    return copy;
  }

  resetOnUntap() {
    this.moveCount = 0;
  }
  resetOnTurnStart() {
    this.untap();
  }

  canMove() {
    return this.moveCount < this.maxMoveCount;
  }
  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
}

class BoardObj {
  constructor(cardData) {
    // data
    this.data = new BoardObjData(cardData);

    // create sprite
    this.cardArt = new SpriteCardArt(0, 0, `CardArt:${cardData.assetName}`, cardData.assetName);
    this.cardArt.setScale(1.6).setOrigin(0.5, 1);

    // play animation
    Game.tryPlayAnimation(this.cardArt, `CardArt:Idle:${cardData.assetName}`);

    // add to layer
    Game.addToWorld(Layer.Permanent, this.cardArt);

    // set team
    this.setTeam(this.data.team);
  }

  destroy() {
    this.cardArt.destroy();
  }

  setTeam(team) {
    this.data.team = team;
    this.cardArt.flipX = team != Team.P1;
  }

  show() {
    this.cardArt.setVisible(true);
  }
  hide() {
    this.cardArt.setVisible(false);
  }

  resetOnTurnStart() {
    this.untap();
  }

  tap() {
    this.data.tapped = true;
    this.cardArt.setPipeline(Game.pipeline.grayScale);
  }
  untap() {
    this.data.tapped = false;
    this.data.resetOnUntap();
    this.cardArt.resetPipeline();
  }

  canMove() {
    return this.data.canMove();
  }
  setPos(x, y) {
    this.data.setPos(x, y);
    const worldPos = Board.gridToWorldPos(x, y);
    this.cardArt.setPosition(worldPos.x, worldPos.y + 60);
  }
}

class Card {
  constructor(data, cardOwner, cardIndex) {
    this.data = data;
    this.cardOwner = cardOwner;
    this.cardIndex = cardIndex;
    this.cardPaper = new CardPaper(data);
  }
}

class CardInteractPermanent {
  static hover(self) {
    // over
    self.cardPaper.visual.on('pointerover', () => {
      self.originalIndex = Layer.getIndex(Layer.UI, self.cardPaper.visual);
      Layer.bringToTop(Layer.UI, self.cardPaper.visual);
      self.cardPaper.visual.y -= 180;
      Match.turnPlayer.handUI.focusCard(self);
    });
    // out
    self.cardPaper.visual.on('pointerout', () => {
      Layer.moveTo(Layer.UI, self.cardPaper.visual, self.originalIndex);
      self.cardPaper.visual.y += 180;
      Match.turnPlayer.handUI.update();
    });
  }
  static click(self) {
    self.cardPaper.visual.on('pointerdown', () => UserAction.execute(CmdUnitPlanSpawn, self));
  }
}

class CardPermanent extends Card {
  constructor(owner, assetName, cardIndex) {
    // TODO: use a data base (json file?)
    switch (assetName) {
      case 'RagnoraTheRelentless':
        super(new CardData({
          assetName: assetName,
          team: owner.team,
          name: 'Ragnora The Relentless',
          text: 'This card is STRONG!',
          health: 40,
          attack: 2,
        }), owner, cardIndex);
        break;

      case 'ArgeonHighmayne':
        super(new CardData({
          assetName: assetName,
          team: owner.team,
          name: 'Argeon Highmayne',
          text: 'Yay, kill me.',
          health: 40,
          attack: 2,
        }), owner, cardIndex);
        break;

      case 'ZirAnSunforge':
        super(new CardData({
          assetName: assetName,
          team: owner.team,
          name: 'Zir\'An Sunforge',
          text: 'Fuck Lyonar',
          health: 99,
          attack: 5,
        }), owner, cardIndex);
        break;

      case 'RazorcragGolem':
        super(new CardData({
          assetName: assetName,
          team: owner.team,
          name: 'Razorcrag Golem',
          text: 'This card sucks. wow wow wow wow wowowowowowo.',
          health: 3,
          attack: 2,
        }), owner, cardIndex);
        break;
    }

    // init data
    this.spawnable = false;
    this.boardObj = null;

    // init input event
    CardInteractPermanent.hover(this);
    CardInteractPermanent.click(this);

    // init ui
    this.cardPaper.initStatsUi(this.data);

    // init visual
    this.originalIndex = 0;
    this.tweenMovement = null;
  }

  isMyTurn() {
    return this.data.team == Match.turn;
  }

  spawnBoardObj(x, y) {
    if (this.boardObj) {
      console.error("This card has already spawned a board object.");
    } else {
      this.boardObj = new BoardObj(this.data);
    }
    this.boardObj.setPos(x, y);
    return this.boardObj;
  }
  destroyBoardObj() {
    this.boardObj?.destroy();
    this.boardObj = null;
  }

  resetOnTurnStart() {
    this.boardObj.resetOnTurnStart();
  }

  tapped() {
    return this.boardObj.data.tapped;
  }
  tap() {
    this.boardObj.tap();
  }
  untap() {
    this.boardObj.untap();
  }

  canMove() {
    return this.boardObj.canMove();
  }
  setPos(x, y) {
    // update board
    Board.movePermanentAt(this.boardObj.data.pos.x, this.boardObj.data.pos.y, x, y);

    // remove tween and move board obj
    this.tweenMovement?.remove();
    this.tweenMovement = null;
    this.boardObj.setPos(x, y);
  }
  moveTo(x, y) {
    // update board
    Board.movePermanentAt(this.boardObj.data.pos.x, this.boardObj.data.pos.y, x, y);

    // update data
    this.boardObj.data.moveCount++;
    this.boardObj.data.setPos(x, y);

    // tween movement data
    const speed = 0.35;
    const pos = Board.gridToWorldPos(x, y);
    pos.y += 60;
    const dist = Phaser.Math.Distance.BetweenPoints(pos, this.boardObj.cardArt);

    // tween movement
    this.tweenMovement?.remove();
    this.tweenMovement = Game.scene.tweens.add({
      // tween options
      targets: this.boardObj.cardArt,
      repeat: 0,
      ease: 'Linear',
      duration: dist / speed,

      // tween props
      x: { from: this.boardObj.cardArt.x, to: pos.x },
      y: { from: this.boardObj.cardArt.y, to: pos.y },

      // on tween complete
      onCompleteParams: [this],
      onComplete: function (tween) {
        tween.remove();
        this.tweenMovement = null;
      },
    });
  }

  doDamage(target) {
    target.takeDamage(this, this.boardObj.data.attack);
  }
  doAttack(target) {
    EffectAction.onDealDamage(this, target);
    this.doDamage(target);
    this.tap();
  }
  takeDamage(attacker, damage) {
    // update health
    this.boardObj.data.health = Math.max(this.boardObj.data.health - damage, 0);
    this.cardPaper.updateStatsUi(this.boardObj.data);

    // run effect
    EffectAction.onTakeDamage(this, attacker);

    // TODO: move this card to the graveyard
    if (this.boardObj.data.health <= 0)
      Board.removePermanentAt(this.boardObj.data.pos.x, this.boardObj.data.pos.y);
  }
}
