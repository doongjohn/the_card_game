class CardData {
  constructor({ team, name, text, health, attack, maxMoveCount = 1 } = {}) {
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

  resetOnUntap() {
    this.moveCount = 0;
  }
  resetOnTurnStart() {
    this.untap();
  }

  tap() {
    this.tapped = true;
  }
  untap() {
    this.tapped = false;
    this.resetOnUntap();
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
  constructor(assetName, cardData) {
    // data
    this.data = new BoardObjData(cardData);

    // create sprite
    this.cardArt = new SpriteCardArt(0, 0, `CardArt:${assetName}`, assetName);
    this.cardArt.setScale(1.6).setOrigin(0.5, 1);

    // play animation
    const animKey_Idle = `CardArt:Idle:${assetName}`;
    if (Game.scene.anims.exists(animKey_Idle))
      this.cardArt.play(animKey_Idle);
    else
      console.error(`This anim key does not exists! "${animKey_Idle}"`);

    // add to layer
    Layer.permanent.add(this.cardArt);

    // hide
    this.hide();
  }

  destroy() {
    this.cardArt.destroy();
  }

  show() {
    this.cardArt.setVisible(true);
    return this.cardArt;
  }
  hide() {
    this.cardArt.setVisible(false);
    return this.cardArt;
  }

  tap() {
    this.data.tap();
    this.cardArt.setPipeline(Game.pipeline.grayScale);
  }
  untap() {
    this.data.untap();
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

class CardPaper {
  static width = 250;
  static height = 350;
  static bgColor = 0x1e2a42;
  static textBg = {
    margin: 6,
    width: CardPaper.width - 6 * 2,
    height: 160,
    color: 0x182236
  };

  constructor(assetName, data) {
    // create sprite
    this.cardArt = new SpriteCardArt(0, 0, `CardArt:${assetName}`, assetName);
    this.cardArt.setScale(1.6).setOrigin(0.5, 1);

    // play animation
    const animKey_Idle = `CardArt:Idle:${assetName}`;
    if (Game.scene.anims.exists(animKey_Idle))
      this.cardArt.play(animKey_Idle);
    else
      console.error(`This anim key does not exists! "${animKey_Idle}"`);

    // card bg
    this.bg = Game.spawn.rectangle(
      0, 0,
      CardPaper.width,
      CardPaper.height,
      CardPaper.bgColor
    ).setStrokeStyle(3, CardPaper.textBg.color, 1);

    // card name
    this.cardName = Game.spawn.text(0, 0, data.name, {
      font: '18px Arial',
      align: 'center'
    }).setOrigin(0.5, 1);

    // text area bg
    this.textBg = Game.spawn.rectangle(
      0, CardPaper.height / 2 - CardPaper.textBg.margin,
      CardPaper.textBg.width,
      CardPaper.textBg.height,
      CardPaper.textBg.color
    ).setOrigin(0.5, 1);

    // card text
    this.cardText = Game.spawn.text(
      CardPaper.textBg.margin - (CardPaper.textBg.width / 2), 15,
      data.text,
      {
        font: '16px Arial',
        align: 'left',
        wordWrap: { width: CardPaper.textBg.width - CardPaper.textBg.margin }
      }
    );

    // container for this card paper
    this.visual = Game.spawn.container(0, 0, [
      this.bg,
      this.cardArt,
      this.cardName,
      this.textBg,
      this.cardText
    ]);

    // make interactable
    this.visual.setSize(CardPaper.width, CardPaper.height);
    this.visual.setInteractive();

    // add to layer
    Layer.ui.add(this.visual);

    // hide
    this.hide();
  }

  destroy() {
    this.visual.destroy();
  }

  show() {
    this.visual.setVisible(true);
    return this.visual;
  }
  hide() {
    this.visual.setVisible(false);
    return this.visual;
  }

  initStatsUi(data) {
    this.statsTxt = Game.spawn.text(-115, -145, `⛨: ${data.health} ⚔: ${data.attack}`, {
      font: '18px Arial',
      align: 'left'
    }).setOrigin(0, 1);
    this.visual.add(this.statsTxt);
  }
  updateStatsUi(data) {
    this.statsTxt.text = `⛨: ${data.health} ⚔: ${data.attack}`;
  }
}

class Card {
  constructor(assetName, data) {
    this.data = data;
    this.cardPaper = new CardPaper(assetName, data);
  }
}

class CardPermanent extends Card {
  constructor(team, assetName) {
    // TODO: use a data base (json file?)
    switch (assetName) {
      case 'RagnoraTheRelentless':
        super(assetName, new CardData({
          team: team,
          name: 'Ragnora The Relentless',
          text: 'This card is STRONG!',
          health: 40,
          attack: 2,
        }));
        break;

      case 'ArgeonHighmayne':
        super(assetName, new CardData({
          team: team,
          name: 'Argeon Highmayne',
          text: 'Yay, kill me.',
          health: 40,
          attack: 2,
        }));
        break;

      case 'ZirAnSunforge':
        super(assetName, new CardData({
          team: team,
          name: 'Zir\'An Sunforge',
          text: 'Fuck Lyonar',
          health: 99,
          attack: 5,
        }));
        break;

      case 'RazorcragGolem':
        super(assetName, new CardData({
          team: team,
          name: 'Razorcrag Golem',
          text: 'This card sucks. wow wow wow wow wowowowowowo.',
          health: 3,
          attack: 2,
        }));
        break;
    }

    // init data
    this.boardObj = new BoardObj(assetName, this.data);
    this.spawnable = false;

    // init pointer event
    this.initHover();
    this.initClickShowInfo();
    this.initClickSpawnBoardObj();

    // init ui
    this.cardPaper.initStatsUi(this.data);

    // init visual
    this.tweenMovement = null;
  }

  initHover() {
    // scale up on hover
    this.cardPaper.visual.on('pointerover', () => {
      Layer.ui.moveUp(this.cardPaper.visual);
      this.cardPaper.visual.y -= 200;
      this.cardPaper.visual.setScale(1.2);
    });
    this.cardPaper.visual.on('pointerout', () => {
      Layer.ui.moveDown(this.cardPaper.visual);
      this.cardPaper.visual.y += 200;
      this.cardPaper.visual.setScale(1);
    });
  }
  initClickShowInfo() {
    this.cardPaper.visual.on('pointerdown', () => {
      // TODO: show card info

      // deselect tile
      Match.turnPlayer.selectedTile = null;
      Board.setTileStateAll(TileStateNormal);

      // update selected card
      if (Match.turnPlayer.selectedCard && !Match.turnPlayer.selectedCard.spawnable)
        Match.turnPlayer.selectedCard.cardPaper.hide();
      Match.turnPlayer.selectedCard = this;
    });
  }
  initClickSpawnBoardObj() {
    this.cardPaper.visual.on('pointerdown', () => {
      if (!this.spawnable) return;

      // update tile state
      Board.tiles.forEach(tile => {
        // spawn this card on the board
        if (!tile.cards.permanent)
          tile.fsm.setState(TileStateSpawnPermanentSelection);
      });

      // update match action state
      MatchAction.setState(MatchAction.StatePlanPermanentSpawn);
    });
  }

  spawnBoardObj() {

  }

  resetOnTurnStart() {
    this.boardObj.data.resetOnTurnStart();
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
  changePosTo(x, y) {
    // update board
    Board.movePermanent(this.boardObj.data.pos.x, this.boardObj.data.pos.y, x, y);

    // remove tween and update board obj
    this.tweenMovement?.remove();
    this.boardObj.setPos(x, y);
  }
  moveTo(x, y) {
    // update board
    Board.movePermanent(this.boardObj.data.pos.x, this.boardObj.data.pos.y, x, y);

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
      onComplete: function (tween) { tween.remove(); },
    })
  }

  doDamage(target) {
    target.takeDamage(this.boardObj.data.attack);
  }
  doAttack(target) {
    this.doDamage(target);
    // TODO: trigger effect
    this.tap(); // TODO: tap after enemy on take damage event is triggered
  }
  takeDamage(damage) {
    // update health
    this.boardObj.data.health = Math.max(this.boardObj.data.health - damage, 0);

    // update ui
    this.cardPaper.updateStatsUi(this.boardObj.data);

    // TODO: trigger effect

    // TODO: move this card to the grave yard
    if (this.boardObj.data.health <= 0)
      Board.removePermanentAt(this.boardObj.data.pos.x, this.boardObj.data.pos.y);
  }
}
