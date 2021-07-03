// TODO: make card info ui
class CardInfoUI {
  static instance = null;

  constructor() {
    this.bg = Game.spawn.rectangle(
      0, 0,
      CardPaper.width, CardPaper.height,
      0xffffff
    ).setOrigin(0.5, 0);

    this.cardName = Game.spawn.text(
      0, 30,
      "cardData.name",
      {
        font: '16px Arial',
        color: 'black',
        align: 'center',
      }
    ).setOrigin(0.5, 1);

    this.visual = Game.spawn.container(0, 0 [
      this.bg,
      this.cardName
    ]);
    this.visual.setPosition(-775, -190);
    Game.addToWorld(this.visual);

    CardInfoUI.instance = this;
  }

  static updateInfo(cardData) {
    CardInfoUI.instance.cardName.setText(cardData.name);
  }

  static show() {
    CardInfoUI.instance.visual.setVisible(true);
  }
  static hide() {
    CardInfoUI.instance.visual.setVisible(false);
  }
}