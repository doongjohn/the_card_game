class CardData {
  // This class stores the base stat/info of a card.
  // This data should not change.

  constructor({ name, text, health, attack, team } = {}) {
    this.name = name;
    this.text = text;
    this.health = health;
    this.attack = attack;
    this.team = team;
  }
}

class CardObjData {
  // This class stores the current stat/info of a card.
  // This data may change because of combat, spells, etc...

  pos = { x: 0, y: 0 };
  moveCount = 2;
  tapped = false;

  constructor(cardData) {
    this.attack = cardData.attack;
    this.health = cardData.health;
    this.team = cardData.team;
  }

  setPos(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
}

class CardVisual {
  static width = 250;
  static height = 350;
  static bgColor = 0x1e2a42;

  static textBgMargin = 6;
  static textBgWidth = CardVisual.width - (CardVisual.textBgMargin * 2);
  static textBgHeight = 160;
  static textBgColor = 0x182236;

  constructor(assetName, data) {
    const cardArtName = `CardArt:${assetName}`;
    this.cardArt = new SpriteCardArt(0, 0, cardArtName, assetName);
    this.cardObj = new SpriteCardArt(0, 0, cardArtName, assetName);
    this.cardArt.setScale(1.6).setOrigin(0.5, 1);
    this.cardObj.setScale(1.6).setOrigin(0.5, 1);

    // play animation
    const animKey = `CardArt:Idle:${assetName}`;
    if (Game.scene.anims.exists(animKey)) {
      this.cardArt.play(animKey);
      this.cardObj.play(animKey)
    }
    else {
      console.error(`anim key does not exists! "${animKey}"`);
    }

    const bg = Game.spawn.rectangle(
      0, 0,
      CardVisual.width,
      CardVisual.height,
      CardVisual.bgColor
    ).setStrokeStyle(3, CardVisual.textBgColor, 1);

    const textBg = Game.spawn.rectangle(
      0, CardVisual.height / 2 - CardVisual.textBgMargin,
      CardVisual.textBgWidth,
      CardVisual.textBgHeight,
      CardVisual.textBgColor
    ).setOrigin(0.5, 1);

    const cardName = Game.spawn.text(0, 0, data.name, {
      font: '18px Arial',
      align: 'center'
    }).setOrigin(0.5, 1);

    const cardText = Game.spawn.text(
      CardVisual.textBgMargin - (CardVisual.textBgWidth / 2), 15,
      data.text,
      {
        font: '16px Arial',
        align: 'left',
        wordWrap: { width: CardVisual.textBgWidth - CardVisual.textBgMargin }
      }
    );

    // container for this card
    this.card = Game.spawn.container(0, 0, [
      bg,
      textBg,
      this.cardArt,
      cardName,
      cardText
    ]);

    // add objects to world
    Game.add(this.cardObj);
    Game.add(this.card);

    // hide all visuals
    this.hideCard();
    this.hideCardObj();
  }

  showCard() {
    this.card.setVisible(true);
  }
  hideCard() {
    this.card.setVisible(false);
  }

  showCardObj(objData) {
    const pos = Grid.gridToWorldPos(objData.pos.x, objData.pos.y);
    this.cardObj.setVisible(true).setPosition(pos.x, pos.y + 60);
    this.cardObj.flipX = objData.team != Team.P1;
  }
  hideCardObj() {
    this.cardObj.setVisible(false);
  }
  updateCardObj(objData) {
    const pos = Grid.gridToWorldPos(objData.pos.x, objData.pos.y);
    this.cardObj.setPosition(pos.x, pos.y + 60);
    this.cardObj.flipX = objData.team != Team.P1;
  }

