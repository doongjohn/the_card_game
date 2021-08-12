// TODO: big refactoring using composition!
// things to do
// - card paper hover and click
// - implement permanent functions doDamage, takeDamage, doAttack, etc
// ref: https://github.com/victorlap/RAS

// everything is an action
// action can run some other actions
// action has an start and end event

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
  constructor(assetData, data, pos) {
    this.owner = data.owner;
    this.team = data.owner.team;
    this.tapped = false;
    this.faceDown = false;
    this.pos = pos;
    this.sprite = new SpriteCardArt(0, 0, `CardArt:${assetData.spriteName}`, assetData.spriteName)
      .setScale(1.6)
      .setOrigin(0.5, 1);

    // TODO: set layer based on card type
    Game.addToWorld(Layer.Permanent, this.sprite);
  }
}
class CardPiece {
  // this is an actual piece that exists on the board.
  constructor(assetData, pieceData) {
    this.pieceData = pieceData;
    this.updateVisual();

    // play animation
    Game.tryPlayAnimation(this.pieceData.sprite, `CardArt:Idle:${assetData.spriteName}`);
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
  createCardPiece(pos) {
    this.cardPiece = new CardPiece(this.assetData, new CardPieceData(this.assetData, this.data, pos));
    return this.cardPiece;
  }
}