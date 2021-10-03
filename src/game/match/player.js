// TEST: Deck
const TestDeckP1 = {
  commander: 'ArgeonHighmayne',
  deck: [
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
}
const TestDeckP2 = {
  commander: 'RagnoraTheRelentless',
  deck: [
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
}


class Team {
  static None = 0
  static P1 = 1
  static P2 = 2
}

class Player {
  static startingHand = 5

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
    // TEST: get test deck
    const deckObj = this.team == Team.P1 ? TestDeckP1 : TestDeckP2

    // TODO: track commanders health and determine the game result
    // spawn commander
    this.commander = createCardPermanent(-1, this, deckObj.commander)

    // spawn deck
    for (let i in deckObj.deck)
      this.allCards.push(createCardPermanent(i, this, deckObj.deck[i]))

    // init deck
    this.cardZones.deck.cards = [...this.allCards]
    this.cardZones.deck.shuffle(40)
  }

  handInit() {
    let i = 0
    while (i++ < Player.startingHand) {
      this.cardZones.moveCard({
        source: 'deck',
        sourceIndex: this.cardZones.deck.high(),
        target: 'hand',
        targetIndex: this.cardZones.hand.length()
      })
    }
    this.handUI.init()
  }
  handDrawFromDeck(num = 1) {
    for (let i = 0; i < num; ++i) {
      if (this.cardZones.deck.length() < 1) {
        console.log('no more card in the deck!')
        break
      }
      this.cardZones.moveCard({
        source: 'deck',
        sourceIndex: this.cardZones.deck.high(),
        target: 'hand',
        targetIndex: this.cardZones.hand.length()
      })
    }
    this.handUI.update()
  }
  handSummon(x, y, card) {
    for (let i = 0; i < this.cardZones.hand.cards.length; ++i) {
      if (card == this.cardZones.hand.cards[i]) {
        this.cardZones.moveCard({
          source: 'hand',
          sourceIndex: i,
          target: 'permanents',
          targetIndex: tileGrid.coordToIndex(x, y)
        })
        card.cardPaper.hide()
        card.cardPiece.setPos(x, y)
        card.cardPiece.show()
      }
    }
    this.handUI.update()
  }
}

class HistPlayer {
  constructor() {
    this.cardZones = new HistCardZonePlayer()
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