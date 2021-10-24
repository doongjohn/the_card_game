class CardAssetData {
  // this is an asset data for this card
  // this data must not change
  constructor({
    spriteName
  } = {}) {
    this.spriteName = spriteName
  }
}
class CardData {
  // this is an base data for this card
  // this data must not change

  constructor({
    index,
    owner,
    type,
    name,
    desc,
  } = {}) {
    this.index = index
    this.owner = owner
    this.type = type
    this.name = name
    this.desc = desc
  }
}

class CardPaper {
  // this is a paper that exists in the deck, hand, etc...
  // card paper visual is hidden by defualt

  // TODO: card paper has it's own data (only in hand)
  // players can apply effects on a card it self

  static cardBg = {
    width: 250,
    height: 350,
    color: 0x1e2a42
  }
  static cardDescBox = {
    margin: 6,
    width: CardPaper.cardBg.width - 6 * 2,
    height: 160,
    color: 0x182236
  }

  constructor(assetData, data) {
    // card art
    /** @type SpriteCardArt */
    this.cardArt = new SpriteCardArt(0, 0, assetData.spriteName)
      .setScale(2.0)
      .setOrigin(0.5, 1)

    // play card art animation
    Game.playAnimation(this.cardArt, 'CardArt:Idle:' + assetData.spriteName)

    // card background
    /** @type Phaser.GameObjects.Rectangle */
    this.cardBg = Game.spawn.rectangle(
      0, 0,
      CardPaper.cardBg.width,
      CardPaper.cardBg.height,
      CardPaper.cardBg.color
    ).setStrokeStyle(3, CardPaper.cardDescBox.color, 1)

    // description box
    /** @type Phaser.GameObjects.Rectangle */
    this.cardDescBox = Game.spawn.rectangle(
      0, CardPaper.cardBg.height / 2 - CardPaper.cardDescBox.margin,
      CardPaper.cardDescBox.width,
      CardPaper.cardDescBox.height,
      CardPaper.cardDescBox.color
    ).setOrigin(0.5, 1)

    // card name
    /** @type Phaser.GameObjects.Text */
    this.cardNameText = Game.spawn.text(0, 0, data.name, {
      font: '18px Play',
      align: 'center'
    }).setOrigin(0.5, 1)

    // card description
    /** @type Phaser.GameObjects.Text */
    this.cardDescText = Game.spawn.text(
      CardPaper.cardDescBox.margin - (CardPaper.cardDescBox.width / 2), 15,
      data.desc,
      {
        font: '16px Play',
        align: 'left',
        wordWrap: { width: CardPaper.cardDescBox.width - CardPaper.cardDescBox.margin }
      }
    )

    // container for this card paper
    /** @type Phaser.GameObjects.Container */
    this.visual = Game.spawn.container(0, 0, [
      this.cardBg,
      this.cardArt,
      this.cardNameText,
      this.cardDescBox,
      this.cardDescText
    ])
    Game.addToWorld(Layer.UI, this.visual)

    // tween
    /** @type Phaser.Tweens */
    this.tween = null

    /**
     * @type {{
     *  onHoverEnter: function,
     *  onHoverExit: function,
     *  onClick: function,
     * }}
     * */
    this.interaction = null

    /** @type Phaser.GameObjects.Zone */
    this.inputArea = Game.spawn.zone(0, 0, CardPaper.cardBg.width, CardPaper.cardBg.height)
    this.inputArea.setInteractive()
    this.inputArea.on('pointerover', () => { this.interaction?.onHoverEnter() })
    this.inputArea.on('pointerout', () => { this.interaction?.onHoverExit() })
    this.inputArea.on('pointerdown', () => { this.interaction?.onClick() })

    // hide by default
    this.hide()
  }
  hide() {
    this.inputArea.disableInteractive()
    this.visual.setVisible(false)
  }
  show() {
    this.inputArea.setInteractive()
    this.visual.setVisible(true)
  }
  resetInputAreaPos() {
    this.inputArea.y = this.visual.parentContainer.y + this.visual.y
    this.inputArea.x = this.visual.parentContainer.x + this.visual.x
  }
}

class CardPieceData {
  constructor(data) {
    this.owner = data.owner     // this can not change
    this.team = data.owner.team // but this may change
    this.tapped = false
    this.faceDowned = false
    this.pos = null
  }
  clone() {
    // this is for cloning dynamically added data
    return compose(new CardPieceData(this), this)
  }
}
class CardPiece {
  // this is an piece object that exists on the board

