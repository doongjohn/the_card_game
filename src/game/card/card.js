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
    UserAction.execute(CmdUnitPlanSummon, this.card)
  }
}


const CardDataMovable = {
  maxMoveCount: 1,
  curMoveCount: 0,
}
const CardPieceLogicMovable = {
  canMove() {
    // check if curMoveCount is smaller than maxMoveCount
    return this.pieceData.curMoveCount < this.pieceData.maxMoveCount
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
  resetTeam() {
    this.pieceData.owner = this.card.data.owner
  },
  setTeam(team) {
    this.pieceData.owner = team == Team.P1 ? Match.player1 : Match.player2
    this.visualUpdateTeam()
  },
  revitalize() {
    this.pieceData.curMoveCount = 0
  },
  tap(bool) { // overrides base function
    if (this.pieceData.faceDowned)
      return

    if (bool) {
      this.pieceData.tapped = true
      this.sprite.setPipeline(Game.pipeline.grayScale)
    } else {
      this.pieceData.tapped = false
      this.sprite.resetPipeline()
      this.revitalize()
    }
  },
  takeDamage(attacker, damage) {
    // face up
    if (this.pieceData.faceDowned)
      this.faceDownRaw(false)

    // update health
    this.pieceData.health = Math.max(this.pieceData.health - damage, 0)

    // invoke effect
    EffectEvent.invoke('onTakeDamage', this.card, attacker)

    // check death
    if (this.pieceData.health == 0) {
      // TODO: move this card to the graveyard
      CardZoneBoard.removePermanentAt(this.pieceData.pos.x, this.pieceData.pos.y)

      // update ui
      if (this.card == Match.selectedTile.getPermanent())
        CardInfoUI.hide()
    } else {
      // update ui
      if (this.card == Match.selectedTile.getPermanent()) {
        CardInfoUI.updateInfo(this.card)
      }
    }
  },
  doAttack(target) {
    // invoke effect
    EffectEvent.invoke('onAttack', this.card, target.card)
    EffectEvent.invoke('onDealDamage', this.card, target.card)

    // deal damage to target
    target.takeDamage(this.card, this.pieceData.attack)

    // tap this card piece
    UserAction.execute(CmdUnitTap, this.card)

    // target counter attack
    if (target.pieceData.health > 0 && !target.pieceData.tapped) {
      UserAction.execute(CmdUnitCounterAttack, target.card, this.card)
    }
  },
  doCounterAttack(target) {
    // invoke effect
    EffectEvent.invoke('onCounterAttack', this.card, target.card)
    EffectEvent.invoke('onDealDamage', this.card, target.card)

    // deal damage to target
    target.takeDamage(this.card, this.pieceData.attack)
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
