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
  constructor(cardData) {
    // data
    this.data = new BoardObjData(cardData);

    // create sprite
    this.cardArt = new SpriteCardArt(0, 0, `CardArt:${cardData.assetName}`, cardData.assetName);
    this.cardArt.setScale(1.6).setOrigin(0.5, 1);

    // play animation
    Game.tryPlayAnimation(this.cardArt, `CardArt:Idle:${cardData.assetName}`);

    // add to layer
    Layer.permanent.add(this.cardArt);

    // set team
    this.setTeam(this.data.team);
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

  setTeam(team) {
    this.data.team = team;
    this.cardArt.flipX = team != Team.P1;
  }

  resetOnTurnStart() {
    this.untap();
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

  constructor(cardData) {
    // create sprite
    this.cardArt = new SpriteCardArt(0, 0, `CardArt:${cardData.assetName}`, cardData.assetName);
    this.cardArt.setScale(1.6).setOrigin(0.5, 1);
    Game.tryPlayAnimation(this.cardArt, `CardArt:Idle:${cardData.assetName}`);

    // card bg
    this.bg = Game.spawn.rectangle(
      0, 0,
      CardPaper.width,
      CardPaper.height,
      CardPaper.bgColor
    ).setStrokeStyle(3, CardPaper.textBg.color, 1);

    // card name
    this.cardName = Game.spawn.text(0, 0, cardData.name, {
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
      cardData.text,
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

  initStatsUi(cardData) {
    this.statsTxt = Game.spawn.text(-115, -145, `⛨: ${cardData.health} ⚔: ${cardData.attack}`, {
      font: '18px Arial',
      align: 'left'
    }).setOrigin(0, 1);
    this.visual.add(this.statsTxt);
  }
  updateStatsUi(cardData) {
    this.statsTxt.text = `⛨: ${cardData.health} ⚔: ${cardData.attack}`;
  }
}

class Card {
  constructor(data) {
    this.data = data;
    this.cardPaper = new CardPaper(data);
  }
}

class CardPermanent extends Card {
  constructor(team, assetName) {
    // TODO: use a data base (json file?)
    switch (assetName) {
      case 'RagnoraTheRelentless':
        super(new CardData({
          assetName: assetName,
          team: team,
          name: 'Ragnora The Relentless',
          text: 'This card is STRONG!',
          health: 40,
          attack: 2,
        }));
        break;

      case 'ArgeonHighmayne':
        super(new CardData({
          assetName: assetName,
          team: team,
          name: 'Argeon Highmayne',
          text: 'Yay, kill me.',
          health: 40,
          attack: 2,
        }));
        break;

      case 'ZirAnSunforge':
        super(new CardData({
          assetName: assetName,
          team: team,
          name: 'Zir\'An Sunforge',
          text: 'Fuck Lyonar',
          health: 99,
          attack: 5,
        }));
        break;

      case 'RazorcragGolem':
        super(new CardData({
          assetName: assetName,
          team: team,
          name: 'Razorcrag Golem',
          text: 'This card sucks. wow wow wow wow wowowowowowo.',
          health: 3,
          attack: 2,
        }));
        break;
    }

    // init data
    this.spawnable = false;
    this.boardObj = null;

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

  spawnBoardObj(x, y) {
    if (this.boardObj) {
      console.warn("This card has already spawned a board object.");
      return this.boardObj;
    }
    this.boardObj = new BoardObj(this.data);
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
