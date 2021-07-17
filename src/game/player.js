class Team {
  static None = 0;
  static P1 = 1;
  static P2 = 2;
}

class Player {
  constructor(team) {
    this.team = team;
    this.commander = null;
    this.allCards = []; // this is used when user undo and the system wants the old card because cadrIndex will not change
    this.deck = [];
    this.hand = [];
    this.selectedTile = null;
    this.selectedCard = null;
    this.handUI = new HandUI(this.hand);
  }

  cardInit() {
    // TODO: read cards from user deck
    let i = 0;
    this.allCards.push(
      new CardPermanent(this.team, 'RagnoraTheRelentless', i++),
      new CardPermanent(this.team, 'ZirAnSunforge', i++),
      new CardPermanent(this.team, 'RagnoraTheRelentless', i++),
      new CardPermanent(this.team, 'ZirAnSunforge', i++),
      new CardPermanent(this.team, 'RagnoraTheRelentless', i++),
      new CardPermanent(this.team, 'ZirAnSunforge', i++),
      new CardPermanent(this.team, 'RagnoraTheRelentless', i++),
      new CardPermanent(this.team, 'ZirAnSunforge', i++),
      new CardPermanent(this.team, 'ZirAnSunforge', i++),
      new CardPermanent(this.team, 'ZirAnSunforge', i++),
      new CardPermanent(this.team, 'RagnoraTheRelentless', i++)
    );

    // copy all cards to deck
    // TODO: shuffle the cards
    this.deck.push(...this.allCards);
  }

  handInit() {
    // TODO: pick some cards from the top of the deck
    this.hand.push(...this.deck);
    this.handUI.init();
  }
  handAdd() {
    if (arguments.length > 1)
      this.hand.push(...arguments);
    else
      this.hand.push(arguments[0]);
    this.handUI.update();
  }
  handRemove(card) {
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

class PlayerData {
  constructor() {
    this.p1_deck = [...Match.player1.deck];
    this.p1_hand = [...Match.player1.hand];
    this.p2_deck = [...Match.player2.deck];
    this.p2_hand = [...Match.player2.hand];
  }
  restore() {
    Match.player1.deck = [this.p1_deck];
    Match.player2.deck = [this.p2_deck];
    Match.player1.hand = [this.p1_hand];
    Match.player2.hand = [this.p2_hand];
    Match.player1.handUI.update();
    Match.player2.handUI.update();
  }
}

class HandUI {
  static maxCard = 5;
  static y = 530;

  constructor(hand) {
    this.hand = hand;
    this.width = 250 + 10; // CardPaper width + gap
    this.maxWidth = this.width * (HandUI.maxCard - 1);
  }

  getAlignData() {
    return this.hand.length <= HandUI.maxCard ?
      {
        startPos: -this.width / 2 * (this.hand.length - 1),
        gap: this.width
      } :
      {
        startPos: -this.maxWidth / 2,
        gap: this.maxWidth / (this.hand.length - 1)
      };
  }

  init() {
    // align cards
    const { startPos, gap } = this.getAlignData();
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
    // align cards
    const { startPos, gap } = this.getAlignData();
    let i = 0;
    for (const card of this.hand) {
      card.spawnable = true;
      card.cardPaper.show();
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
    const offset = this.width - gap;
    const startIndex = this.hand.indexOf(card) + 1;

    for (let i = startIndex; i < this.hand.length; ++i) {
      const card = this.hand[i];
      card.cardPaper.tween?.remove();
      card.cardPaper.tween = Game.scene.tweens.add({
        // tween options
        targets: card.cardPaper.visual,
        repeat: 0,
        ease: 'Sine.Out',
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
  }
}