const CardDB = [
  {
    spriteAssetName: 'RagnoraTheRelentless',
    name: 'Ragnora The Relentless',
    desc: 'This card is VERY STRONGU!!!',
    data: {
      health: 5,
      attack: 1
    }
  },
  {
    spriteAssetName: 'ArgeonHighmayne',
    name: 'Argeon Highmayne',
    desc: 'This card is VERY STRONGU!!!',
    data: {
      health: 8,
      attack: 2
    }
  },
  {
    spriteAssetName: 'ZirAnSunforge',
    name: 'Zir\'An Sunforge',
    desc: 'Fuck Lyonar.',
    data: {
      health: 5,
      attack: 3
    }
  },
  {
    spriteAssetName: 'RazorcragGolem',
    name: 'Razorcrag Golem',
    desc: 'This card sucks. wow wow wow wow wowowowowowo.',
    data: {
      health: 2,
      attack: 1
    }
  }
];


const CardPaperPermanentData = {
  permanentStatsUI: null
}
const CardPaperPermanentLogic = {
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
};
class CardPaperInteractHand {
  constructor(card) {
    this.card = card;
    this.originalIndex = 0;
  }
  onHoverEnter() {
    // save original display index
    this.originalIndex = Layer.getIndex(Layer.UI, this.card.cardPaper.visual);

    // set card paper display index to top
    Layer.bringToTop(Layer.UI, this.card.cardPaper.visual);

    // move card up
    this.card.cardPaper.visual.y -= 180;

    // update hand ui
    Match.turnPlayer.handUI.focusCard(this.card);
  }
  onHoverExit() {
    // set card paper display index to original
    Layer.moveTo(Layer.UI, this.card.cardPaper.visual, this.originalIndex);

    // move card down
    this.card.cardPaper.visual.y += 180;

    // update hand ui
    Match.turnPlayer.handUI.update();
  }
  onClick() {
    // plan spawn this card
    UserAction.execute(CmdUnitPlanSpawn, this.card);
  }
}


const CardMovableData = {
  maxMoveCount: 1,
  curMoveCount: 0,
};
const CardPieceMovableLogic = {
  canMove() {
    return this.pieceData.curMoveCount < this.pieceData.maxMoveCount;
  },
  moveTo(x, y) {
    Board.movePermanentAt(this.pieceData.pos.x, this.pieceData.pos.y, x, y);
    this.pieceData.curMoveCount++;
    this.pieceData.pos.x = x;
    this.pieceData.pos.y = y;

    // tween movement data
    const speed = 0.35;
    const pos = Board.gridToWorldPos(x, y);
    pos.y += 60;
    const dist = Phaser.Math.Distance.BetweenPoints(pos, this.sprite);

    // tween movement
    this.tween?.remove();
    this.tween = Game.scene.tweens.add({
      // tween options
      targets: this.sprite,
      repeat: 0,
      ease: 'Linear',
      duration: dist / speed,

      // tween props
      x: { from: this.sprite.x, to: pos.x },
      y: { from: this.sprite.y, to: pos.y },

      // on tween complete
      onCompleteParams: [this],
      onComplete: function (tween) {
        tween.remove();
        this.tween = null;
      },
    });
  }
}

const CardPermanentData = {
  health: 0,
  attack: 0,
};
const CardPiecePermanentLogic = {
  doDamage(target) {
    target.takeDamage(this.card, this.pieceData.attack);
  },
  doAttack(target) {
    EffectAction.onAttack(this.card, target.card);
    this.doDamage(target);
    this.tap(true);
  },
  takeDamage(attacker, damage) {
    // update health
    this.pieceData.health = Math.max(this.pieceData.health - damage, 0);
    this.card.cardPaper.updatePermanentStatsUi(this.pieceData);

    // run effect
    EffectAction.onTakeDamage(this.card, attacker);

    // TODO: move this card to the graveyard
    if (this.pieceData.health <= 0)
      Board.removePermanentAt(this.pieceData.pos.x, this.pieceData.pos.y);
  }
}


function createCardPermanent(
  index,
  owner,
  spriteAssetName
) {
  for (const fetched of CardDB) {
    if (fetched.spriteAssetName != spriteAssetName)
      continue;

    const card = new Card(
      new CardAssetData({
        spriteName: spriteAssetName
      }),
      compose(
        new CardData({
          index: index,
          owner: owner,
          name: fetched.name,
          desc: fetched.desc
        }),
        CardMovableData,
        CardPermanentData,
        fetched.data
      )
    );

    card.createCardPaper();
    card.mixinCardPaper(
      CardPaperPermanentData,
      CardPaperPermanentLogic
    );
    card.cardPaper.createPermanentStatsUi(card.data);
    card.cardPaper.interaction = new CardPaperInteractHand(card); // TODO: this is only for interaction in hand

    card.createCardPiece();
    card.mixinCardPieceData(
      CardMovableData,
      CardPermanentData,
      fetched.data
    );
    card.mixinCardPiece(
      CardPieceMovableLogic,
      CardPiecePermanentLogic
    );

    return card;
  }
}