  initStatsUi(data) {
    this.statsTxt = Game.spawn.text(-115, -145, `⛨: ${data.health} ⚔: ${data.attack}`, {
      font: '18px Arial',
      align: 'left'
    }).setOrigin(0, 1);
    this.card.add(this.statsTxt);
  }
  updateStatsUi(data) {
    this.statsTxt.text = `⛨: ${data.health} ⚔: ${data.attack}`;
  }
}

class Card {
  constructor(assetName, data) {
    this.data = data;
    this.objData = new CardObjData(data);
    this.visual = new CardVisual(assetName, data);
  }

  // this function is only for debuging
  destroyCard() {
    this.visual.card.destroy();
    this.visual.cardObj.destroy();
  }

  isTapped() {
    return this.objData.tapped;
  }
  tap() {
    this.objData.tapped = true;
    this.visual.cardObj.setPipeline(Game.pipeline.grayScale);
  }
  untap() {
    this.objData.tapped = false;
    this.visual.cardObj.resetPipeline();
  }
}

class CardPermanent extends Card {
  constructor(team, assetName) {
    // TODO: use a data base (json file?)
    switch (assetName) {
      case 'RagnoraTheRelentless':
        super(assetName, new CardData({
          name: 'Ragnora The Relentless',
          text: 'This card is STRONG!',
          health: 40,
          attack: 2,
          team: team
        }));
        break;

      case 'ArgeonHighmayne':
        super(assetName, new CardData({
          name: 'Argeon Highmayne',
          text: 'Yay, kill me.',
          health: 40,
          attack: 2,
          team: team
        }));
        break;

      case 'ZirAnSunforge':
        super(assetName, new CardData({
          name: 'Zir\'An Sunforge',
          text: 'Fuck Lyonar',
          health: 99,
          attack: 5,
          team: team
        }));
        break;

      case 'RazorcragGolem':
        super(assetName, new CardData({
          name: 'Razorcrag Golem',
          text: 'This card sucks. wow wow wow wow wowowowowowo.',
          health: 3,
          attack: 2,
          team: team
        }));
        break;
    }

    // initialzie permanent
    this.visual.initStatsUi(this.data);
    this.initClickEvent();
    this.tweenMovement = null;
  }

  initClickEvent() {
    this.visual.card.setSize(CardVisual.width, CardVisual.height);
    this.visual.card.setInteractive();
    this.visual.card.on('pointerdown', () => {
      // spawn this card on the board
      Match.player.selectedCard = this;
      Grid.tiles.forEach(tile => {
        if (tile.fsm.curState == TileStateSelected.prototype || tile.cards.permanent)
          return;
        tile.fsm.setState(TileStateSpawnPermanentSelection.prototype);
      });
    });
  }

  moveTo(x, y) {
    // update board
    Grid.permanents[toIndex(this.objData.pos)] = null;
    Grid.permanents[toIndex({ x: x, y: y })] = this;

    // update card
    this.objData.setPos(x, y);

    // tween movement data
    const speed = 0.35;
    const pos = Grid.gridToWorldPos(x, y);
    pos.y += 60;
    const dist = Math.sqrt(
      (pos.x - this.visual.cardObj.x) ** 2 +
      (pos.y - this.visual.cardObj.y) ** 2
    );

    // remove previous tween
    this.tweenMovement ?.remove();

    // tween movement
    this.tweenMovement = Game.scene.tweens.add({
      // tween options
      targets: this.visual.cardObj,
      repeat: 0,
      ease: 'Linear',
      duration: dist / speed,

      // tween props
      x: { from: this.visual.cardObj.x, to: pos.x },
      y: { from: this.visual.cardObj.y, to: pos.y },

      // on tween complete
      onCompleteParams: [this],
      onComplete: function (tween) { tween.remove(); },
    })
  }

  doDamage(target) {
    target.takeDamage(this.objData.attack);
  }
  takeDamage(damage) {
    this.objData.health -= damage;
    this.visual.updateStatsUi(this.objData);
    if (this.objData.health <= 0) {
      // TODO:
      // move this card to the grave yard
      Grid.removePermanentAt(this.objData.pos.x, this.objData.pos.y);
    }
  }
}
