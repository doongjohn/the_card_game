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
  static cardBg = {
    width: 250,
    height: 350,
    color: 0x1e2a42
  };
  static cardDescBox = {
    margin: 6,
    width: CardPaper.width - 6 * 2,
    height: 160,
    color: 0x182236
  };

  constructor(assetData, data) {
    // card art
    this.cardArt = new SpriteCardArt(0, 0, `CardArt:${assetData.spriteName}`, assetData.spriteName)
      .setScale(1.6)
      .setOrigin(0.5, 1);

    // play card art animation
    Game.tryPlayAnimation(this.cardArt, `CardArt:Idle:${assetData.spriteName}`);

    // card
    this.cardBg = Game.spawn.rectangle(
      0, 0,
      CardPaper.cardBg.width,
      CardPaper.cardBg.height,
      CardPaper.cardBg.color
    ).setStrokeStyle(3, CardPaper.cardDescBox.color, 1);

    // description box
    this.cardDescBox = Game.spawn.rectangle(
      0, CardPaper.cardBg.height / 2 - CardPaper.cardDescBox.margin,
      CardPaper.cardDescBox.width,
      CardPaper.cardDescBox.height,
      CardPaper.cardDescBox.color
    ).setOrigin(0.5, 1);

    // card name
    this.cardNameText = Game.spawn.text(0, 0, data.name, {
      font: '18px Play',
      align: 'center'
    }).setOrigin(0.5, 1);

    // card description
    this.cardDescText = Game.spawn.text(
      CardPaper.cardDescBox.margin - (CardPaper.cardDescBox.width / 2), 15,
      data.desc,
      {
        font: '16px Play',
        align: 'left',
        wordWrap: { width: CardPaper.cardDescBox.width - CardPaper.cardDescBox.margin }
      }
    );

    // container for this card paper
    this.visual = Game.spawn.container(0, 0);
    this.visual.setSize(
      CardPaper.cardBg.width,
      CardPaper.cardBg.height
    );
    this.visual.setInteractive();
    this.visual.add([
      this.cardBg,
      this.cardArt,
      this.cardNameText,
      this.cardDescBox,
      this.cardDescText
    ]);

    // add gameobjects to world
    Game.addToWorld(Layer.UI, this.visual);

    // tween
    this.tween = null;

    // interaction
    this.interaction = null;
    this.visual.on('pointerover', () => { this.interaction?.onHoverEnter(); });
    this.visual.on('pointerout', () => { this.interaction?.onHoverExit(); });
    this.visual.on('pointerdown', () => { this.interaction?.onClick(); });
  }
  hide() {
    this.visual.setVisible(false);
  }
  show() {
    this.visual.setVisible(true);
  }
}

class CardPieceData {
  constructor(assetData, data) {
    this.owner = data.owner;
    this.team = data.owner.team;
    this.tapped = false;
    this.faceDowned = false;
    this.pos = null;
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

    // tween
    this.tween = null;

    this.hide();
    this.updateVisual();

    // play animation
    Game.tryPlayAnimation(this.pieceData.sprite, `CardArt:Idle:${assetData.spriteName}`);
  }
  hide() {
    this.pieceData.sprite.setVisible(false);
  }
  show() {
    this.pieceData.sprite.setVisible(true);
  }
  updateVisual() {
    this.pieceData.sprite.flipX = this.pieceData.team != Team.P1;
  }

  setPos(x, y) {
    if (this.pieceData.pos) {
      Board.movePermanentAt(this.pieceData.pos.x, this.pieceData.pos.y, x, y);
      this.pieceData.pos.x = x;
      this.pieceData.pos.y = y;
    } else {
      this.pieceData.pos = { x: x, y: y };
    }

    // remove tween
    this.tween?.remove();
    this.tween = null;

    const worldPos = Board.gridToWorldPos(x, y);
    this.pieceData.sprite.x = worldPos.x;
    this.pieceData.sprite.x = worldPos.y + 60;
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
  faceDown(bool) {
    if (bool) {
      this.pieceData.faceDowned = true;
      // do stuff
    } else {
      this.pieceData.faceDowned = false;
      // do stuff
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
  }
  createCardPiece() {
    console.log(this.data);
    this.cardPiece = new CardPiece(this.assetData, new CardPieceData(this.assetData, this.data));
  }
}