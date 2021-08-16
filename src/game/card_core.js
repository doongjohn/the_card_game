// TODO: big refactoring using composition!
// https://github.com/victorlap/RAS

// TODO: big refactoring using actions!
// - card effects can be described as series of actions
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
  static cardBg = {
    width: 250,
    height: 350,
    color: 0x1e2a42
  };
  static cardDescBox = {
    margin: 6,
    width: CardPaper.cardBg.width - 6 * 2,
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
    this.visual.setSize(CardPaper.cardBg.width, CardPaper.cardBg.height);
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
    // {
    //   onHoverEnter: function(),
    //   onHoverExit: function(),
    //   onClick: function(),
    // }
    this.visual.on('pointerover', () => { this.interaction?.onHoverEnter(); });
    this.visual.on('pointerout', () => { this.interaction?.onHoverExit(); });
    this.visual.on('pointerdown', () => { this.interaction?.onClick(); });

    // hide by default
    this.hide();
  }
  hide() {
    this.visual.setVisible(false);
  }
  show() {
    this.visual.setVisible(true);
  }
}

class CardPieceData {
  constructor(data) {
    this.owner = data.owner;
    this.team = data.owner.team;
    this.tapped = false;
    this.faceDowned = false;
    this.pos = null;
  }
  clone() {
    const copy = compose(new CardPieceData(this), this); // this is for cloning dynamic data
    copy.pos = this.pos ? { ...this.pos } : null;
    return copy;
  }
}
class CardPiece {
  // this is an actual piece that exists on the board.
  constructor(card, pieceData) {
    this.card = card;
    this.pieceData = pieceData;

    // sprite
    this.sprite = new SpriteCardArt(0, 0, `CardArt:${card.assetData.spriteName}`, card.assetData.spriteName)
      .setScale(1.6)
      .setOrigin(0.5, 1);

    // TODO: set layer based on card type
    Game.addToWorld(Layer.Permanent, this.sprite);

    // play animation
    Game.tryPlayAnimation(this.sprite, `CardArt:Idle:${card.assetData.spriteName}`);

    this.tween = null;
    this.hide();
    this.updateVisual();
  }
  hide() {
    this.sprite.setVisible(false);
  }
  show() {
    this.sprite.setVisible(true);
  }
  updateVisual() {
    this.sprite.flipX = this.pieceData.team != Team.P1;
  }

  setPos(x, y) {
    // set grid position
    if (this.pieceData.pos) {
      // NOTE: Board.movePermanentAt() does not change pieceData.pos
      Board.movePermanentAt(this.pieceData.pos.x, this.pieceData.pos.y, x, y);
      this.pieceData.pos.x = x;
      this.pieceData.pos.y = y;
    } else {
      this.pieceData.pos = { x: x, y: y };
    }

    // remove tween
    this.tween?.remove();
    this.tween = null;

    // set sprite world position
    const worldPos = Board.gridToWorldPos(x, y);
    this.sprite.x = worldPos.x;
    this.sprite.y = worldPos.y + 60;
  }
  tap(bool) {
    if (bool) {
      this.pieceData.tapped = true;
      this.sprite.setPipeline(Game.pipeline.grayScale);
    } else {
      this.pieceData.tapped = false;
      this.sprite.resetPipeline();
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
  mixinCardPaper(...mixins) {
    this.cardPaper = compose(this.cardPaper, ...mixins);
  }

  createCardPiece() {
    this.cardPiece = new CardPiece(this, new CardPieceData(this.data));
  }
  mixinCardPiece(...mixins) {
    this.cardPiece = compose(this.cardPiece, ...mixins);
  }
  mixinCardPieceData(...mixins) {
    this.cardPiece.pieceData = compose(this.cardPiece.pieceData, ...mixins);
  }
}