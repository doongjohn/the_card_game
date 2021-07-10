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
      font: '18px Play',
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
        font: '16px Play',
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
    Game.addToWorld(Layer.UI, this.visual);

    // hide
    this.hide();

    this.tween = null;
  }

  destroy() {
    this.visual.destroy();
  }

  show() {
    this.visual.setVisible(true);
  }
  hide() {
    this.visual.setVisible(false);
  }

  initStatsUi(cardData) {
    this.statsTxt = Game.spawn.text(-115, -145, `⛨: ${cardData.health} ⚔: ${cardData.attack}`, {
      font: '18px Play',
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
    this.originalIndex = 0;
    this.tweenMovement = null;
  }

  initHover() {
    // TODO: make card selection better
    this.cardPaper.visual.on('pointerover', () => {
      this.originalIndex = Layer.getIndex(Layer.UI, this.cardPaper.visual);
      Layer.bringToTop(Layer.UI, this.cardPaper.visual);
      this.cardPaper.visual.y -= 200;
      Match.turnPlayer.handUI.focusCard(this);
    });
    this.cardPaper.visual.on('pointerout', () => {
      Layer.moveTo(Layer.UI, this.cardPaper.visual, this.originalIndex);
      this.cardPaper.visual.y += 200;
      Match.turnPlayer.handUI.update();
    });
  }
  initClickShowInfo() {
    // TODO: show card info
    this.cardPaper.visual.on('pointerdown', () => {
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
    } else {
      this.boardObj = new BoardObj(this.data);
      this.boardObj.setPos(x, y);
    }
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
