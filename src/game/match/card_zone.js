// TODO: make card zone

class CardZone {
  constructor() {
    this.cards = []
  }
  shuffle(count) {
    shuffleArray(this.cards, count)
  }
  pushTo(target, srcIndex) {
    target.cards.push(this.cards[srcIndex])
    this.cards.splice(srcIndex, 1)
    return target.cards[target.cards.length - 1]
  }
  insertTo(target, srcIndex, targetIndex) {
    target.cards.splice(targetIndex, 0, this.cards[srcIndex])
    this.cards.splice(srcIndex, 1)
    return target.cards[targetIndex]
  }
}

class CardZoneHand extends CardZone {

}

class CardZones {
  constructor() {
    CardZones.board = {
      permanents: new CardZone(),
      spells: new CardZone()
    }

    this.deck = new CardZone()
    this.manaDeck = new CardZone()
    this.extraDeck = new CardZone()

    this.mana = new CardZone()
    this.hand = new CardZone()

    this.gaveyard = new CardZone()
    this.banish = new CardZone()
    this.limbo = new CardZone()
  }
}