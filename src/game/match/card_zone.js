// TODO: make card zone

class CardZone {
  constructor() {
    this.cards = [];
  }
  pushTo(target, index) {
    target.push(this.cards[index]);
    this.cards.splice(index, 1);
  }
  insertTo(target, targetIndex, index) {
    target.splice(targetIndex, 0, this.cards[index]);
    this.cards.splice(index, 1);
  }
}

class CardZones {
  constructor() {
    this.board = {
      permanents: new CardZone(),
      spells: new CardZone()
    };
    this.deck = new CardZone();
    this.mana = new CardZone();
    this.manaDeck = new CardZone();
    this.extraDeck = new CardZone();
    this.hand = new CardZone();
    this.gaveyard = new CardZone();
    this.banish = new CardZone();
    this.limbo = new CardZone();
    this.timeStream = new CardZone();
  }
}

class CardZonesData {
  constructor() {

  }
  restore() {

  }
}