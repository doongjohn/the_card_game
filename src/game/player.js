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

    this.handUI = new HandUI(this);
  }

  initHand() {
    this.hand.push(
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
    this.handUI.init();
  }
  addToHand() {
    if (arguments.length > 1)
      this.hand.push(...arguments);
    else
      this.hand.push(arguments[0]);
    this.handUI.update();
  }
  removeFromHand(card) {
    let i = 0;
    for (const c of this.hand) {
      if (card == c) {
        this.hand[i].cardPaper.hide();
        // send this card to some container
        this.hand.splice(i, 1);
        break;
      }
      ++i;
    }
    this.handUI.update();
  }
}

class HandUI {
  static maxCard = 5;
  static y = 530;

  constructor(player) {
    this.player = player;
    this.hand = player.hand;
    this.width = 250 + 10; // CardPaper width + gap
    this.maxWidth = this.width * (HandUI.maxCard - 1);
  }

  init() {
    const { startPos, gap } = this.hand.length <= HandUI.maxCard ?
      {
        startPos: -this.width / 2 * (this.hand.length - 1),
        gap: this.width
      } :
      {
        startPos: -this.maxWidth / 2,
        gap: this.maxWidth / (this.hand.length - 1)
      };

    // align cards
    let i = 0;
    for (const card of this.hand) {
      card.spawnable = true;
      card.cardPaper.show();
      card.cardPaper.visual.x = startPos + (gap * i++);
      card.cardPaper.visual.y = HandUI.y;
    }
  }
  show() {
    for (const card of this.hand)
      card.cardPaper.show();
  }
  hide() {
    for (const card of this.hand)
      card.cardPaper.hide();
  }
  update() {
    const { startPos, gap } = this.hand.length <= HandUI.maxCard ?
      {
        startPos: -this.width / 2 * (this.hand.length - 1),
        gap: this.width
      } :
      {
        startPos: -this.maxWidth / 2,
        gap: this.maxWidth / (this.hand.length - 1)
      };

    // align cards
    let i = 0;
    for (const card of this.hand) {
      card.spawnable = true;
      card.cardPaper.show();

      // set tween
      card.cardPaper.tween?.remove();
      card.cardPaper.tween = Game.scene.tweens.add({
        // tween options
        targets: card.cardPaper.visual,
        repeat: 0,
        ease: 'Cubic.Out',
        duration: 200,

        // tween props
        x: { from: card.cardPaper.visual.x, to: startPos + (gap * i++) },

        // on tween complete
        onCompleteParams: [this],
        onComplete: function (tween) {
          tween.remove();
          card.cardPaper.tween = null;
        },
      });
    }
  }
  focusCard(card) {
    if (this.hand.length <= HandUI.maxCard)
      return;

    const { startPos, gap } = {
      startPos: -this.maxWidth / 2,
      gap: this.maxWidth / (this.hand.length - 1)
    };

    function tweenCard(card, i, offset) {
      card.cardPaper.tween?.remove();
      card.cardPaper.tween = Game.scene.tweens.add({
        // tween options
        targets: card.cardPaper.visual,
        repeat: 0,
        ease: 'Cubic.Out',
        duration: 200,

        // tween props
        x: { from: card.cardPaper.visual.x, to: startPos + offset + (gap * i) },

        // on tween complete
        onCompleteParams: [this],
        onComplete: function (tween) {
          tween.remove();
          card.cardPaper.tween = null;
        },
      });
    }

    const index = this.hand.indexOf(card);
    for (let i = 0; i < index; ++i)
      tweenCard(this.hand[i], i, -250 / 2);
    for (let i = index + 1; i < this.hand.length; ++i)
      tweenCard(this.hand[i], i, 250 / 2);
  }
}