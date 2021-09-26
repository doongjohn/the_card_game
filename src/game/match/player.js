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
  'RazorcragGolem',
  'RazorcragGolem',
  'RazorcragGolem',
  'Rex',
  'Rex',
  'Rex',
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
    this.cardZones = new CardZonePlayer()
    this.handUI = new HandUI(this)
  }

  cardInit() {
    // spawn all cards
    const deckData = this.team == Team.P1 ? TestDeckP1 : TestDeckP2 // TEST: wip
    for (let i in deckData)
      this.allCards.push(createCardPermanent(i, this, deckData[i]))

    // init deck
    this.cardZones.deck.cards = [...this.allCards]
    this.cardZones.deck.shuffle(40)
  }

  handInit() {
    const startingCards = 5
    for (let i = 0; i < startingCards; ++i) {
      CardZone.moveCard({
        source: this.cardZones.deck,
        sourceIndex: this.cardZones.deck.high(),
        target: this.cardZones.hand,
        targetIndex: this.cardZones.hand.length()
      })
    }
    this.handUI.init()
  }
  handDraw(num = 1) {
    for (let i = 0; i < num; ++i) {
      if (this.cardZones.deck.length() < 1) {
        console.log('no more card in the deck!')
        break
      }
      CardZone.moveCard({
        source: this.cardZones.deck,
        sourceIndex: this.cardZones.deck.high(),
        target: this.cardZones.hand,
        targetIndex: this.cardZones.hand.length()
      })
    }
    this.handUI.update()
  }
  handRemove(...cards) {
    // TODO: to where? graveyard?
    // make transfer cards function instead
    for (const i in this.cardZones.hand.cards) {
      if (cards.includes(this.cardZones.hand.cards[i])) {
        this.cardZones.hand.cards[i].cardPaper.hide()
        this.cardZones.hand.cards.splice(i, 1)
      }
    }
    this.handUI.update()
  }
}

class UndoPlayer {
  constructor() {
    this.cardZones = new UndoCardZonePlayer()
  }
  undo() {
    this.cardZones.undo()
    Match.oppsPlayer.handUI.update()
    Match.turnPlayer.handUI.update()
    Match.oppsPlayer.handUI.hide()
    Match.turnPlayer.handUI.show()
  }
}

class HandUI {
  static maxCard = 5
  static y = 530

  constructor(player) {
    this.player = player
    this.cardZones = player.cardZones
    this.width = CardPaper.cardBg.width + 10; // CardPaper width + gap
    this.maxWidth = this.width * (HandUI.maxCard - 1)
  }

  getAlignData() {
    let length = this.cardZones.hand.cards.length - 1
    return length < HandUI.maxCard ?
      {
        startPos: -this.width / 2 * length,
        gap: this.width
      } :
      {
        startPos: -this.maxWidth / 2,
        gap: this.maxWidth / length
      }
  }

  init() {
    // align cards
    let { startPos, gap } = this.getAlignData()
    let i = 0
    for (let card of this.cardZones.hand.cards) {
      card.cardPaper.inputArea.setDepth(i)
      card.cardPaper.visual.x = startPos + (gap * i++)
      card.cardPaper.visual.y = HandUI.y
      card.cardPaper.resetInputAreaPos()
    }
  }
  show() {
    for (let card of this.cardZones.hand.cards)
      card.cardPaper.show()
  }
  hide() {
    for (let card of this.cardZones.hand.cards)
      card.cardPaper.hide()
  }
  update() {
    // align cards
    let { startPos, gap } = this.getAlignData()
    let i = 0
    for (let card of this.cardZones.hand.cards) {
      let cardPaper = card.cardPaper

      cardPaper.inputArea.setDepth(i)
      cardPaper.visual.y = HandUI.y
      Layer.moveTo(Layer.UI, cardPaper.visual, i)

      cardPaper.tween?.remove()
      cardPaper.tween = Game.scene.tweens.add({
        targets: cardPaper.visual,
        repeat: 0,
        duration: 200,
        ease: 'Cubic.Out',

        props: {
          x: { from: cardPaper.visual.x, to: startPos + (gap * i++) },
        },

        onUpdateParams: [this],
        onUpdate: function (tween) {
          cardPaper.resetInputAreaPos()
        },

        onCompleteParams: [this],
        onComplete: function (tween) {
          tween.remove()
          cardPaper.tween = null
        },
      })
    }
  }
}