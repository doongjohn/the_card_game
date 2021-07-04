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
      new CardPermanent(this.team, 'ZirAnSunforge'),
      new CardPermanent(this.team, 'ZirAnSunforge'),
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
      card.cardPaper.show();

      // set tween
      // FIXEME: hovering blocks tween
      if (card.cardPaper.tween) {
        card.cardPaper.tween.remove();
        card.cardPaper.tween = null;
      } else {
        card.cardPaper.tween = Game.scene.tweens.add({
          // tween options
          targets: card.cardPaper.visual,
          repeat: 0,
          ease: 'Cubic.Out',
          duration: 200,

          // tween props
          x: { from: card.cardPaper.visual.x, to: startPos + (gap * i++) },
          y: { from: card.cardPaper.visual.y, to: y },

          // on tween complete
          onCompleteParams: [this],
          onComplete: function (tween) {
            tween.remove();
            card.cardPaper.tween = null;
          },
        });
      }
    }
  }
}