  constructor(card, pieceData) {
    this.card = card
    this.pieceData = pieceData

    // sprite
    /** @type SpriteCardArt */
    this.sprite = new SpriteCardArt(0, 0, card.assetData.spriteName)
    this.sprite.setScale(2.0)
    this.sprite.setOrigin(0.5, 1 - 30 / this.sprite.height)

    // add sprite to world
    let layer = null
    switch (card.type) {
      // TODO: make other layers
      case 'permanent':
        layer = Layer.Permanent
        break
      default:
        layer = Layer.Permanent
    }
    Game.addToWorld(layer, this.sprite)

    // play animation
    Game.playAnimation(this.sprite, `CardArt:Idle:${card.assetData.spriteName}`)

    /** @type Phaser.Tweens */
    this.tween = null

    // init visual
    this.hide()
    this.visualUpdate()
  }

  hide() {
    this.sprite.setVisible(false)
  }
  show() {
    this.sprite.setVisible(true)
  }
  visualRemoveTween() {
    this.tween?.remove()
    this.tween = null
  }
  visualUpdateTeam() {
    this.sprite.flipX = this.pieceData.owner.team != Team.P1
  }
  visualUpdatePos() {
    let pos = this.pieceData.pos
    if (!pos) return

    this.visualRemoveTween()

    let worldPos = tileGrid.coordToWorldPos(pos.x, pos.y)
    this.sprite.x = worldPos.x
    this.sprite.y = worldPos.y

    if (this.cardBackSprite) {
      this.cardBackSprite.x = this.sprite.x
      this.cardBackSprite.y = this.sprite.y
    }
  }
  visualUpdate() {
    this.visualUpdateTeam()
    this.visualUpdatePos()
  }

  resetStats() {
    this.pieceData.health = this.card.data.health
    this.pieceData.attack = this.card.data.attack
    this.pieceData.curMoveCount = 0
  }
  isActiveTurn() {
    return this.pieceData.owner.team == Match.turn
  }
  resetTeam() {
    this.pieceData.owner = this.card.data.owner
  }
  setTeam(team) {
    this.pieceData.owner = team == Team.P1 ? Match.player1 : Match.player2
    this.visualUpdateTeam()
  }
  setPos(x, y) {
    this.pieceData.pos = { x: x, y: y }
  }

  tap() {
    if (!this.pieceData.faceDowned) {
      this.pieceData.tapped = true
      this.sprite.setPipeline(Game.pipeline.grayScale)
    }
  }
  untap() {
    if (!this.pieceData.faceDowned) {
      this.pieceData.tapped = false
      this.sprite.resetPipeline()
    }
  }
  setTap(bool) {
    if (bool)
      this.tap()
    else
      this.untap()
  }

  #visualFaceDownInit() {
    this.hide()
    if (!this.cardBackSprite) {
      this.cardBackSprite = Game.spawn.sprite(0, 0, 'CardBackDefault').setOrigin(0.5, 0.5).setScale(0.16)
      Game.addToWorld(Layer.Permanent, this.cardBackSprite)
    }
    this.cardBackSprite.x = this.sprite.x
    this.cardBackSprite.y = this.sprite.y
    this.cardBackSprite.setVisible(true)
  }
  #visualFaceDownDeinit() {
    this.show()
    this.cardBackSprite?.setVisible(false)
  }

  faceDown() {
    this.resetStats()
    this.tap()
    this.pieceData.faceDowned = true
    this.#visualFaceDownInit()

    // update ui
    if (Match.selectedTile && this.card == Match.selectedTile.getPermanent()) {
      CardInfoUI.update(this.card)
    }
  }
  faceUp() {
    this.pieceData.faceDowned = false
    this.#visualFaceDownDeinit()

    // update ui
    if (Match.selectedTile && this.card == Match.selectedTile.getPermanent()) {
      CardInfoUI.update(this.card)
    }
  }
  setFaceDown(bool) {
    if (bool)
      this.faceDown()
    else
      this.faceUp()
  }

  summon() {
    // NOTE: this is a normal summon

    // TODO: make summon

    // invoke on summon event

    // update ui
    if (Match.selectedTile && this.card == Match.selectedTile.getPermanent()) {
      CardInfoUI.update(this.card)
    }
  }
  faceUpSummon() {
    if (this.pieceData.faceDowned) {
      this.faceUp()
      this.summon()
    }
  }
  effectSummon() {
    // TODO: make effect summon
  }
}

class Card {
  // this is an object that conatians all the data and gameobjects

  constructor(assetData, data) {
    this.assetData = assetData
    this.data = data
  }

  createCardPaper() {
    this.cardPaper = new CardPaper(this.assetData, this.data)
  }
  composeCardPaper(...mixins) {
    this.cardPaper = compose(this.cardPaper, ...mixins)
  }

  createCardPiece() {
    this.cardPiece = new CardPiece(this, new CardPieceData(this.data))
  }
  composeCardPiece(...mixins) {
    this.cardPiece = compose(this.cardPiece, ...mixins)
  }
  composeCardPieceData(...mixins) {
    this.cardPiece.pieceData = compose(this.cardPiece.pieceData, ...mixins)
  }
}