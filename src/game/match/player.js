// TEST: Deck
const TestDeckP1 = [
  'ZirAnSunforge',
  'ZirAnSunforge',
  'ZirAnSunforge',
  'ZirAnSunforge',
  'Sojourner',
  'Sojourner',
  'Sojourner',
  'Sojourner',
  'KaleosXaan',
  'KaleosXaan',
  'KaleosXaan',
  'KaleosXaan',
]
const TestDeckP2 = [
  'RazorcragGolem',
  'RazorcragGolem',
  'RazorcragGolem',
  'RazorcragGolem',
  'Rex',
  'Rex',
  'Rex',
  'Rex',
]


class Team {
  static None = 0
  static P1 = 1
  static P2 = 2
}

class Player {
  constructor(team) {
    this.team = team
    this.commander = null
    this.mana = {
      fire: 0,
      water: 0,
      earth: 0,
      wind: 0,
      light: 0,
      darkness: 0,
    }

    this.allCards = []
    this.deck = []
    this.hand = []

    this.handUI = new HandUI(this)
  }

  cardInit() {
    // initialize cards and zones
    let i = 0
    for (let spriteAssetName of this.team == Team.P1 ? TestDeckP1 : TestDeckP2)
      this.allCards.push(createCardPermanent(i++, this, spriteAssetName))

    // copy all cards to deck
    this.deck = [...this.allCards]

    // shuffle deck
    shuffleArray(this.deck, 10)
  }

  handInit() {
    const num = 8
    for (let i = 0; i < num; ++i) {
      const card = this.deck.pop()
      card.cardPaper.inputArea.setDepth(i)
      Layer.moveTo(Layer.UI, card.cardPaper.visual, i)
      this.hand.push(card)
    }
    this.handUI.init()
  }
  handDraw(num = 1) {
    for (let i = 0; i < num; ++i) {
      if (this.deck.length < 1) {
        console.log('no more card in the deck!')
        break
      }

      const card = this.deck.pop()
      const depth = this.hand[this.hand.length - 1].cardPaper.inputArea.depth + 1
      const displayIndex = Layer.getIndex(Layer.UI, this.hand[this.hand.length - 1].cardPaper.visual) + 1
      card.cardPaper.inputArea.setDepth(depth)
      Layer.moveTo(Layer.UI, card.cardPaper.visual, displayIndex)
      card.cardPaper.visual.y = HandUI.y
      this.hand.push(card)
    }
    this.handUI.update()
  }
  handAdd(...cards) {
    // TODO: from where? deck?
    // make transfer cards function instead
    for (let card of cards) {
      const depth = this.hand[this.hand.length - 1].cardPaper.inputArea.depth + 1
      const displayIndex = Layer.getIndex(Layer.UI, this.hand[this.hand.length - 1].cardPaper.visual) + 1
      card.cardPaper.inputArea.setDepth(depth)
      Layer.moveTo(Layer.UI, card.cardPaper.visual, displayIndex)
      card.cardPaper.visual.y = HandUI.y
      this.hand.push(card)
    }
    this.handUI.update()
  }
  handRemove(...cards) {
    // TODO: to where? graveyard?
    // make transfer cards function instead
    for (const i in this.hand) {
      if (cards.includes(this.hand[i])) {
        this.hand[i].cardPaper.hide()
        this.hand.splice(i, 1)
      }
    }
    this.handUI.update()
  }
}

class PlayerData {
  constructor() {
    this.p1_deck = [...Match.player1.deck]
    this.p2_deck = [...Match.player2.deck]
    this.p1_hand = [...Match.player1.hand]
    this.p2_hand = [...Match.player2.hand]
  }
  restore() {
    Match.player1.deck = this.p1_deck
    Match.player2.deck = this.p2_deck
    Match.player1.hand = this.p1_hand
    Match.player2.hand = this.p2_hand

    // update ui
    Match.turnPlayer.handUI.update()
  }
}

class HandUI {
  static maxCard = 5
  static y = 530

  constructor(player) {
    this.player = player
    this.width = 250 + 10; // CardPaper width + gap
    this.maxWidth = this.width * (HandUI.maxCard - 1)
  }

  getAlignData() {
    const length = this.player.hand.length
    return length <= HandUI.maxCard ?
      {
        startPos: -this.width / 2 * (length - 1),
        gap: this.width
      } :
      {
        startPos: -this.maxWidth / 2,
        gap: this.maxWidth / (length - 1)
      }
  }

  init() {
    // align cards
    const { startPos, gap } = this.getAlignData()
    let i = 0
    for (const card of this.player.hand) {
      card.cardPaper.visual.x = startPos + (gap * i++)
      card.cardPaper.visual.y = HandUI.y
      card.cardPaper.resetInputAreaPos()
    }
  }
  show() {
    for (const card of this.player.hand) {
      card.cardPaper.show()
    }
  }
  hide() {
    for (const card of this.player.hand) {
      card.cardPaper.hide()
    }
  }
  update() {
    // align cards
    const { startPos, gap } = this.getAlignData()
    let i = 0
    for (const card of this.player.hand) {
      const cardPaper = card.cardPaper
      cardPaper.show()
      cardPaper.tween?.remove()
      cardPaper.tween = Game.scene.tweens.add({
        // tween options
        targets: cardPaper.visual,
        repeat: 0,
        duration: 200,
        ease: 'Cubic.Out',

        // tween props
        props: {
          x: { from: cardPaper.visual.x, to: startPos + (gap * i++) },
        },

        // on tween update
        onUpdateParams: [this],
        onUpdate: function (tween) {
          cardPaper.resetInputAreaPos()
        },

        // on tween complete
        onCompleteParams: [this],
        onComplete: function (tween) {
          tween.remove()
          cardPaper.tween = null
        },
      })
    }
  }
}