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
];
const TestDeckP2 = [
  'RazorcragGolem',
  'RazorcragGolem',
  'RazorcragGolem',
  'RazorcragGolem',
  'Rex',
  'Rex',
  'Rex',
  'Rex',
];


class Team {
  static None = 0;
  static P1 = 1;
  static P2 = 2;
}

class Player {
  constructor(team) {
    this.team = team;
    this.commander = null;

    this.allCards = [];
    this.deck = [];
    this.hand = [];

    this.selectedTile = null;
    this.selectedCard = null;

    this.handUI = new HandUI(this);
  }

  cardInit() {
    // TODO: get cards from user deck
    let i = 0;
    for (let spriteAssetName of this.team == Team.P1 ? TestDeckP1 : TestDeckP2)
      this.allCards.push(createCardPermanent(i++, this, spriteAssetName));

    // copy all cards to deck
    this.deck = [...this.allCards];
    shuffleArray(this.deck, 10);
  }

  handInit() {
    // TODO: pick some cards from the top of the deck
    // this.handUiGroup = Game.spawn.group();
    const num = 8;
    for (let i = 0; i < num; ++i) {
      this.deck[i].cardPaper.inputArea.setDepth(i);
      Layer.moveTo(Layer.UI, this.deck[i].cardPaper.visual, i);
      this.hand.push(this.deck[i]);
    }
    this.handUI.init();
  }
  handAdd(...cards) {
    // TODO: from where? deck?
    // make transfer cards function instead
    for (let card of cards) {
      card.cardPaper.inputArea.setDepth(this.hand.length - 1);
      Layer.moveTo(Layer.UI, card.cardPaper.visual, this.hand.length - 1);
      this.hand.push(card);
    }
    this.handUI.update();
  }
  handRemove(...cards) {
    // TODO: to where? graveyard?
    // make transfer cards function instead
    for (const i in this.hand) {
      if (cards.includes(this.hand[i])) {
        this.hand[i].cardPaper.hide();
        this.hand.splice(i, 1);
      }
    }
    this.handUI.update();
  }
}

class PlayerData {
  constructor() {
    this.p1_deck = [...Match.player1.deck];
    this.p2_deck = [...Match.player2.deck];
    this.p1_hand = [...Match.player1.hand];
    this.p2_hand = [...Match.player2.hand];
  }
  restore() {
    Match.player1.deck = this.p1_deck;
    Match.player2.deck = this.p2_deck;
    Match.player1.hand = this.p1_hand;
    Match.player2.hand = this.p2_hand;

    // update ui
    Match.turnPlayer.handUI.update();
  }
}

class HandUI {
  // TODO: make both players hand visible

  static maxCard = 5;
  static y = 530;

  constructor(player) {
    this.player = player;
    this.width = 250 + 10; // CardPaper width + gap
    this.maxWidth = this.width * (HandUI.maxCard - 1);
  }

  getAlignData() {
    const length = this.player.hand.length;
    return length <= HandUI.maxCard ?
      {
        startPos: -this.width / 2 * (length - 1),
        gap: this.width
      } :
      {
        startPos: -this.maxWidth / 2,
        gap: this.maxWidth / (length - 1)
      };
  }

  init() {
    // align cards
    const { startPos, gap } = this.getAlignData();
    let i = 0;
    for (const card of this.player.hand) {
      card.cardPaper.visual.x = startPos + (gap * i++);
      card.cardPaper.visual.y = HandUI.y;

      // FIXME: only one inputArea is working
      // TODO: make it work with tween
      card.cardPaper.inputArea.y = card.cardPaper.visual.parentContainer.y + card.cardPaper.visual.y;
      card.cardPaper.inputArea.x = card.cardPaper.visual.parentContainer.x + card.cardPaper.visual.x;
    }
  }
  show() {
    for (const card of this.player.hand) {
      card.cardPaper.show();
    }
  }
  hide() {
    for (const card of this.player.hand) {
      card.cardPaper.hide();
    }
  }
  update() {
    // align cards
    const { startPos, gap } = this.getAlignData();
    let i = 0;
    for (const card of this.player.hand) {
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
    if (this.player.hand.length <= HandUI.maxCard)
      return;

    const { startPos, gap } = {
      startPos: -this.maxWidth / 2,
      gap: this.maxWidth / (this.player.hand.length - 1)
    };
    const offset = this.width - gap;
    const startIndex = this.player.hand.indexOf(card) + 1;

    for (let i = startIndex; i < this.player.hand.length; ++i) {
      const card = this.player.hand[i];
      card.cardPaper.tween?.remove();
      card.cardPaper.tween = Game.scene.tweens.add({
        // tween options
        targets: card.cardPaper.visual,
        repeat: 0,
        ease: 'Sine.Out',
        duration: 200,

        // tween props
        // x: { from: card.cardPaper.visual.x, to: startPos + offset + (gap * i) },

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