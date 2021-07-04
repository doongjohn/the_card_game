class Team {
  static None = 0;
  static P1 = 1;
  static P2 = 2;
}

class Player {
  constructor(team) {
    this.team = team;
    this.commander = null;
    this.deck = [];
    this.hand = [];
    this.selectedTile = null;
    this.selectedCard = null;
  }

  initHand() {
    this.addToHand(
      new CardPermanent(this.team, 'RagnoraTheRelentless'),
      new CardPermanent(this.team, 'ZirAnSunforge'),
      new CardPermanent(this.team, 'RagnoraTheRelentless'),
      new CardPermanent(this.team, 'ZirAnSunforge'),
      new CardPermanent(this.team, 'RagnoraTheRelentless'),
      new CardPermanent(this.team, 'ZirAnSunforge'),
      new CardPermanent(this.team, 'RagnoraTheRelentless'),
      new CardPermanent(this.team, 'ZirAnSunforge'),
    );
  }
  addToHand() {
    if (arguments.length > 1)
      this.hand.push(...arguments);
    else
      this.hand.push(arguments[0]);
  }
  removeFromHand(card) {
    let i = 0;
    for (const c of this.hand) {
      if (card == c) {
        this.hand[i].cardPaper.hide();
        this.hand.splice(i, 1);
        break;
      }
      ++i;
    }
  }
  showHandUi() {
    for (const card of this.hand)
      card.cardPaper.show();
  }
  hideHandUi() {
    for (const card of this.hand)
      card.cardPaper.hide();
  }
  updateHandUi() {
    // TODO: add tween
    const maxCard = 5;
    const width = CardPaper.width + 10;
    const maxWidth = width * (maxCard - 1);
    const y = 515;
    const { startPos, gap } = this.hand.length < maxCard ?
      {
        startPos: -width / 2 * (this.hand.length - 1),
        gap: width
      } :
      {
        startPos: -maxWidth / 2,
        gap: maxWidth / (this.hand.length - 1)
      };

    // align cards
    let i = 0;
    for (const card of this.hand) {
      card.spawnable = true;
      card.cardPaper.show().setPosition(startPos + (gap * i++), y);
    }
  }
}