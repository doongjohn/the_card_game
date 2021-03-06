const CardPaperDataPermanent = {
  permanentStatsUI: null
}
const CardPaperLogicPermanent = {
  createPermanentStatsUi(data) {
    const text = `⛨: ${data.health} ⚔: ${data.attack}`
    this.permanentStatsUI = Game.spawn.text(-115, -145, text, {
      font: '18px Play',
      align: 'left'
    }).setOrigin(0, 1)
    this.visual.add(this.permanentStatsUI)
  },
  updatePermanentStatsUi(data) {
    this.permanentStatsUI.text = `⛨: ${data.health} ⚔: ${data.attack}`
  }
}
class CardPaperHandInteraction {
  constructor(card) {
    this.card = card
    this.originalIndex = 0
  }
  onHoverEnter() {
    // save original display index
    this.originalIndex = Layer.getIndex(Layer.UI, this.card.cardPaper.visual)

    // set card paper display index to top
    Layer.bringToTop(Layer.UI, this.card.cardPaper.visual)

    // move card up
    this.card.cardPaper.visual.y -= 180
  }
  onHoverExit() {
    // set card paper display index to original
    Layer.moveTo(Layer.UI, this.card.cardPaper.visual, this.originalIndex)

    // move card down
    this.card.cardPaper.visual.y += 180

    // update hand ui
    Match.turnPlayer.handUI.update()
  }
  onClick() {
    // plan spawn this card
    Cmd.permanentPlanSummon(this.card)
  }
}


const CardDataMovable = {
  maxMoveCount: 1,
  curMoveCount: 0,
}
const CardPieceLogicMovable = {
  canMove() {
    return !this.pieceData.tapped && this.pieceData.curMoveCount < this.pieceData.maxMoveCount
  },
  moveTo(x, y) {
    // increase current move count
    ++this.pieceData.curMoveCount

    // update position
    CardZoneBoard.swapPermanentAt(this.pieceData.pos.x, this.pieceData.pos.y, x, y)
    this.pieceData.pos.x = x
    this.pieceData.pos.y = y
  },
  visualTweenPosTo(x, y) {
    const pos = tileGrid.coordToWorldPos(x, y)
    const speed = 0.35
    const dist = Phaser.Math.Distance.BetweenPoints(pos, this.sprite)

    this.tween?.remove()
    this.tween = Game.scene.tweens.add({
      targets: this.sprite,
      repeat: 0,
      ease: 'Linear',
      duration: dist / speed,

      props: {
        x: { from: this.sprite.x, to: pos.x },
        y: { from: this.sprite.y, to: pos.y },
      },

      onCompleteParams: [this],
      onComplete: function (tween) {
        tween.remove()
        this.tween = null
      },
    })
  }
}

const CardDataPermanent = {
  health: 0,
  attack: 0,
}
const CardPieceLogicPermanent = {
  revitalize() {
    this.pieceData.curMoveCount = 0
  },
  untap() { // override
    this.pieceData.tapped = false
    this.sprite.resetPipeline()
    this.revitalize()
  },
  canAttack() {
    // TODO: make this variable useful
    return !this.pieceData.tapped
  },
  doAttack(target) {
    // invoke effect
    EffectEvent.invoke('onAttack', this.card, target.card)
    EffectEvent.invoke('onDealDamage', this.card, target.card)

    // deal damage to target
    target.takeDamage(this.card, this.pieceData.attack)

    // tap this card piece
    Cmd.permanentTap(this.card)

    // target counter attack
    if (target.pieceData.health > 0 && !target.pieceData.tapped) {
      Cmd.permanentCounterAttack(target.card, this.card)
    }
  },
  doCounterAttack(target) {
    // invoke effect
    EffectEvent.invoke('onCounterAttack', this.card, target.card)
    EffectEvent.invoke('onDealDamage', this.card, target.card)

    // deal damage to target
    target.takeDamage(this.card, this.pieceData.attack)
  },
  takeDamage(attacker, damage) {
    // face up
    this.pieceData.faceDowned && this.faceUp()

    // update health
    this.pieceData.health = Math.max(this.pieceData.health - damage, 0)

    // invoke effect
    EffectEvent.invoke('onTakeDamage', this.card, attacker)

    // on death
    if (this.pieceData.health == 0) {
      // invoke effect
      EffectEvent.invoke('onTakeLethalDamage', this.card, attacker)

      // TODO: move this card to the graveyard
      CardZoneBoard.removePermanentAt(this.pieceData.pos.x, this.pieceData.pos.y)
    }

    // update ui
    if (this.card == Match.selectedTile.getPermanent()) {
      CardInfoUI.update(this.card)
    }
  }
}


function createCardPermanent(
  index,
  owner,
  spriteAssetName
) {
  for (const fetched of CardDB) {
    if (fetched.spriteAssetName != spriteAssetName)
      continue

    // create new card object
    const card = new Card(
      new CardAssetData({
        spriteName: spriteAssetName
      }),
      compose(
        new CardData({
          index: index,
          owner: owner,
          type: 'permanent',
          name: fetched.name,
          desc: fetched.desc
        }),
        CardDataMovable,
        CardDataPermanent,
        fetched.data
      )
    )

    // create card paper
    card.createCardPaper()
    card.composeCardPaper(
      CardPaperDataPermanent,
      CardPaperLogicPermanent
    )
    card.cardPaper.createPermanentStatsUi(card.data)
    card.cardPaper.interaction = new CardPaperHandInteraction(card) // TODO: this is only for interaction in hand

    // create card piece
    card.createCardPiece()
    card.composeCardPieceData(
      CardDataMovable,
      CardDataPermanent,
      fetched.data
    )
    card.composeCardPiece(
      CardPieceLogicMovable,
      CardPieceLogicPermanent
    )

    return card
  }
}
