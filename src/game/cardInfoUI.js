// TODO: make card info ui
class CardInfoUI {
  static bg = null;
  static cardName = null;
  static visual = null;

  static init() {
    CardInfoUI.bg = Game.spawn.rectangle(
      0, 0,
      CardPaper.width, CardPaper.height,
      0xffffff
    ).setOrigin(0.5, 0);

    CardInfoUI.cardName = Game.spawn.text(
      0, 30,
      "cardData.name",
      {
        font: '16px Arial',
        color: 'black',
        align: 'center',
      }
    ).setOrigin(0.5, 1);

    CardInfoUI.visual = Game.spawn.container(0, 0 [
      CardInfoUI.bg,
      CardInfoUI.cardName
    ]);
    CardInfoUI.visual.setPosition(-775, -190);
    CardInfoUI.hide();

    Layer.ui.add(CardInfoUI.visual);
  }

  static updateInfo(cardData) {
    CardInfoUI.cardName.setText(cardData.name);
  }

  static show() {
    CardInfoUI.visual.setVisible(true);
  }
  static hide() {
    CardInfoUI.visual.setVisible(false);
  }
}