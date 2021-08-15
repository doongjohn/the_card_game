// TODO: make card info ui
class CardInfoUI {
  static width = 350;
  static height = 500;

  static bg = null;
  static cardName = null;
  static cardStats = null;
  static visual = null;

  static init() {
    CardInfoUI.bg = Game.spawn.rectangle(
      0, 0,
      CardInfoUI.width, CardInfoUI.height,
      0x182236
    ).setOrigin(0.5, 0);

    CardInfoUI.cardName = Game.spawn.text(
      0, 30,
      'card name',
      {
        font: '20px Play',
        align: 'center',
      }
    ).setOrigin(0.5, 1);

    CardInfoUI.cardStats = Game.spawn.text(
      -CardInfoUI.width / 2 + 10, 60,
      `⛨: - ⚔: -`,
      {
        font: '18px Play',
        align: 'left'
      }).setOrigin(0, 1);

    CardInfoUI.cardExplain = Game.spawn.text(
      -CardInfoUI.width / 2 + 10, 70,
      `blah blah blah blah blah blah blah blah blah blah blah blah`,
      {
        font: '18px Play',
        align: 'left',
        wordWrap: { width: CardInfoUI.width - 10 }
      }).setOrigin(0, 0);

    CardInfoUI.visual = Game.spawn.group().addMultiple([
      CardInfoUI.bg,
      CardInfoUI.cardName,
      CardInfoUI.cardStats,
      CardInfoUI.cardExplain,
    ]);

    CardInfoUI.visual.incXY(-765, -300);
    CardInfoUI.hide();

    // add to layer
    Game.addToWorld(Layer.UI, CardInfoUI.visual.getChildren());
  }

  static updateInfo(card) {
    CardInfoUI.cardName.setText(card.data.name);
    if (card.boardObj) {
      CardInfoUI.cardStats.setText(`⛨: ${card.boardObj.data.health} ⚔: ${card.boardObj.data.attack}`);
    } else {
      CardInfoUI.cardStats.setText(`⛨: ${card.data.health} ⚔: ${card.data.attack}`);
    }
    CardInfoUI.cardExplain.setText(card.data.text);
  }

  static show() {
    CardInfoUI.visual.setVisible(true);
  }
  static hide() {
    CardInfoUI.visual.setVisible(false);
  }
}